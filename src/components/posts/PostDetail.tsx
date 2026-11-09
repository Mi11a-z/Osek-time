"use client";

import { useState } from "react";
import { useModeration, removePost, blockUser } from "../../moderation";
import { PostMenu } from "../profile/PostMenu";
import { ReportDialog } from "./ReportDialog";
import Image from "next/image";
import { deleteLocalPost, useLocalData } from "../../data/local-store";
import { usePostInteractions } from "../../usePostInteractions";
import { Comments } from "../Comments";
import { BackHeader } from "../ui/BackHeader";
import { PostActions } from "./PostActions";
import { AuthorAvatar } from "./AuthorAvatar";

const detailAvatarClass = "[width:var(--avatars-detail-size)] [height:var(--avatars-detail-size)] [border-radius:var(--radii-round)] object-cover shrink-0";

export function PostDetail({ postId }: { postId: number }) {
  const { likes, isLiked, isSaved, comments, toggleLike, toggleSave, addComment, deleteComment } = usePostInteractions(postId);
  const { posts, profile, ready: localReady, error } = useLocalData();
  const post = posts.find((item) => item.id === postId);

  const { ready, role, removed, blocked } = useModeration();
  const [reporting, setReporting] = useState(false);
  // Сохраняем прежнюю связь собственных публикаций с жалобами и блокировками.
  const authorId = post?.named ? (post.isOwn ? profile.name : post.author) : null;
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
            <AuthorAvatar className={detailAvatarClass} author={post.author} src={post.avatar} />
          ) : (
            <span className={`${detailAvatarClass} flex items-center justify-center bg-ink [color:var(--colors-white)] font-display [font-size:var(--font-sizes-heading)] [font-weight:var(--font-weights-bold)]`}>А</span>
          )}
          <div>
            <span className="block [font-weight:var(--font-weights-heavy)] [font-size:var(--font-sizes-title-small)]">{post.isOwn && post.named ? "@" : ""}{post.author}</span>
            <span className="block text-muted [font-size:var(--font-sizes-meta)]">{post.city} · {post.minutes} мин</span>
          </div>
          <PostMenu variant="header" onReport={() => setReporting(true)} onDelete={post.isOwn ? () => deleteLocalPost(post.id) : role === "admin" ? () => removePost(post.id) : undefined} deleteLabel={post.isOwn ? "Удалить публикацию" : "Удалить пост (админ)"} onBlockAuthor={role === "admin" && authorId ? () => blockUser(authorId) : undefined} />
        </header>

        <span className="inline-block px-3 py-1.5 [border-radius:var(--radii-tag)] bg-peach text-coral-deep [font-weight:var(--font-weights-bold)] [font-size:var(--font-sizes-meta)]"># {post.city}</span>
        <p className={`mt-4 whitespace-pre-wrap [overflow-wrap:anywhere] ${post.question ? "font-display [font-size:var(--font-sizes-post-heading)] [font-weight:var(--font-weights-heavy)] leading-[1.15] max-[650px]:[font-size:var(--font-sizes-heading-large)]" : "[font-size:var(--font-sizes-title-small)] leading-[1.5]"}`}>{post.text}</p>
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
      </article>

      {reporting && <ReportDialog post={{ postId: post.id, postText: post.text, postAuthor: post.author, authorId }} onClose={() => setReporting(false)} />}
      <div id="post-comments">
        <Comments variant="detail" comments={comments} onAdd={addComment} onDelete={deleteComment} />
      </div>
    </main>
  );
}
