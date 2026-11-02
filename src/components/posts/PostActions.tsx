"use client";

import { Icon } from "../ui/Icon";
import "./post-actions.css";

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
};

export function PostActions({ likes, isLiked, isSaved, commentCount, onLike, onSave, onToggleComments, commentsHref, commentsOpen = false, separated = false }: PostActionsProps) {
  const commentContent = <><Icon name="comment" /><span>{commentCount}</span></>;

  return (
    <footer className={`post-actions${separated ? " post-actions-separated" : ""}`}>
      <button type="button" onClick={onLike} className={`post-action-item like-button ${isLiked ? "is-liked" : ""}`} aria-pressed={isLiked} aria-label={`Нравится: ${likes}`}>
        <Icon name="heart" />
        <span>{likes}</span>
      </button>
      <span className="action-divider" aria-hidden="true" />
      {onToggleComments ? (
        <button type="button" onClick={onToggleComments} className={`post-action-item like-button comments-toggle ${commentsOpen ? "is-open" : ""}`} aria-expanded={commentsOpen} aria-label={`Комментарии: ${commentCount}`}>
          {commentContent}
        </button>
      ) : commentsHref ? (
        <a href={commentsHref} className="post-action-item like-button comments-toggle" aria-label={`Перейти к комментариям: ${commentCount}`}>
          {commentContent}
        </a>
      ) : (
        <span className="post-action-item comments-count" role="img" aria-label={`Комментарии: ${commentCount}`}>
          {commentContent}
        </span>
      )}
      <span className="action-divider" aria-hidden="true" />
      <button type="button" onClick={onSave} className={`post-action-item icon-button save-button ${isSaved ? "is-saved" : ""}`} aria-pressed={isSaved} aria-label={isSaved ? "Убрать из сохранённого" : "Сохранить публикацию"}>
        <Icon name="bookmark" />
      </button>
      <button type="button" className="post-action-item icon-button action-more" aria-label="Ещё действия с публикацией"><Icon name="more" /></button>
    </footer>
  );
}
