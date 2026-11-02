"use client";

import Image from "next/image";
import type { Post } from "../../data/posts";
import { usePostInteractions } from "../../hooks/usePostInteractions";
import { Comments } from "../comments/Comments";
import { BackHeader } from "../ui/BackHeader";
import { PostActions } from "./PostActions";
import { AuthorAvatar } from "./AuthorAvatar";

export function PostDetail({ post }: { post: Post }) {
  const { likes, isLiked, isSaved, comments, toggleLike, toggleSave, addComment, deleteComment } = usePostInteractions(post.likes, post.comments);

  return (
    <main className="pd-shell">
      <BackHeader prefix="pd" />

      <article className="pd-card">
        <header className="pd-author">
          {post.named ? (
            <AuthorAvatar className="pd-avatar" author={post.author} src={post.avatar} />
          ) : (
            <span className="pd-avatar pd-avatar-anon">А</span>
          )}
          <div>
            <span className="pd-name">{post.author}</span>
            <span className="pd-meta">{post.city} · {post.minutes} мин</span>
          </div>
        </header>

        <span className="pd-tag"># {post.city}</span>
        <p className={post.question ? "pd-text pd-text-big" : "pd-text"}>{post.text}</p>
        {post.question && <p className="pd-question">{post.question}</p>}

        {post.image && (
          <Image
            className="pd-photo"
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
