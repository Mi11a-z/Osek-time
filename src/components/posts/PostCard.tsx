"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Post } from "../../data/posts";
import { usePostInteractions } from "../../usePostInteractions";
import { Comments } from "../Comments";
import { PostAuthor } from "./PostAuthor";
import { PostActions } from "./PostActions";

type PostCardProps = {
  post: Post;
  variant: "featured" | "photo" | "short";
};

const linkClass = "text-inherit no-underline focus-visible:[outline:var(--borders-focus)_solid_var(--coral)] focus-visible:outline-offset-4";
const featuredCardClass = "flex flex-col [padding:var(--cards-featured-padding)] [border:var(--borders-featured)_solid_var(--ink)] max-[1240px]:[padding:var(--cards-featured-padding-at1240)] max-[800px]:[padding:var(--cards-featured-padding-at800)] max-[480px]:[padding:var(--cards-featured-padding-at480)]";
const compactCardClass = "[border:var(--borders-thin)_solid_var(--colors-card-border)] [padding:var(--cards-compact-padding)] max-[1000px]:[padding:var(--cards-compact-padding-at1000)] max-[800px]:[padding:var(--cards-compact-padding-at800)] max-[480px]:[padding:var(--cards-compact-padding-at480)]";
const featuredTagClass = "mt-[18px] py-1 [font-size:var(--font-sizes-body-large)] max-[480px]:mt-3.5 max-[480px]:[font-size:var(--font-sizes-input)]";
const compactTagClass = "mt-2 py-0.5 [font-size:var(--font-sizes-body)]";

export function PostCard({ post, variant }: PostCardProps) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const interactions = usePostInteractions(post.likes, post.comments);
  const href = `/post/${post.id}`;
  const featured = variant === "featured";
  const copySize = variant === "short"
    ? "mt-1.5 [font-size:var(--cards-short-text-size)] max-[1240px]:[font-size:var(--cards-short-text-size-at1240)] max-[800px]:[font-size:var(--cards-short-text-size-at800)] max-[480px]:[font-size:var(--font-sizes-body-medium)]"
    : "mt-2 [font-size:var(--cards-text-size)] max-[1240px]:[font-size:var(--cards-text-size-at1240)] max-[800px]:[font-size:var(--cards-text-size-at800)] max-[480px]:[font-size:var(--font-sizes-body-medium)]";

  return (
    <article
      className={`min-w-0 cursor-pointer [background:var(--cards-background)] [border-radius:var(--cards-radius)] [transition:box-shadow_var(--motion-transition-duration)_ease] hover:[box-shadow:var(--shadows-card-hover)] motion-reduce:[transition:none] ${featured ? featuredCardClass : compactCardClass}`}
      onClick={() => router.push(href)}
    >
      <PostAuthor author={post.author} avatar={post.avatar} named={post.named} city={post.city} minutes={post.minutes} variant={featured ? "featured" : "compact"} />
      <span className={`table w-fit px-3 [border-radius:var(--radii-tag)] bg-peach [color:var(--colors-tag-text)] [font-weight:var(--font-weights-semibold)] leading-[1.45] ${featured ? featuredTagClass : compactTagClass}`}># {post.city}</span>

      {featured ? (
        <blockquote className="mt-[22px] grid [grid-template-columns:var(--cards-quote-columns)] [gap:var(--cards-quote-gap)] [margin-bottom:var(--cards-quote-bottom)] min-[1600px]:mt-7 max-[1240px]:[grid-template-columns:var(--cards-quote-columns-at1240)] max-[1240px]:[gap:var(--cards-quote-gap-at1240)] max-[1000px]:mt-3.5 max-[800px]:[grid-template-columns:var(--cards-quote-columns-at800)] max-[800px]:[gap:var(--cards-quote-gap-at800)] max-[800px]:[margin-block:20px_35px] max-[480px]:[grid-template-columns:var(--cards-quote-columns-at480)] max-[480px]:[gap:var(--cards-quote-gap-at480)] max-[480px]:[margin-block:20px_30px]">
          <span className="font-display [font-weight:var(--font-weights-bold)] [font-size:var(--headings-quote-mark)] leading-[0.95] text-coral tracking-[-0.09em] max-[1240px]:[font-size:var(--headings-quote-mark-at1240)] max-[1000px]:[font-size:var(--headings-quote-mark-at1000)] max-[800px]:[font-size:var(--headings-quote-mark-at800)] max-[480px]:[font-size:var(--headings-quote-mark-at480)]" aria-hidden="true">“</span>
          <div>
            <p className="font-display [font-size:var(--headings-quote)] [font-weight:var(--font-weights-heavy)] [line-height:var(--headings-quote-line-height)] [letter-spacing:var(--headings-quote-letter-spacing)] text-pretty max-[1240px]:[font-size:var(--headings-quote-at1240)] max-[1000px]:[font-size:var(--headings-quote-at1000)] max-[800px]:[font-size:var(--headings-quote-at800)] max-[480px]:[font-size:var(--headings-quote-at480)] max-[480px]:[line-height:var(--headings-quote-line-height-at480)]">
              <Link href={href} className={linkClass} onClick={(event) => event.stopPropagation()}>{post.text}</Link>
            </p>
            {post.question && <p className="[margin-top:var(--headings-question-gap)] font-display [font-size:var(--headings-question)] [font-weight:var(--font-weights-medium)] [line-height:var(--headings-question-line-height)] tracking-[-0.035em] max-[1240px]:[font-size:var(--headings-question-at1240)] max-[1000px]:[font-size:var(--headings-question-at1000)] max-[800px]:[font-size:var(--headings-question-at800)] max-[480px]:[font-size:var(--headings-question-at480)] max-[480px]:[margin-top:var(--headings-question-gap-at480)]">{post.question}</p>}
          </div>
        </blockquote>
      ) : (
        <p className={`[font-weight:var(--font-weights-medium)] [line-height:var(--cards-text-line-height)] tracking-[-0.025em] ${copySize}`}>
          <Link href={href} className={linkClass} onClick={(event) => event.stopPropagation()}>{post.text}</Link>
        </p>
      )}

      {post.image && (
        <Image
          className="mt-2.5 block h-auto w-full [aspect-ratio:var(--images-feed-ratio)] object-cover [border-radius:var(--images-radius)] max-[1000px]:[aspect-ratio:var(--images-feed-ratio-at1000)] max-[800px]:[aspect-ratio:var(--images-feed-ratio-at800)] max-[480px]:[aspect-ratio:var(--images-feed-ratio-at480)]"
          src={post.image}
          alt={post.imageAlt ?? ""}
          width={2172}
          height={724}
          sizes="(max-width: 940px) 100vw, 880px"
        />
      )}

      <div className="flex w-full flex-col" onClick={(event) => event.stopPropagation()}>
        <PostActions
          likes={interactions.likes}
          isLiked={interactions.isLiked}
          isSaved={interactions.isSaved}
          commentCount={interactions.comments.length}
          onLike={interactions.toggleLike}
          onSave={interactions.toggleSave}
          onToggleComments={() => setShowComments((previous) => !previous)}
          commentsOpen={showComments}
          separated={featured}
        />
        <div hidden={!showComments}>
          <Comments comments={interactions.comments} onAdd={interactions.addComment} onDelete={interactions.deleteComment} variant="feed" />
        </div>
      </div>
    </article>
  );
}
