"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import "./profile.css";

type Tab = "posts" | "likes" | "comments" | "saved";

const user = {
  name: "Абылай",
  username: "aba_12",
  city: "Астана",
  bio: "Обсуждаю новости и интересные события Казахстана.",
};

const initialPosts = [
  { id: 1, text: "Какие интересные места есть в Астане?", likes: 24, comments: 8, saved: false, liked: false, minutes: 45 },
  { id: 2, text: "Сегодня в городе отличная погода!", likes: 15, comments: 3, saved: true, liked: true, minutes: 180 },
];

const tabs: { id: Tab; label: string }[] = [
  { id: "posts", label: "Публикации" },
  { id: "likes", label: "Лайки" },
  { id: "comments", label: "Комментарии" },
  { id: "saved", label: "Сохранённое" },
];

function formatTime(minutes: number) {
  return minutes < 60 ? `${minutes} мин` : `${Math.floor(minutes / 60)} ч`;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [myPosts, setMyPosts] = useState(initialPosts);
  const [avatar, setAvatar] = useState<string | null>(null);

  // Сохраняем фото в браузере, чтобы оно не пропадало после обновления страницы
  useEffect(() => {
    try {
      const saved = localStorage.getItem("osek-avatar");
      if (saved) setAvatar(saved);
    } catch {}
  }, []);

  function handleAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatar(result);
      try {
        localStorage.setItem("osek-avatar", result);
      } catch {}
    };
    reader.readAsDataURL(file);
  }

  function toggleLike(id: number) {
    setMyPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
      )
    );
  }

  function toggleSave(id: number) {
    setMyPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
  }

  const visiblePosts = myPosts.filter((p) => {
    if (activeTab === "likes") return p.liked;
    if (activeTab === "saved") return p.saved;
    if (activeTab === "comments") return false;
    return true;
  });

  const totalLikes = myPosts.reduce((s, p) => s + p.likes, 0);
  const totalComments = myPosts.reduce((s, p) => s + p.comments, 0);
  const totalSaved = myPosts.filter((p) => p.saved).length;

  return (
    <main className="pf-shell">
      <header className="pf-masthead">
        <Link href="/" className="pf-wordmark">Osek Time</Link>
        <Link href="/" className="pf-back">← Вернуться в ленту</Link>
      </header>

      <section className="pf-hero">
        <div className="pf-cover" aria-hidden="true" />
        <div className="pf-hero-body">
          <div className="pf-avatar-wrap">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={`Фото профиля: ${user.name}`} className="pf-avatar" />
            ) : (
              <div className="pf-avatar pf-avatar-empty">{user.name[0]}</div>
            )}
            <label className="pf-avatar-edit" aria-label="Загрузить фото профиля">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              <input type="file" accept="image/*" onChange={handleAvatar} hidden />
            </label>
          </div>

          <div className="pf-identity">
            <h1 className="pf-name">{user.name}</h1>
            <p className="pf-handle">@{user.username} <span aria-hidden="true">·</span> {user.city}, Казахстан</p>
            <p className="pf-bio">{user.bio}</p>
          </div>

          <button type="button" className="pf-edit">Редактировать</button>
        </div>

        <div className="pf-stats">
          <div><strong>{myPosts.length}</strong><span>Публикации</span></div>
          <div><strong>{totalLikes}</strong><span>Лайки</span></div>
          <div><strong>{totalComments}</strong><span>Комментарии</span></div>
          <div><strong>{totalSaved}</strong><span>Сохранено</span></div>
        </div>
      </section>

      <nav className="pf-tabs" aria-label="Разделы профиля">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`pf-tab ${activeTab === t.id ? "is-active" : ""}`}
            aria-pressed={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="pf-feed" aria-label="Публикации">
        {activeTab === "comments" ? (
          <p className="pf-empty">История комментариев пока недоступна.</p>
        ) : visiblePosts.length === 0 ? (
          <p className="pf-empty">Здесь пока ничего нет.</p>
        ) : (
          visiblePosts.map((post) => (
            <article key={post.id} className="pf-post">
              <header className="pf-post-head">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="pf-post-avatar" />
                ) : (
                  <span className="pf-post-avatar pf-avatar-empty">{user.name[0]}</span>
                )}
                <div>
                  <span className="pf-post-name">{user.name}</span>
                  <span className="pf-post-meta">{user.city} · {formatTime(post.minutes)}</span>
                </div>
              </header>
              <span className="pf-tag"># {user.city}</span>
              <p className="pf-post-text">{post.text}</p>
              <footer className="pf-post-actions">
                <button
                  type="button"
                  className={`pf-action ${post.liked ? "is-liked" : ""}`}
                  aria-pressed={post.liked}
                  onClick={() => toggleLike(post.id)}
                >
                  {post.liked ? "♥" : "♡"} {post.likes}
                </button>
                <span className="pf-action-static">💬 {post.comments}</span>
                <button
                  type="button"
                  className={`pf-action pf-save ${post.saved ? "is-saved" : ""}`}
                  aria-pressed={post.saved}
                  onClick={() => toggleSave(post.id)}
                >
                  {post.saved ? "Сохранено" : "Сохранить"}
                </button>
              </footer>
            </article>
          ))
        )}
      </section>
    </main>
  );
}