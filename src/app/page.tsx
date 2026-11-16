
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";

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

type FeedSection = "feed" | "popular" | "saved";

function FeedContent({ section }: { section: FeedSection }) {
  const activeNav: NavTab = section === "popular"
    ? "Популярное"
    : section === "saved"
      ? "Сохранённое"
      : "Лента";
  const [activeCity, setActiveCity] = useState("Все города");
  const [searchQuery, setSearchQuery] = useState("");

  const { posts, profile, ready: localReady, error } = useLocalData();
  const { ready: moderationReady, removed, blocked } = useModeration();

  const ready = localReady && moderationReady;

  const ownBlocked =
    blocked.includes(profile.username) ||
    blocked.includes(profile.name);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const previousTag = useRef<string | null>(
    searchParams.get("tag")
  );

  // Восстановление хэштега из URL
  useEffect(() => {
    const tag = searchParams.get("tag");

    if (tag) {
      setSearchQuery(`#${tag}`);
    } else if (previousTag.current !== null) {
      setSearchQuery("");
    }

    previousTag.current = tag;
  }, [searchParams]);

  // Изменение URL
  const updateTagInUrl = (tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }

    const query = params.toString();

    router.replace(
      query ? `${pathname}?${query}` : pathname,
      { scroll: false }
    );
  };

  // Поиск
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    const hashtagMatch = value
      .trim()
      .match(/^#([а-яА-ЯёЁa-zA-Z0-9_]+)$/);

    if (hashtagMatch) {
      updateTagInUrl(hashtagMatch[1].toLowerCase());
    } else if (searchParams.has("tag")) {
      updateTagInUrl(null);
    }
  };

  // Нажатие на хэштег
  const handleHashtagClick = (tag: string) => {
    const cleanTag = tag.toLowerCase();

    if (searchQuery.toLowerCase() === `#${cleanTag}`) {
      setSearchQuery("");
      updateTagInUrl(null);
    } else {
      setSearchQuery(`#${cleanTag}`);
      updateTagInUrl(cleanTag);
    }
  };

  // Сброс фильтра хэштега
  const handleResetFilter = () => {
    setSearchQuery("");
    updateTagInUrl(null);
  };

  // Создание публикации
  const handlePublished = () => {
    setActiveCity("Все города");
    setSearchQuery("");
    router.push("/");
  };

  // Фильтрация публикаций
  let filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase();

    const matchesCity =
      activeCity === "Все города" ||
      post.city === activeCity;

    const matchesSearch =
      query === "" ||
      post.text.toLowerCase().includes(query);

    return (
      ready &&
      !removed.includes(post.id) &&
      !(post.isOwn && ownBlocked) &&
      !(post.named && blocked.includes(post.author)) &&
      matchesCity &&
      matchesSearch
    );
  });

  // Сохранённое
  if (section === "saved") {
    filteredPosts = filteredPosts.filter(
      (post) => post.saved
    );
  }

  // Популярное
  if (section === "popular") {
    filteredPosts = [...filteredPosts].sort(
      (a, b) => b.likes - a.likes
    );
  }

  return (
    <>
      <FeedHeader
        activeNav={activeNav}
      />

      <FeedToolbar
        activeCity={activeCity}
        onCityChange={setActiveCity}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <PostComposer
        city={
          activeCity === "Все города"
            ? profile.city
            : activeCity
        }
        onPublished={handlePublished}
      />

      {error && (
        <p
          role="alert"
          className="mx-auto mt-4 [max-width:var(--layout-posts-max-width)] rounded-xl bg-peach p-4 text-coral-deep"
        >
          {error}
        </p>
      )}

      {/* Активный фильтр хэштега */}
      {searchQuery.startsWith("#") && (
        <div className="mx-auto mt-4 flex items-center justify-between [max-width:var(--layout-posts-max-width)] rounded-xl bg-peach/50 px-4 py-2 text-sm text-coral-deep">
          <span>
            Фильтр по хэштегу:{" "}
            <b>{searchQuery}</b>
          </span>

          <button
            type="button"
            onClick={handleResetFilter}
            className="font-medium hover:underline cursor-pointer"
          >
            Сбросить ✕
          </button>
        </div>
      )}

      {/* Публикации */}
      <section
        className={feedClass}
        aria-label="Лента публикаций"
      >
        {!ready && (
          <p
            role="status"
            className="py-[30px] text-center text-muted"
          >
            Загружаем публикации…
          </p>
        )}

        {ready && filteredPosts.length === 0 && (
          <p className="py-[30px] text-center text-muted">
            {activeNav === "Сохранённое"
              ? "Пока ничего не сохранено."
              : "Ничего не найдено."}
          </p>
        )}

        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant={post.image ? "photo" : "short"}
            onHashtagClick={handleHashtagClick}
          />
        ))}
      </section>
    </>
  );
}

export function FeedPage({ section }: { section: FeedSection }) {
  return (
    <main className={shellClass}>
      <Suspense
        fallback={
          <p className="py-10 text-center text-muted">
            Загрузка...
          </p>
        }
      >
        <FeedContent section={section} />
      </Suspense>
    </main>
  );
}

export default function Home() {
  return <FeedPage section="feed" />;
}
