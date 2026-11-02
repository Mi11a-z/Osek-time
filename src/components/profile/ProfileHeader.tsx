"use client";

import { useRef, type ChangeEvent } from "react";
import type { ProfileUser } from "../../data/profile";
import { ProfileAvatar } from "./ProfileAvatar";

type ProfileHeaderProps = {
  user: ProfileUser;
  avatar: string | null;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  stats: { posts: number; likes: number; comments: number; saved: number };
};

export function ProfileHeader({ user, avatar, onAvatarChange, stats }: ProfileHeaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <section className="pf-hero">
      <div className="pf-cover" aria-hidden="true" />
      <div className="pf-hero-body">
        <div className="pf-avatar-wrap">
          <ProfileAvatar avatar={avatar} name={user.name} />
          <button type="button" className="pf-avatar-edit" aria-label="Загрузить фото профиля" onClick={() => fileInput.current?.click()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </button>
          <input ref={fileInput} type="file" accept="image/*" onChange={onAvatarChange} hidden />
        </div>

        <div className="pf-identity">
          <h1 className="pf-name">{user.name}</h1>
          <p className="pf-handle">@{user.username} <span aria-hidden="true">·</span> {user.city}, Казахстан</p>
          <p className="pf-bio">{user.bio}</p>
        </div>

        <button type="button" className="pf-edit">Редактировать</button>
      </div>

      <div className="pf-stats">
        <div><strong>{stats.posts}</strong><span>Публикации</span></div>
        <div><strong>{stats.likes}</strong><span>Лайки</span></div>
        <div><strong>{stats.comments}</strong><span>Комментарии</span></div>
        <div><strong>{stats.saved}</strong><span>Сохранено</span></div>
      </div>
    </section>
  );
}
