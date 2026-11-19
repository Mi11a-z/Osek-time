"use client";

import Link from "next/link";
import { AuthorAvatar } from "../posts/AuthorAvatar";

export type FollowAccount = { username: string; name: string; avatar?: string; city?: string };

type FollowListDialogProps = {
  title: string;
  accounts: FollowAccount[];
  viewerUsername: string;
  followedUsernames: string[];
  onToggleFollow: (username: string, follow: boolean) => void;
  onClose: () => void;
};

export function FollowListDialog({ title, accounts, viewerUsername, followedUsernames, onToggleFollow, onClose }: FollowListDialogProps) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(12_24_48/0.48)] p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md overflow-hidden rounded-[var(--radii-panel)] border border-line bg-surface shadow-2xl">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div><h2 className="m-0 font-display text-xl font-bold">{title}</h2><p className="mb-0 mt-1 text-sm text-muted">{accounts.length} пользователей</p></div>
        <button type="button" aria-label="Закрыть список" onClick={onClose} className="grid size-9 place-items-center rounded-full border-0 bg-transparent text-2xl text-muted hover:bg-peach">×</button>
      </header>
      {accounts.length ? <ul className="m-0 max-h-[65vh] list-none overflow-y-auto p-2">
        {accounts.map((account) => {
          const username = account.username.toLowerCase();
          const following = followedUsernames.includes(username);
          const isSelf = username === viewerUsername.toLowerCase();
          return <li key={username} className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-peach/40">
            <Link href={`/user/${encodeURIComponent(username)}`} onClick={onClose} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-2 text-inherit no-underline">
              <AuthorAvatar author={account.name} src={account.avatar} className="size-11 shrink-0 rounded-full object-cover" />
              <span className="min-w-0"><strong className="block truncate">{account.name}</strong><span className="block text-sm text-muted">@{username}{account.city ? ` · ${account.city}` : ""}</span></span>
            </Link>
            {!isSelf && <button type="button" onClick={() => onToggleFollow(username, !following)} className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold ${following ? "border border-line bg-transparent text-ink hover:border-coral" : "border-0 bg-coral text-white hover:bg-coral-deep"}`}>{following ? "Отписаться" : "Подписаться"}</button>}
          </li>;
        })}
      </ul> : <p className="px-5 py-10 text-center text-muted">Список пока пуст.</p>}
    </section>
  </div>;
}
