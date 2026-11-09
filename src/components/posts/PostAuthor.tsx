"use client";

import type { ReactNode } from "react";
import { AuthorAvatar } from "./AuthorAvatar";
import { PostAuthorLabel } from "./PostAuthorLabel";
import { Icon } from "../ui/Icon";

type PostAuthorProps = {
  author: string;
  avatar?: string;
  named: boolean;
  isOwn?: boolean;
  username?: string;
  city: string;
  minutes: number;
  variant?: "featured" | "compact";
  menu?: ReactNode;
};

export function PostAuthor({ author, avatar, named, isOwn = false, username, city, minutes, variant = "compact", menu }: PostAuthorProps) {
  const featured = variant === "featured";
  const avatarSize = featured
    ? "[width:var(--avatars-featured-size)] [height:var(--avatars-featured-size)] max-[1000px]:[width:var(--avatars-featured-size-at1000)] max-[1000px]:[height:var(--avatars-featured-size-at1000)] max-[480px]:[width:var(--avatars-featured-size-at480)] max-[480px]:[height:var(--avatars-featured-size-at480)]"
    : "[width:var(--avatars-compact-size)] [height:var(--avatars-compact-size)]";
  const avatarClass = `shrink-0 [border-radius:var(--radii-round)] object-cover ${avatarSize}`;
  const nameSize = featured
    ? "[font-size:var(--font-sizes-title)] max-[1000px]:[font-size:var(--font-sizes-author)] max-[480px]:[font-size:var(--font-sizes-body-large)]"
    : "[font-size:var(--font-sizes-author)]";
  const metaSize = featured
    ? "[font-size:var(--font-sizes-body-large)] max-[1000px]:[font-size:var(--font-sizes-input)] max-[480px]:[font-size:var(--font-sizes-meta)]"
    : "[font-size:var(--font-sizes-input)]";

  return (
    <header className={`flex min-w-0 items-center ${featured ? "gap-5 max-[1000px]:gap-3" : "gap-4 max-[1000px]:gap-2.5"}`}>
      {named ? (
        <AuthorAvatar className={avatarClass} author={author} src={avatar} />
      ) : (
        <span className={`${avatarClass} grid place-items-center [background:var(--colors-avatar)]`}>
          <Icon name="mask" className={`fill-current stroke-none ${featured ? "size-9" : "size-[34px]"}`} />
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-0.5">
        <PostAuthorLabel author={author} named={named} username={username ?? (isOwn && named ? author : undefined)} className={`[font-weight:var(--font-weights-heavy)] leading-[1.3] tracking-[-0.03em] ${nameSize}`} />
        <span className={`text-muted leading-[1.45] whitespace-nowrap ${metaSize}`}>{city}<span aria-hidden="true"> · </span>{minutes} мин</span>
      </div>
      {menu ? (
        <div className="ml-auto" onClick={(event) => event.stopPropagation()}>{menu}</div>
      ) : (
        <button type="button" className="ml-auto inline-flex min-h-9 min-w-9 cursor-default items-center justify-center border-0 bg-transparent p-1 text-inherit focus-visible:[outline:var(--borders-focus)_solid_var(--coral)] focus-visible:outline-offset-4" aria-label="Действия с публикацией" onClick={(event) => event.stopPropagation()}>
        <Icon name="more" className="size-[26px] fill-current stroke-none" />
      </button>
      )}
    </header>
  );
}
