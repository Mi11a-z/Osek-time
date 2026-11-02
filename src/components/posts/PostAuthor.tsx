"use client";

import { AuthorAvatar } from "./AuthorAvatar";
import { Icon } from "../ui/Icon";

type PostAuthorProps = {
  author: string;
  avatar?: string;
  named: boolean;
  city: string;
  minutes: number;
};

export function PostAuthor({ author, avatar, named, city, minutes }: PostAuthorProps) {
  return (
    <header className="post-author">
      {named ? (
        <AuthorAvatar className="avatar avatar-person" author={author} src={avatar} />
      ) : (
        <span className="avatar avatar-anonymous"><Icon name="mask" /></span>
      )}
      <div className="author-details">
        <span className="author-name">{author}</span>
        <span className="post-meta">{city}<span aria-hidden="true"> · </span>{minutes} мин</span>
      </div>
      <button type="button" className="icon-button post-menu" aria-label="Действия с публикацией" onClick={(event) => event.stopPropagation()}>
        <Icon name="more" />
      </button>
    </header>
  );
}
