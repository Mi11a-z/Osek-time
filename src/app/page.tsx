"use client";

import { useState, Suspense } from "react";
import {
  useSearchParams,
  useRouter,
} from "next/navigation";

import { FeedHeader, type NavTab } from "../components/feed/FeedHeader";
import { matchesCitySearch } from "../data/city-search";
import { containsHashtag, fullHashtag } from "../hashtag";
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
  const [freeSearch, setFreeSearch] = useState("");

  const { posts, profile, ready: localReady, error } = useLocalData();
  const { ready: moderationReady, removed, blocked } = useModeration();

  const ready = localReady && moderationReady;

  const ownBlocked =
    blocked.includes(profile.username) ||
    blocked.includes(profile.name);

  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTag = searchParams.get("tag");
  const activeCity = searchParams.get("city") || "Все города";
  const searchQuery = activeTag ? `#${activeTag}` : freeSearch;

  function updateFilters(changes: { tag?: string | null; city?: string | null }) {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(changes)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  }

  function handleSearchChange(value: string) {
    const tag = fullHashtag.test(value) ? value.slice(1) : null;
    setFreeSearch(tag ? "" : value);
    updateFilters({ tag });
  }

  function handleHashtagClick(tag: string) {
    setFreeSearch("");
    updateFilters({ tag: activeTag?.toLowerCase() === tag ? null : tag });
  }

  function handleResetFilter() {
    setFreeSearch("");
    updateFilters({ tag: null });
  }

  function handleCityClick(city: string) {
    setFreeSearch("");
    updateFilters({ city, tag: null });
  }

  // Создание публикации
  const handlePublished = () => {
    setFreeSearch("");
    router.push("/");
  };

  // Фильтрация публикаций
  let filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase().trim();
    const cleanQuery = query.replace(/^@/, ""); // убираем @ в начале, если пользователь ввёл "@aba_12"

    const matchesCity =
      activeCity === "Все города" ||
      post.city === activeCity;

    // Собираем возможные имена и юзернеймы автора (только если пост не анонимный)
    const authorFields: string[] = [];
    if (post.named) {
      if (post.author) authorFields.push(post.author.toLowerCase());
      if ("username" in post && typeof post.username === "string") {
        authorFields.push(post.username.toLowerCase());
      }
      if (post.isOwn) {
        authorFields.push(profile.name.toLowerCase(), profile.username.toLowerCase());
      }
    }

    const matchesAuthor =
      cleanQuery.length > 0 &&
      authorFields.some((field) => field.replace(/^@/, "").includes(cleanQuery));

    const matchesSearch = activeTag
      ? matchesCitySearch(post.city, activeTag, true) || containsHashtag(post.text, activeTag) || containsHashtag(post.question ?? "", activeTag)
      : !query || post.text.toLowerCase().includes(query) || matchesAuthor || (!query.startsWith("@") && matchesCitySearch(post.city, query));

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
        onCityChange={(city) => updateFilters({ city: city === "Все города" ? null : city })}
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
            Хэштег или город:{" "}
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
            onCityClick={handleCityClick}
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