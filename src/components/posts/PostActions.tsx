"use client";

import type { ReactNode } from "react";
import { Icon } from "../ui/Icon";

type PostActionsProps = {
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  commentCount: number;
  onLike: () => void;
  onSave: () => void;
  onToggleComments?: () => void;
  commentsHref?: string;
  commentsOpen?: boolean;
  separated?: boolean;
  menu?: ReactNode;
  showMore?: boolean;
};

const actionClass = "inline-flex shrink-0 items-center justify-center [gap:var(--actions-button-gap)] [min-width:var(--actions-button-min-size)] [min-height:var(--actions-button-min-size)] [padding:var(--actions-button-padding)] border-0 bg-transparent [font-size:var(--actions-text-size)] [font-weight:var(--font-weights-semibold)] no-underline max-[480px]:[gap:var(--actions-button-gap-at480)] max-[480px]:[font-size:var(--actions-text-size-at480)]";
const interactiveClass = "cursor-pointer [transition:transform_var(--motion-press-duration)_ease,color_var(--motion-transition-duration)_ease] hover:[transform:scale(1.08)] active:[transform:scale(0.92)] focus-visible:[outline:var(--borders-focus)_solid_var(--coral)] focus-visible:outline-offset-4 motion-reduce:[transition:none]";
const iconSize = "[width:var(--actions-icon-size)] [height:var(--actions-icon-size)] max-[480px]:[width:var(--actions-icon-size-at480)] max-[480px]:[height:var(--actions-icon-size-at480)]";
const dividerClass = "shrink-0 [width:var(--borders-thin)] [height:var(--actions-divider-height)] [background:var(--colors-divider)]";

export function PostActions({ likes, isLiked, isSaved, commentCount, onLike, onSave, onToggleComments, commentsHref, commentsOpen = false, separated = false, menu, showMore = true }: PostActionsProps) {
  const commentContent = <><Icon name="comment" className={iconSize} /><span>{commentCount}</span></>;

  return (
    <footer className={`flex items-center [gap:var(--actions-gap)] [min-height:var(--actions-min-height)] [margin-top:var(--actions-top-space)] max-[480px]:[gap:var(--actions-gap-at480)] ${separated ? "[border-top:var(--borders-thin)_solid_var(--colors-quote-divider)] [padding-top:var(--actions-separated-padding)]" : ""}`}>
      <button type="button" onClick={onLike} className={`${actionClass} ${interactiveClass} ${isLiked ? "[color:var(--colors-liked)]" : "text-inherit"}`} aria-pressed={isLiked} aria-label={`Нравится: ${likes}`}>
        <Icon name="heart" className={`${iconSize} stroke-coral [transition:fill_var(--motion-transition-duration)_ease] motion-reduce:[transition:none] ${isLiked ? "fill-coral [animation:like-pop_var(--motion-like-duration)_ease] motion-reduce:[animation:none]" : "fill-none"}`} />
        <span>{likes}</span>
      </button>
      <span className={dividerClass} aria-hidden="true" />
      {onToggleComments ? (
        <button type="button" onClick={onToggleComments} className={`${actionClass} ${interactiveClass} ${commentsOpen ? "text-coral" : "text-inherit"}`} aria-expanded={commentsOpen} aria-label={`Комментарии: ${commentCount}`}>
          {commentContent}
        </button>
      ) : commentsHref ? (
        <a href={commentsHref} className={`${actionClass} ${interactiveClass} text-inherit`} aria-label={`Перейти к комментариям: ${commentCount}`}>
          {commentContent}
        </a>
      ) : (
        <span className={`${actionClass} text-inherit`} role="img" aria-label={`Комментарии: ${commentCount}`}>
          {commentContent}
        </span>
      )}
      <span className={dividerClass} aria-hidden="true" />
      <button type="button" onClick={onSave} className={`${actionClass} ${interactiveClass} ${isSaved ? "[color:var(--colors-saved)]" : "text-inherit"}`} aria-pressed={isSaved} aria-label={isSaved ? "Убрать из сохранённого" : "Сохранить публикацию"}>
        <Icon name="bookmark" className={`${iconSize} ${isSaved ? "fill-current [animation:save-bounce_var(--motion-save-duration)_ease] motion-reduce:[animation:none]" : "fill-none"}`} />
      </button>
      {menu ? (
        <div className="ml-auto">{menu}</div>
      ) : showMore ? (
        <button type="button" className={`${actionClass} ml-auto cursor-pointer text-inherit focus-visible:[outline:var(--borders-focus)_solid_var(--coral)] focus-visible:outline-offset-4`} aria-label="Ещё действия с публикацией">
          <Icon name="more" className={`${iconSize} fill-current stroke-none`} />
        </button>
      ) : null}
    </footer>
  );
}