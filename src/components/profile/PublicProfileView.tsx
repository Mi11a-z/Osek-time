"use client";

import { CityLink } from "../posts/CityLink";

import Link from "next/link";
import { useState } from "react";
import { useLocalData } from "../../data/local-store";
import { accountReports, canViewAccountReports, useModeration } from "../../moderation";
import { followersOf, setFollowing, useFollowGraph } from "../../data/follows";
import { BackHeader } from "../ui/BackHeader";
import { PostCard } from "../posts/PostCard";
import { AuthorAvatar } from "../posts/AuthorAvatar";
import { FollowListDialog, type FollowAccount } from "./FollowListDialog";
import { AccountReportsLink } from "./AccountReportsLink";

export function PublicProfileView({ username }: { username: string }) {
  const local = useLocalData();
  const { ready, posts, profile } = local;
  const moderation = useModeration();
  const graph = useFollowGraph();
  const [list, setList] = useState<"following" | "followers" | null>(null);
  const normalized = decodeURIComponent(username).toLowerCase();
  const authoredPosts = posts.filter((post) => post.named && (post.authorUsername ?? (post.isOwn ? profile.username : post.author.toLowerCase())).toLowerCase() === normalized);
  const author = authoredPosts[0];
  const visiblePosts = authoredPosts.filter((post) => !moderation.removed.includes(post.id))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  const authorName = author?.isOwn ? profile.name : author?.author ?? normalized;
  const viewer = profile.username.toLowerCase();
  const following = graph[normalized] ?? [];
  const followers = followersOf(graph, normalized);
  const accounts: FollowAccount[] = Array.from(new Map<string, FollowAccount>([
    { username: profile.username.toLowerCase(), name: profile.name, city: profile.city },
    ...posts.filter((post) => post.named).map((post) => ({ username: (post.authorUsername ?? (post.isOwn ? profile.username : post.author.toLowerCase())).toLowerCase(), name: post.isOwn ? profile.name : post.author, city: post.city, avatar: post.avatar })),
  ].map((account) => [account.username, account] as [string, FollowAccount])).values());
  const accountMap = new Map(accounts.map((account) => [account.username, account]));
  const listAccounts = (usernames: string[]): FollowAccount[] => usernames.flatMap((name) => {
    const account = accountMap.get(name);
    return account ? [account] : [];
  });
  const reportsCount = canViewAccountReports(moderation.role)
    ? accountReports(moderation.reports, normalized, local).length
    : undefined;
  const isFollowing = (graph[viewer] ?? []).includes(normalized);

  if (!ready || !moderation.ready) return <main className="mx-auto max-w-3xl p-5"><BackHeader prefix="pf" /><p className="py-12 text-center text-muted">Загружаем профиль…</p></main>;
  if (!author) return <main className="mx-auto max-w-3xl p-5"><BackHeader prefix="pf" /><p className="py-12 text-center text-muted">Профиль не найден.</p><p className="text-center"><Link href="/" className="text-coral-deep">Вернуться в ленту</Link></p></main>;

  return <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]">
    <BackHeader prefix="pf" />
    <section className="overflow-hidden rounded-[var(--radii-panel)] border-solid border-ink bg-surface [border-width:var(--borders-strong)]">
      <div className="h-32 bg-[linear-gradient(120deg,var(--ink),var(--colors-cover-middle),var(--coral))]" />
      <div className="flex flex-wrap items-center gap-5 p-6">
        <AuthorAvatar author={authorName} src={author?.avatar} className="size-24 shrink-0 rounded-full border-4 border-surface object-cover" />
        <div className="min-w-0 flex-1"><h1 className="m-0 font-display text-3xl font-bold">{authorName}</h1><p className="mb-0 mt-1 text-muted">@{normalized} · <CityLink city={author.city} /></p><p className="mb-0 mt-3 text-sm text-muted">Профиль автора публикаций</p></div>
        <div className="flex flex-col items-stretch gap-2">
          {author?.isOwn ? <Link href="/profile" className="rounded-full border border-line px-4 py-2 text-center font-semibold text-inherit no-underline hover:border-coral">Мой профиль</Link> : <button type="button" onClick={() => setFollowing(viewer, normalized, !isFollowing)} className={`rounded-full px-5 py-2.5 font-bold ${isFollowing ? "border border-line bg-transparent text-ink hover:border-coral" : "border-0 bg-coral text-white hover:bg-coral-deep"}`}>{isFollowing ? "Отписаться" : "Подписаться"}</button>}
          {reportsCount !== undefined && <AccountReportsLink username={normalized} count={reportsCount} />}
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-line"><div className="p-4 text-center"><strong className="block font-display text-2xl">{visiblePosts.length}</strong><span className="text-sm text-muted">Публикации</span></div><button type="button" onClick={() => setList("followers")} className="border-l border-line bg-transparent p-4 text-center hover:bg-peach/30"><strong className="block font-display text-2xl">{followers.length}</strong><span className="text-sm text-muted">Подписчики</span></button><button type="button" onClick={() => setList("following")} className="border-l border-line bg-transparent p-4 text-center hover:bg-peach/30"><strong className="block font-display text-2xl">{following.length}</strong><span className="text-sm text-muted">Подписки</span></button></div>
    </section>
    <section className="mx-auto mt-5 grid max-w-3xl gap-4" aria-label={`Публикации пользователя ${normalized}`}>
      {visiblePosts.length ? visiblePosts.map((post, index) => (
        <div key={post.id}>
          {post.pinned && <p className="mb-2 text-xs font-semibold text-coral-deep">Закреплено</p>}
          <PostCard post={post} variant={index === 0 ? "featured" : post.image ? "photo" : "short"} />
        </div>
      )) : <p className="py-10 text-center text-muted">Пока нет публикаций.</p>}
    </section>
    {list && <FollowListDialog title={list === "following" ? "Подписки" : "Подписчики"} accounts={listAccounts(list === "following" ? following : followers)} viewerUsername={viewer} followedUsernames={graph[viewer] ?? []} onToggleFollow={(target, follow) => setFollowing(viewer, target, follow)} onClose={() => setList(null)} />}
  </main>;
}
