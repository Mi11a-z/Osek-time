"use client";

import Image from "next/image";
import type { Post } from "../../data/posts";
import { usePostInteractions } from "../../usePostInteractions";
import { Comments } from "../Comments";
import { BackHeader } from "../ui/BackHeader";
import { PostActions } from "./PostActions";
import { AuthorAvatar } from "./AuthorAvatar";

const detailAvatarClass = "[width:var(--avatars-detail-size)] [height:var(--avatars-detail-size)] [border-radius:var(--radii-round)] object-cover shrink-0";

export function PostDetail({ post }: { post: Post }) {
  const { likes, isLiked, isSaved, comments, toggleLike, toggleSave, addComment, deleteComment } = usePostInteractions(post.likes, post.comments);

  return (
    <main className="mx-auto [max-width:var(--layout-post-max-width)] [padding:var(--layout-post-padding)]">
      <BackHeader prefix="pd" />

      <article className="[padding:var(--cards-detail-padding)] [border:var(--borders-strong)_solid_var(--ink)] [border-radius:var(--cards-detail-radius)] bg-surface max-[650px]:[padding:var(--cards-detail-padding-at650)]">
        <header className="mb-4 flex items-center gap-3.5">
          {post.named ? (
            <AuthorAvatar className={detailAvatarClass} author={post.author} src={post.avatar} />
          ) : (
            <span className={`${detailAvatarClass} flex items-center justify-center bg-ink [color:var(--colors-white)] font-display [font-size:var(--font-sizes-heading)] [font-weight:var(--font-weights-bold)]`}>А</span>
          )}
          <div>
            <span className="block [font-weight:var(--font-weights-heavy)] [font-size:var(--font-sizes-title-small)]">{post.author}</span>
            <span className="block text-muted [font-size:var(--font-sizes-meta)]">{post.city} · {post.minutes} мин</span>
          </div>
        </header>

        <span className="inline-block px-3 py-1.5 [border-radius:var(--radii-tag)] bg-peach text-coral-deep [font-weight:var(--font-weights-bold)] [font-size:var(--font-sizes-meta)]"># {post.city}</span>
        <p className={`mt-4 ${post.question ? "font-display [font-size:var(--font-sizes-post-heading)] [font-weight:var(--font-weights-heavy)] leading-[1.15] max-[650px]:[font-size:var(--font-sizes-heading-large)]" : "[font-size:var(--font-sizes-title-small)] leading-[1.5]"}`}>{post.text}</p>
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
          separated
        />
      </article>

      <div id="post-comments">
        <Comments variant="detail" comments={comments} onAdd={addComment} onDelete={deleteComment} />
      </div>
    </main>
  );
}
