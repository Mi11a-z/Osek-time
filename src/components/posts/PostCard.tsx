"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Post } from "../../data/posts";
import { usePostInteractions } from "../../hooks/usePostInteractions";
import { Comments } from "../comments/Comments";
import { PostAuthor } from "./PostAuthor";
import { PostActions } from "./PostActions";

type PostCardProps = {
  post: Post;
  variant: "featured" | "photo" | "short";
};

export function PostCard({ post, variant }: PostCardProps) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const interactions = usePostInteractions(post.likes, post.comments);
  const href = `/post/${post.id}`;

  return (
    <article className={`post-card ${variant}-post is-clickable`} onClick={() => router.push(href)}>
      <PostAuthor author={post.author} avatar={post.avatar} named={post.named} city={post.city} minutes={post.minutes} />
      <span className="city-tag"># {post.city}</span>

      {variant === "featured" ? (
        <blockquote className="featured-body">
          <span className="quote-mark" aria-hidden="true">“</span>
          <div>
            <p className="featured-quote">
              <Link href={href} className="post-content-link" onClick={(event) => event.stopPropagation()}>{post.text}</Link>
            </p>
            {post.question && <p className="featured-question">{post.question}</p>}
          </div>
        </blockquote>
      ) : (
        <p className="post-copy">
          <Link href={href} className="post-content-link" onClick={(event) => event.stopPropagation()}>{post.text}</Link>
        </p>
      )}

      {post.image && (
        <Image
          className="city-photo"
          src={post.image}
          alt={post.imageAlt ?? ""}
          width={2172}
          height={724}
          sizes="(max-width: 940px) 100vw, 880px"
        />
      )}

      <div className="post-interactions" onClick={(event) => event.stopPropagation()}>
        <PostActions
          likes={interactions.likes}
          isLiked={interactions.isLiked}
          isSaved={interactions.isSaved}
          commentCount={interactions.comments.length}
          onLike={interactions.toggleLike}
          onSave={interactions.toggleSave}
          onToggleComments={() => setShowComments((previous) => !previous)}
          commentsOpen={showComments}
          separated={variant === "featured"}
        />
        <div hidden={!showComments}>
          <Comments comments={interactions.comments} onAdd={interactions.addComment} onDelete={interactions.deleteComment} variant="feed" />
        </div>
      </div>
    </article>
  );
}
