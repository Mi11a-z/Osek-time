"use client";
import { useState } from "react";
import { FeedHeader } from "../components/feed/FeedHeader";
import { FeedToolbar } from "../components/feed/FeedToolbar";
import { PostComposer } from "../components/feed/PostComposer";
import { PostCard } from "../components/posts/PostCard";
import { posts } from "../data/posts";

const shellClass = `w-full mx-auto [max-width:var(--layout-feed-max-width)] [padding:var(--layout-feed-padding)]
  min-[1600px]:[padding-top:var(--layout-feed-wide-top-from1600)]
  max-[1240px]:[padding:var(--layout-feed-padding-at1240)]
  max-[800px]:[max-width:var(--layout-feed-max-width-at800)] max-[800px]:[padding:var(--layout-feed-padding-at800)]
  max-[480px]:[padding:var(--layout-feed-padding-at480)]`;

const feedClass = `grid w-full mx-auto items-start [grid-template-columns:var(--layout-feed-columns)]
  [gap:var(--layout-feed-gap)] [margin-top:var(--layout-feed-top)] [max-width:var(--layout-posts-max-width)]
  max-[800px]:[gap:var(--layout-feed-gap-at800)]`;

export default function Home() {
  const [activeCity, setActiveCity] = useState("Все города");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter((post: any) => {
    const matchesCity = activeCity === "Все города" || post.city === activeCity;
    const matchesSearch = searchQuery === "" || 
      (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCity && matchesSearch;
  });
  return (
    <main className={shellClass}>
      <FeedHeader />
      <FeedToolbar 
  activeCity={activeCity} 
  onCityChange={setActiveCity}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
/>
      <PostComposer />
      <section className={feedClass} aria-label="Лента публикаций">
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
