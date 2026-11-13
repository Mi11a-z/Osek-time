"use client";

import { useModeration } from "../../moderation";
import Link from "next/link";

type PostAuthorLabelProps = {
  author: string;
  named: boolean;
  username?: string;
  href?: string;
  className?: string;
};

export function PostAuthorLabel({ author, named, username, href, className }: PostAuthorLabelProps) {
  const { ready, role } = useModeration();

  return (
    <span className="flex min-w-0 flex-col">
      {href && named ? <Link href={href} onClick={(event) => event.stopPropagation()} className={`${className} text-inherit no-underline hover:text-coral-deep`}>{named ? (username ? `@${username}` : author) : "Аноним"}</Link> : <span className={className}>{named ? (username ? `@${username}` : author) : "Аноним"}</span>}
      {!named && username && ready && role === "admin" && (
        <span className="text-muted font-normal [font-size:var(--font-sizes-meta)] leading-snug">@{username}</span>
      )}
    </span>
  );
}
