"use client";
import { useState } from "react";
import { FeedHeader, type NavTab } from "../components/feed/FeedHeader";
import { FeedToolbar } from "../components/feed/FeedToolbar";
import { PostComposer } from "../components/feed/PostComposer";
import { PostCard } from "../components/posts/PostCard";
import { useLocalData } from "../data/local-store";
import { useModeration } from "../moderation";

const shellClass = `w-full mx-auto [max-width:var(--layout-feed-max-width)] [padding:var(--layout-feed-padding)]
  min-[1600px]:[padding-top:var(--layout-feed-wide-top-from1600)]
  max-[1240px]:[padding:var(--layout-feed-padding-at1240)]
  max-[800px]:[max-width:var(--layout-feed-max-width-at800)] max-[800px]:[padding:var(--layout-feed-padding-at800)]
  max-[480px]:[padding:var(--layout-feed-padding-at480)]`;

const feedClass = `grid w-full mx-auto items-start [grid-template-columns:var(--layout-feed-columns)]
  [gap:var(--layout-feed-gap)] [margin-top:var(--layout-feed-top)] [max-width:var(--layout-posts-max-width)]
  max-[800px]:[gap:var(--layout-feed-gap-at800)]`;

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavTab>("Лента");
  const [activeCity, setActiveCity] = useState("Все города");
  const [searchQuery, setSearchQuery] = useState("");
  const { posts, profile, ready: localReady, error } = useLocalData();
  const { ready: moderationReady, removed, blocked } = useModeration();
  const ready = localReady && moderationReady;
  const ownBlocked = blocked.includes(profile.username) || blocked.includes(profile.name);

  let filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase();
    const matchesCity = activeCity === "Все города" || post.city === activeCity;
    const matchesSearch = query === "" || post.text.toLowerCase().includes(query);
    return ready && !removed.includes(post.id) && !(post.isOwn && ownBlocked) && !(post.named && blocked.includes(post.author)) && matchesCity && matchesSearch;
  });

  if (activeNav === "Сохранённое") {
    filteredPosts = filteredPosts.filter((post) => post.saved);
  }
  if (activeNav === "Популярное") {
    filteredPosts = [...filteredPosts].sort((a, b) => b.likes - a.likes);
  }

  return (
    <main className={shellClass}>
      <FeedHeader activeNav={activeNav} onNavChange={setActiveNav} />
      <FeedToolbar
        activeCity={activeCity}
        onCityChange={setActiveCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <PostComposer city={activeCity === "Все города" ? profile.city : activeCity} onPublished={() => { setActiveNav("Лента"); setActiveCity("Все города"); setSearchQuery(""); }} />
      {error && <p role="alert" className="mx-auto mt-4 [max-width:var(--layout-posts-max-width)] rounded-xl bg-peach p-4 text-coral-deep">{error}</p>}
      <section className={feedClass} aria-label="Лента публикаций">
        {!ready && <p role="status" className="py-[30px] text-center text-muted">Загружаем публикации…</p>}
        {ready && filteredPosts.length === 0 && (
          <p className="py-[30px] text-center text-muted">
            {activeNav === "Сохранённое" ? "Пока ничего не сохранено." : "Ничего не найдено."}
          </p>
        )}
        {filteredPosts.map((post, index) => (
            <PostCard
            key={post.id}
            post={post}
              variant={index === 0 ? "featured" : post.image ? "photo" : "short"}
          />
        ))}
      </section>
    </main>
  );
}
