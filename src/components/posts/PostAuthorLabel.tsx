"use client";

import { useModeration } from "../../moderation";

type PostAuthorLabelProps = {
  author: string;
  named: boolean;
  username?: string;
  className?: string;
};

export function PostAuthorLabel({ author, named, username, className }: PostAuthorLabelProps) {
  const { ready, role } = useModeration();

  return (
    <span className="flex min-w-0 flex-col">
      <span className={className}>{named ? (username ? `@${username}` : author) : "Аноним"}</span>
      {!named && username && ready && role === "admin" && (
        <span className="text-muted font-normal [font-size:var(--font-sizes-meta)] leading-snug">@{username}</span>
      )}
    </span>
  );
}
