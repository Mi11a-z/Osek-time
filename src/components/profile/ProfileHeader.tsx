"use client";

import { useRef, type ChangeEvent } from "react";
import type { ProfileUser } from "../../data/profile";
import { ProfileAvatar } from "./ProfileAvatar";

type ProfileHeaderProps = {
  user: ProfileUser;
  avatar: string | null;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  stats: { posts: number; likes: number; comments: number; saved: number };
  onEdit: () => void;
};

export function ProfileHeader({ user, avatar, onAvatarChange, stats, onEdit }: ProfileHeaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <section className="overflow-hidden rounded-[var(--radii-panel)] border-solid border-ink bg-surface [border-width:var(--borders-strong)]">
      <div className="[height:var(--profile-cover-height)] [background:radial-gradient(circle_at_85%_20%,var(--colors-cover-glow),transparent_40%),linear-gradient(120deg,var(--ink)_0%,var(--colors-cover-middle)_45%,var(--coral)_100%)]" aria-hidden="true" />
      <div className="flex items-start [gap:var(--profile-hero-gap)] [padding:var(--profile-hero-padding)] max-[650px]:flex-wrap max-[650px]:[padding:var(--profile-hero-padding-at650)]">
        <div className="relative shrink-0 [margin-top:var(--profile-avatar-overlap)]">
          <ProfileAvatar avatar={avatar} name={user.name} />
          <button type="button" className="absolute right-0.5 bottom-0.5 grid size-[38px] cursor-pointer place-items-center rounded-[var(--radii-round)] border-solid border-surface bg-coral [border-width:var(--borders-focus)] [color:var(--colors-white)] hover:bg-coral-deep" aria-label="Загрузить фото профиля" onClick={() => fileInput.current?.click()}>
            <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </button>
          <input ref={fileInput} type="file" accept="image/*" onChange={onAvatarChange} hidden />
        </div>

        <div className="min-w-0 flex-1 pt-4">
          <h1 className="m-0 font-display tracking-[-0.02em] [font-size:var(--font-sizes-profile-name)] [font-weight:var(--font-weights-heavy)]">{user.name}</h1>
          <p className="mt-1.5 text-muted">@{user.username} <span aria-hidden="true">·</span> {user.city}, Казахстан</p>
          <p className="mt-3.5 leading-[1.5] [font-size:var(--font-sizes-body-medium)]">{user.bio}</p>
        </div>

        <button type="button" onClick={onEdit} className="mt-4 cursor-pointer rounded-[var(--radii-pill)] border-solid border-ink bg-transparent px-[22px] py-3 text-ink [border-width:var(--borders-strong)] [font-weight:var(--font-weights-bold)] hover:bg-ink hover:[color:var(--colors-white)]">Редактировать</button>
      </div>

      <div className="grid grid-cols-4 border-solid border-line [border-top-width:var(--borders-thin)] max-[650px]:grid-cols-2">
        <div className="flex flex-col items-center gap-1 px-2 py-[18px]">
          <strong className="font-display [font-size:var(--font-sizes-stat)]">{stats.posts}</strong>
          <span className="text-muted [font-size:var(--font-sizes-label)]">Публикации</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-solid border-line px-2 py-[18px] [border-left-width:var(--borders-thin)]">
          <strong className="font-display [font-size:var(--font-sizes-stat)]">{stats.likes}</strong>
          <span className="text-muted [font-size:var(--font-sizes-label)]">Лайки</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-solid border-line px-2 py-[18px] [border-left-width:var(--borders-thin)] max-[650px]:border-l-0 max-[650px]:[border-top-width:var(--borders-thin)]">
          <strong className="font-display [font-size:var(--font-sizes-stat)]">{stats.comments}</strong>
          <span className="text-muted [font-size:var(--font-sizes-label)]">Комментарии</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-solid border-line px-2 py-[18px] [border-left-width:var(--borders-thin)] max-[650px]:[border-top-width:var(--borders-thin)]">
          <strong className="font-display [font-size:var(--font-sizes-stat)]">{stats.saved}</strong>
          <span className="text-muted [font-size:var(--font-sizes-label)]">Сохранено</span>
        </div>
      </div>
    </section>
  );
}