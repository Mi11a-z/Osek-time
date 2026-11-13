"use client";

import { useState } from "react";
import Link from "next/link";
import { useModeration, removePost, blockUser } from "../../moderation";
import { PostMenu } from "../profile/PostMenu";
import { ReportDialog } from "./ReportDialog";
import Image from "next/image";
import { deleteLocalPost, useLocalData } from "../../data/local-store";
import { usePostInteractions } from "../../usePostInteractions";
import { usePostViews } from "../../usePostViews";
import { Comments } from "../Comments";
import { BackHeader } from "../ui/BackHeader";
import { PostActions } from "./PostActions";
import { ViewsCount } from "./ViewsCount";
import { AuthorAvatar } from "./AuthorAvatar";
import { PostAuthorLabel } from "./PostAuthorLabel";
import { useRouter } from "next/navigation";
import { renderTextWithHashtags } from "@/src/hashtag";


const detailAvatarClass = "[width:var(--avatars-detail-size)] [height:var(--avatars-detail-size)] [border-radius:var(--radii-round)] object-cover shrink-0";


export function PostDetail({ postId }: { postId: number }) {
  const router = useRouter();
  const { likes, isLiked, isSaved, comments, toggleLike, toggleSave, addComment, deleteComment } = usePostInteractions(postId);
  const views = usePostViews(postId, true); // true = засчитать просмотр
  const { posts, profile, ready: localReady, error } = useLocalData();
  const post = posts.find((item) => item.id === postId);
  const { ready, role, removed, blocked } = useModeration();
  const [reporting, setReporting] = useState(false);
  // Сохраняем прежнюю связь собственных публикаций с жалобами и блокировками.
  const authorId = post?.named ? (post.isOwn ? profile.name : post.author) : null;
  const authorHref = post?.named ? post.isOwn ? "/profile" : `/user/${encodeURIComponent(post.authorUsername ?? post.author.toLowerCase())}` : undefined;
  if (!ready || !localReady) return <main className="mx-auto [max-width:var(--layout-post-max-width)] [padding:var(--layout-post-padding)]"><BackHeader prefix="pd" /><p role="status" className="py-8 text-center text-muted">Загружаем публикацию…</p></main>;
  if (!post || removed.includes(post.id) || (authorId !== null && blocked.includes(authorId)) || (post.isOwn && (blocked.includes(profile.username) || blocked.includes(profile.name)))) {
    return <main className="mx-auto max-w-3xl p-6"><BackHeader prefix="pd" />{error && <p role="alert" className="mb-4 text-coral-deep">{error}</p>}<p>Публикация недоступна.</p></main>;
  }

  return (
    <main className="mx-auto [max-width:var(--layout-post-max-width)] [padding:var(--layout-post-padding)]">
      <BackHeader prefix="pd" />
      {error && <p role="alert" className="mb-4 rounded-xl bg-peach p-3 text-coral-deep">{error}</p>}

      <article className="[padding:var(--cards-detail-padding)] [border:var(--borders-strong)_solid_var(--ink)] [border-radius:var(--cards-detail-radius)] bg-surface max-[650px]:[padding:var(--cards-detail-padding-at650)]">
        <header className="mb-4 flex items-center gap-3.5">
          {post.named ? (
            <Link href={authorHref ?? "/profile"} aria-label={`Перейти в профиль ${post.author}`} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-coral"><AuthorAvatar className={detailAvatarClass} author={post.author} src={post.avatar} /></Link>
          ) : (
            <span className={`${detailAvatarClass} flex items-center justify-center bg-ink [color:var(--colors-white)] font-display [font-size:var(--font-sizes-heading)] [font-weight:var(--font-weights-bold)]`}>А</span>
          )}
          <div>
            <PostAuthorLabel author={post.author} named={post.named} username={post.authorUsername} href={authorHref} className="block [font-weight:var(--font-weights-heavy)] [font-size:var(--font-sizes-title-small)]" />
            <span className="block text-muted [font-size:var(--font-sizes-meta)]">{post.city} · {post.minutes} мин</span>
          </div>
          <PostMenu variant="header" onReport={() => setReporting(true)} onDelete={post.isOwn ? () => deleteLocalPost(post.id) : role === "admin" ? () => removePost(post.id) : undefined} deleteLabel={post.isOwn ? "Удалить публикацию" : "Удалить пост (админ)"} onBlockAuthor={role === "admin" && authorId ? () => blockUser(authorId) : undefined} />
        </header>

        <span className="inline-block px-3 py-1.5 [border-radius:var(--radii-tag)] bg-peach text-coral-deep [font-weight:var(--font-weights-bold)] [font-size:var(--font-sizes-meta)]"># {post.city}</span>
        {renderTextWithHashtags(post.text, (tag) => router.push(`/?tag=${encodeURIComponent(tag)}`))}
        {post.question && <p className="mt-3 font-display [font-size:var(--font-sizes-title)]">{post.question}</p>}

        {post.image && (
          <Image
            className="mt-[18px] block h-auto w-full [border-radius:var(--radii-input)]"
            src={post.image}
            alt={post.imageAlt ?? ""}
            width={2172}
            height={724}
            sizes="(max-width: 800px) 100vw, 900px"
          />
        )}

        <PostActions
          likes={likes}
          isLiked={isLiked}
          isSaved={isSaved}
          commentCount={comments.length}
          onLike={toggleLike}
          onSave={toggleSave}
          commentsHref="#post-comments"
          showMore={false}
          separated
        />
        <div className="mt-2 flex justify-end">
          <ViewsCount count={views} />
        </div>
      </article>

      {reporting && <ReportDialog post={{ postId: post.id, postText: post.text, postAuthor: post.author, authorId }} onClose={() => setReporting(false)} />}
      <div id="post-comments">
        <Comments variant="detail" comments={comments} onAdd={addComment} onDelete={deleteComment} />
      </div>
    </main>
  );
}