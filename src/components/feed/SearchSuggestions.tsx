"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalData } from "../../data/local-store";
import { normalizeCity } from "../../data/city-search";
import { useModeration } from "../../moderation";
import { AuthorAvatar } from "../posts/AuthorAvatar";
import { Icon } from "../ui/Icon";

type Suggestion = { key: string; label: string; detail: string; avatar?: string; href?: string; tag?: string };

export function SearchSuggestions({ className, value, onChange }: { className: string; value: string; onChange: (value: string) => void }) {
  const local = useLocalData();
  const moderation = useModeration();
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const query = value.trim().replace(/^[@#]/, "").toLowerCase();
  const accounts = new Map<string, Suggestion>();
  const tags = new Map<string, number>();
  const ownBlocked = moderation.blocked.includes(local.profile.username) || moderation.blocked.includes(local.profile.name);
  if (local.ready && moderation.ready) {
    if (!ownBlocked) accounts.set(local.profile.username.toLowerCase(), {
      key: `user:${local.profile.username}`, label: `@${local.profile.username}`, detail: local.profile.name,
      avatar: local.avatar ?? undefined, href: "/profile",
    });
    for (const post of local.posts) {
      if (moderation.removed.includes(post.id) || (post.isOwn && ownBlocked) || (post.named && (moderation.blocked.includes(post.author) || moderation.blocked.includes(post.authorUsername ?? "")))) continue;
      if (post.named && !post.isOwn) {
        const username = post.authorUsername ?? post.author.toLowerCase();
        accounts.set(username.toLowerCase(), { key: `user:${username}`, label: `@${username}`, detail: post.author, avatar: post.avatar, href: `/user/${encodeURIComponent(username)}` });
      }
      const postTags = new Set(`${post.text} ${post.question ?? ""}`.toLowerCase().match(/#[\p{L}\p{N}_][\p{L}\p{M}\p{N}_]*/gu) ?? []);
      if (post.city.trim()) postTags.add(`#${normalizeCity(post.city)}`);
      for (const tag of postTags) tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }
  const users = value.trim().startsWith("#") ? [] : [...accounts.values()].filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query)).slice(0, 5);
  const hashtags: Suggestion[] = value.trim().startsWith("@") ? [] : [...tags].filter(([tag]) => (tag.includes(query) || normalizeCity(tag).includes(normalizeCity(query)))).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ key: tag, label: tag, detail: `Публикаций: ${count}`, tag }));
  const items = [...users, ...hashtags];
  const expanded = open && value.trim().length > 0;
  function select(item: Suggestion) {
    setOpen(false);
    setActive(-1);
    if (item.href) router.push(item.href);
    else if (item.tag) onChange(item.tag);
  }

  return <div className={`relative ${className}`} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <Icon name="search" className="size-[23px] shrink-0" />
    <input type="search" role="combobox" aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? id : undefined} aria-activedescendant={expanded && active >= 0 && active < items.length ? `${id}-${active}` : undefined}
      aria-label="Поиск публикаций, пользователей, городов и хэштегов" autoComplete="off" value={value}
      placeholder="Посты, люди, города, #хэштеги…"
      className="w-full min-w-0 border-0 bg-transparent p-0 text-ink outline-none placeholder:text-muted max-[480px]:text-sm"
      onFocus={() => setOpen(true)}
      onChange={(event) => { onChange(event.target.value); setActive(-1); setOpen(true); }}
      onKeyDown={(event) => {
        if (event.key === "Escape") { setOpen(false); setActive(-1); }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault(); setOpen(true);
          setActive((index) => items.length ? (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length : -1);
        }
        if (event.key === "Enter") { event.preventDefault(); if (expanded && items[active]) select(items[active]); else setOpen(false); }
      }} />
    {expanded && <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[min(420px,60dvh)] overflow-y-auto rounded-[var(--radii-panel)] border border-line bg-surface shadow-xl">
      <ul id={id} role="listbox" aria-label="Подсказки поиска" className="m-0 list-none p-0">
        {items.map((item, index) => <li key={item.key} id={`${id}-${index}`} role="option" aria-selected={index === active}
          onMouseDown={(event) => event.preventDefault()} onClick={() => select(item)} onMouseMove={() => setActive(index)}
          className={`flex cursor-pointer items-center gap-3 border-b border-line px-4 py-3 last:border-0 ${index === active ? "bg-peach" : "hover:bg-peach/40"}`}>
          {item.tag ? <span className="grid size-11 shrink-0 place-items-center rounded-full bg-peach text-2xl font-bold text-coral-deep">#</span> : <AuthorAvatar author={item.label.slice(1)} src={item.avatar} className="size-11 shrink-0 rounded-full object-cover" />}
          <span className="min-w-0"><span className="block truncate font-bold">{item.label}</span><span className="block truncate text-sm text-muted">{item.detail}</span></span>
        </li>)}
      </ul>
      {!items.length && <p role="status" className="m-0 px-4 py-5 text-sm text-muted">Пользователи и хэштеги не найдены. Результаты поиска по постам — в ленте.</p>}
    </div>}
  </div>;
}
