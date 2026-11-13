"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocalData } from "../../data/local-store";

const SEEN_KEY = "osek-seen-comment-notifications";

export function CommentNotifications() {
  const { ready, posts, profile } = useLocalData();
  const [seen, setSeen] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const value: unknown = JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]");
        if (Array.isArray(value) && value.every((item) => typeof item === "string")) setSeen(value);
      } catch { /* start with no read notifications */ }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready || !loaded) return null;
  const notifications = posts.flatMap((post) => post.isOwn ? post.comments
    .filter((comment) => comment.createdAt && comment.username !== profile.username)
    .map((comment) => ({ ...comment, postId: post.id, postText: post.text })) : [])
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)).slice(0, 8);
  if (!notifications.length) return null;
  const unread = notifications.filter((item) => !seen.includes(item.id)).length;

  function markRead() {
    const next = [...new Set(seen.concat(notifications.map((item) => item.id)))];
    setSeen(next);
    try { window.localStorage.setItem(SEEN_KEY, JSON.stringify(next)); } catch { /* уведомления остаются видимыми */ }
  }

  return <section aria-label="Уведомления о комментариях" className="mb-4 rounded-[var(--radii-panel)] border border-line bg-surface p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="m-0 text-base font-bold">Комментарии к вашим постам{unread > 0 ? <span className="ml-2 rounded-full bg-coral px-2 py-0.5 text-xs text-white">{unread}</span> : null}</h2>
      {unread > 0 && <button type="button" onClick={markRead} className="border-0 bg-transparent text-sm text-coral-deep underline">Отметить прочитанными</button>}
    </div>
    <ul className="mt-3 grid list-none gap-2 p-0">
      {notifications.slice(0, 4).map((item) => <li key={item.id}>
        <Link href={`/post/${item.postId}#post-comments`} onClick={markRead} className="flex items-start gap-2 rounded-lg bg-peach/40 px-3 py-2 text-inherit no-underline hover:bg-peach">
          <span className="min-w-0 flex-1"><strong>@{item.username}</strong>: {item.text}<span className="mt-0.5 block truncate text-xs text-muted">К посту: {item.postText || "Фото"}</span></span>
          {!seen.includes(item.id) && <span aria-label="Непрочитано" className="mt-1 size-2 shrink-0 rounded-full bg-coral" />}
        </Link>
      </li>)}
    </ul>
  </section>;
}
