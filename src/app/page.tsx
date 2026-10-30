import Image from "next/image";
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
      <button type="button" className="icon-button post-menu" aria-label="Действия с публикацией" aria-disabled="true"><Icon name="more" /></button>
    </header>
  );
}

function PostActions({ likes, separated = false }: { likes: number; separated?: boolean }) {
  return (
    <footer className={`post-actions${separated ? " post-actions-separated" : ""}`}>
      <button type="button" className="like-button" aria-label={`Нравится: ${likes}`} aria-disabled="true"><Icon name="heart" /><span>{likes}</span></button>
      <span className="action-divider" aria-hidden="true" />
      <button type="button" className="icon-button" aria-label="Сохранить публикацию" aria-disabled="true"><Icon name="bookmark" /></button>
      <button type="button" className="icon-button action-more" aria-label="Другие действия" aria-disabled="true"><Icon name="more" /></button>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="page-shell">
      <header className="masthead">
        <div className="brand">
          <h1 className="wordmark">Osek Time</h1>
          <p className="brand-caption">Обсуждают в Казахстане</p>
        </div>
        <nav className="main-navigation" aria-label="Основная навигация">
          <button type="button" className="navigation-item is-active" aria-current="page" aria-disabled="true"><Icon name="home" /><span>Лента</span></button>
          <button type="button" className="navigation-item" aria-disabled="true"><Icon name="flame" /><span>Популярное</span></button>
          <button type="button" className="navigation-item" aria-disabled="true"><Icon name="bookmark" /><span>Сохранённое</span></button>
          <button type="button" className="navigation-item" aria-disabled="true"><Icon name="user" /><span>Профиль</span></button>
        </nav>
      </header>

      <section className="feed-toolbar" aria-label="Города и поиск">
        <div className="city-filters" role="group" aria-label="Выбор города">
          <button type="button" className="city-chip is-selected" aria-pressed="true" aria-disabled="true"><Icon name="globe" />Все города</button>
          <button type="button" className="city-chip" aria-pressed="false" aria-disabled="true">Алматы</button>
          <button type="button" className="city-chip" aria-pressed="false" aria-disabled="true">Астана</button>
          <button type="button" className="city-chip" aria-pressed="false" aria-disabled="true">Шымкент</button>
        </div>
        <label className="search-field">
          <Icon name="search" />
          <input type="search" placeholder="Поиск по постам, городам, темам…" aria-label="Поиск по постам, городам и темам" readOnly />
        </label>
      </section>

      <section className="composer" aria-label="Новая публикация">
        <label className="composer-field">
          <Icon name="pencil" />
          <textarea rows={1} placeholder="Что обсуждают в твоём городе?" aria-label="Текст новой публикации" readOnly />
        </label>
        <div className="composer-controls">
          <div className="anonymous-control"><Icon name="mask" /><span>Анонимно</span><span className="anonymous-switch" role="switch" aria-checked="true" aria-disabled="true" aria-label="Анонимная публикация включена"><span /></span></div>
          <button type="button" className="publish-button" aria-disabled="true">Опубликовать</button>
          <p className="privacy-note"><Icon name="lock" /><span>Автор скрыт от читателей, но виден модераторам.</span></p>
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
            <Image className="city-photo" src="/images/almaty-evening.png" alt="Вечерний Алматы на фоне заснеженных гор в розовом свете заката" width={2172} height={724} sizes="(max-width: 800px) calc(100vw - 64px), (max-width: 1200px) 42vw, 570px" preload />
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
