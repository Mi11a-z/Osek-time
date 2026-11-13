"use client";

import Link from "next/link";
import { useLocalData } from "../../data/local-store";
import { useModeration } from "../../moderation";
import { BackHeader } from "../ui/BackHeader";
import { PostCard } from "../posts/PostCard";
import { AuthorAvatar } from "../posts/AuthorAvatar";

export function PublicProfileView({ username }: { username: string }) {
  const { ready, posts, profile } = useLocalData();
  const moderation = useModeration();
  const normalized = decodeURIComponent(username).toLowerCase();
  const authoredPosts = posts.filter((post) => post.named && (post.authorUsername ?? (post.isOwn ? profile.username : post.author.toLowerCase())).toLowerCase() === normalized);
  const author = authoredPosts[0];
  const visiblePosts = authoredPosts.filter((post) => !moderation.removed.includes(post.id));
  const authorName = author?.isOwn ? profile.name : author?.author ?? normalized;
  const likes = authoredPosts.reduce((sum, post) => sum + post.likes, 0);

  if (!ready || !moderation.ready) return <main className="mx-auto max-w-3xl p-5"><BackHeader prefix="pf" /><p className="py-12 text-center text-muted">Загружаем профиль…</p></main>;
  if (!author) return <main className="mx-auto max-w-3xl p-5"><BackHeader prefix="pf" /><p className="py-12 text-center text-muted">Профиль не найден.</p><p className="text-center"><Link href="/" className="text-coral-deep">Вернуться в ленту</Link></p></main>;

  return <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]">
    <BackHeader prefix="pf" />
    <section className="overflow-hidden rounded-[var(--radii-panel)] border-solid border-ink bg-surface [border-width:var(--borders-strong)]">
      <div className="h-32 bg-[linear-gradient(120deg,var(--ink),var(--colors-cover-middle),var(--coral))]" />
      <div className="flex flex-wrap items-center gap-5 p-6">
        <AuthorAvatar author={authorName} src={author?.avatar} className="size-24 shrink-0 rounded-full border-4 border-surface object-cover" />
        <div className="min-w-0 flex-1"><h1 className="m-0 font-display text-3xl font-bold">{authorName}</h1><p className="mb-0 mt-1 text-muted">@{normalized} · {author.city}</p><p className="mb-0 mt-3 text-sm text-muted">Профиль автора публикаций</p></div>
        {author?.isOwn && <Link href="/profile" className="rounded-full border border-line px-4 py-2 font-semibold text-inherit no-underline hover:border-coral">Мой профиль</Link>}
      </div>
      <div className="grid grid-cols-2 border-t border-line"><div className="p-4 text-center"><strong className="block font-display text-2xl">{visiblePosts.length}</strong><span className="text-sm text-muted">Публикации</span></div><div className="border-l border-line p-4 text-center"><strong className="block font-display text-2xl">{likes}</strong><span className="text-sm text-muted">Лайки</span></div></div>
    </section>
    <section className="mx-auto mt-5 grid max-w-3xl gap-4" aria-label={`Публикации пользователя ${normalized}`}>
      {visiblePosts.length ? visiblePosts.map((post, index) => <PostCard key={post.id} post={post} variant={index === 0 ? "featured" : post.image ? "photo" : "short"} />) : <p className="py-10 text-center text-muted">Пока нет публикаций.</p>}
    </section>
  </main>;
}
