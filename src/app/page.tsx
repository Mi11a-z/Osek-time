"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type IconName = "home" | "flame" | "bookmark" | "user" | "globe" | "search" | "pencil" | "lock" | "heart" | "more" | "mask";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />,
    flame: <path d="M13 3c1 5-3 5-3 9-2-1-3-3-3-5-3 3-4 6-3 9a8 8 0 0 0 15 1c2-5-1-8-3-10 0 3-1 4-2 4 1-3 1-5-1-8Z" />,
    bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
    user: <><circle cx="12" cy="7" r="4" /><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2Z" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    pencil: <><path d="m4 15-1 6 6-1L21 8a2 2 0 0 0 0-3l-2-2a2 2 0 0 0-3 0Z" /><path d="m14 5 5 5" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    more: <><circle cx="4" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="20" cy="12" r="1.5" /></>,
    mask: <path fillRule="evenodd" d="M3 4c3-1 6 1 9 1s6-2 9-1v7c0 5-4 9-9 11-5-2-9-6-9-11V4Zm3 6c1-1 4-1 5 1-1 3-5 2-5-1Zm7 1c1-2 4-2 5-1 0 3-4 4-5 1Z" />,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`icon icon-${name} ${className}`} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function PostAuthor({ named = false, city, minutes }: { named?: boolean; city: string; minutes: number }) {
  return (
    <header className="post-author">
      {named ? (
        <Image className="avatar avatar-person" src="/images/aidana-avatar.svg" alt="" width={60} height={60} />
      ) : (
        <span className="avatar avatar-anonymous"><Icon name="mask" /></span>
      )}
      <div className="author-details">
        <span className="author-name">{named ? "Айдана" : "Аноним"}</span>
        <span className="post-meta">{city}<span aria-hidden="true"> · </span>{minutes} мин</span>
      </div>
      <button type="button" className="icon-button post-menu" aria-label="Действия с публикацией"><Icon name="more" /></button>
    </header>
  );
}

function PostActions({ likes: initialLikes, separated = false }: { likes: number; separated?: boolean }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <footer className={`post-actions${separated ? " post-actions-separated" : ""}`}>
      <button
        type="button"
        onClick={handleLike}
        className={`like-button ${isLiked ? "is-liked" : ""}`}
        aria-pressed={isLiked}
        aria-label={`Нравится: ${likes}`}
      >
        <Icon name="heart" />
        <span>{likes}</span>
      </button>
      <span className="action-divider" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setIsSaved(!isSaved)}
        className={`icon-button save-button ${isSaved ? "is-saved" : ""}`}
        aria-pressed={isSaved}
        aria-label={isSaved ? "Убрать из сохранённого" : "Сохранить публикацию"}
      >
        <Icon name="bookmark" />
      </button>
      <button type="button" className="icon-button action-more" aria-label="Другие действия"><Icon name="more" /></button>
    </footer>
  );
}

export default function Home() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Лента");
  const [activeCity, setActiveCity] = useState("Все города");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [postText, setPostText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const navItems: { name: string; icon: IconName }[] = [
    { name: "Лента", icon: "home" },
    { name: "Популярное", icon: "flame" },
    { name: "Сохранённое", icon: "bookmark" },
    { name: "Профиль", icon: "user" },
  ];

  const cities = ["Все города", "Алматы", "Астана", "Шымкент"];

  const handlePublish = () => {
    if (!postText.trim()) {
      alert("Напишите текст публикации!");
      return;
    }
    alert(`Пост опубликован (${isAnonymous ? "Анонимно" : "От вашего имени"})!`);
    setPostText("");
  };

  return (
    <main className="page-shell">
      <header className="masthead">
        <div className="brand">
          <h1 className="wordmark">Osek Time</h1>
          <p className="brand-caption">Обсуждают в Казахстане</p>
        </div>
        <nav className="main-navigation" aria-label="Основная навигация">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() =>
                item.name === "Профиль" ? router.push("/profile") : setActiveNav(item.name)
              }
              className={`navigation-item ${activeNav === item.name ? "is-active" : ""}`}
              aria-current={activeNav === item.name ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </header>

      <section className="feed-toolbar" aria-label="Города и поиск">
        <div className="city-filters" role="group" aria-label="Выбор города">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setActiveCity(city)}
              className={`city-chip ${activeCity === city ? "is-selected" : ""}`}
              aria-pressed={activeCity === city}
            >
              {city === "Все города" && <Icon name="globe" />}
              {city}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Icon name="search" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по постам, городам, темам…"
            aria-label="Поиск по постам, городам и темам"
          />
        </label>
      </section>

      <section className="composer" aria-label="Новая публикация">
        <label className="composer-field">
          <Icon name="pencil" />
          <textarea
            rows={1}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Что обсуждают в твоём городе?"
            aria-label="Текст новой публикации"
          />
        </label>
        <div className="composer-controls">
          <div
            className="anonymous-control"
            onClick={() => setIsAnonymous(!isAnonymous)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", userSelect: "none" }}
          >
            <Icon name="mask" />
            <span>Анонимно</span>
            <div
              style={{
                width: "54px",
                height: "32px",
                borderRadius: "20px",
                backgroundColor: isAnonymous ? "var(--coral)" : "#cbd5e1",
                padding: "4px",
                transition: "background-color 0.2s ease",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center"
              }}
            >
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#fffaf4",
                  boxShadow: "0 1px 3px rgba(16, 34, 63, 0.2)",
                  transform: isAnonymous ? "translateX(22px)" : "translateX(0px)",
                  transition: "transform 0.2s ease"
                }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            className="publish-button"
          >
            Опубликовать
          </button>
          <p className="privacy-note">
            <Icon name="lock" />
            <span>Автор скрыт от читателей, но виден модераторам.</span>
          </p>
        </div>
      </section>

      <section className="feed-grid" aria-label="Лента публикаций">
        <article className="post-card featured-post">
          <PostAuthor city="Алматы" minutes={12} />
          <span className="city-tag"># Алматы</span>
          <blockquote className="featured-body">
            <span className="quote-mark" aria-hidden="true">“</span>
            <div>
              <p className="featured-quote">Кажется, весь город нашёл одну и ту же кофейню.</p>
              <p className="featured-question">Где теперь пить кофе без очереди?</p>
            </div>
          </blockquote>
          <PostActions likes={128} separated />
        </article>

        <div className="secondary-posts">
          <article className="post-card photo-post">
            <PostAuthor named city="Алматы" minutes={28} />
            <span className="city-tag"># Алматы</span>
            <p className="post-copy">Вечерний Алматы — отдельный вид любви. Делитесь любимыми маршрутами для прогулок.</p>
            <Image
              className="city-photo"
              src="/images/almaty-evening.png"
              alt="Вечерний Алматы на фоне заснеженных гор в розовом свете заката"
              width={2172}
              height={724}
              sizes="(max-width: 800px) calc(100vw - 64px), (max-width: 1200px) 42vw, 570px"
            />
            <PostActions likes={86} />
          </article>
          <article className="post-card short-post">
            <PostAuthor city="Астана" minutes={45} />
            <span className="city-tag"># Астана</span>
            <p className="post-copy">Какой район вы бы выбрали для жизни и почему?</p>
            <PostActions likes={54} />
          </article>
        </div>
      </section>
    </main>
  );
}