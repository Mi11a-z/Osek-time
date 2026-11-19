"use client";

import { renderTextWithHashtags } from "../../hashtag";
import { CityLink } from "../posts/CityLink";

import Link from "next/link";
import { useRef, type ChangeEvent } from "react";
import type { MyUser } from "./types";
import { AccountReportsLink } from "./AccountReportsLink";
import { ProfileAvatar } from "./ProfileAvatar";

type ProfileHeaderProps = {
  user: MyUser;
  avatar: string | null;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  stats: { posts: number; following: number; followers: number };
  onEdit: () => void;
  isAdmin?: boolean;
  reportsCount?: number;
  onLeaveModeration?: () => void;
  onShowFollowing: () => void;
  onShowFollowers: () => void;
};

export function ProfileHeader({ user, avatar, onAvatarChange, stats, onEdit, isAdmin = false, reportsCount, onLeaveModeration, onShowFollowing, onShowFollowers }: ProfileHeaderProps) {
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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 font-display tracking-[-0.02em] [font-size:var(--font-sizes-profile-name)] [font-weight:var(--font-weights-heavy)]">{user.name}</h1>
            {isAdmin && (
              <span className="rounded-[var(--radii-tag)] bg-ink px-3 py-1 [color:var(--colors-white)] [font-size:var(--font-sizes-meta)] [font-weight:var(--font-weights-bold)]">
                Админ
              </span>
            )}
          </div>
          <p className="mt-1.5 text-muted">@{user.username} <span aria-hidden="true">·</span> <CityLink city={user.city} />, {user.country}</p>
          <p className="mt-3.5 leading-[1.5] [font-size:var(--font-sizes-body-medium)]">{renderTextWithHashtags(user.bio)}</p>
        </div>

        <div className="mt-4 flex min-w-40 flex-col items-stretch gap-2 max-[650px]:mt-0 max-[650px]:w-full">
          <button type="button" onClick={onEdit} className="cursor-pointer rounded-[var(--radii-pill)] border-solid border-ink bg-transparent px-[22px] py-3 text-ink [border-width:var(--borders-strong)] [font-weight:var(--font-weights-bold)] hover:bg-ink hover:[color:var(--colors-white)]">Редактировать</button>
          {isAdmin && (
            <Link href="/admin" className="rounded-[var(--radii-pill)] border-solid border-coral bg-coral px-[22px] py-3 text-center no-underline [border-width:var(--borders-strong)] [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] hover:bg-coral-deep">
              Админ-панель
            </Link>
          )}
          {reportsCount !== undefined && <AccountReportsLink username={user.username} count={reportsCount} />}
          {onLeaveModeration && <button type="button" className="text-sm text-muted hover:underline" onClick={onLeaveModeration}>Выйти из режима модерации</button>}
        </div>
      </div>

      <div className="grid grid-cols-3 border-solid border-line [border-top-width:var(--borders-thin)]">
        <div className="flex flex-col items-center gap-1 px-2 py-[18px]">
          <strong className="font-display [font-size:var(--font-sizes-stat)]">{stats.posts}</strong>
          <span className="text-muted [font-size:var(--font-sizes-label)]">Публикации</span>
        </div>
        <button type="button" onClick={onShowFollowers} className="flex cursor-pointer flex-col items-center gap-1 border-solid border-line bg-transparent px-2 py-[18px] [border-left-width:var(--borders-thin)] hover:bg-peach/30">
          <strong className="font-display [font-size:var(--font-sizes-stat)]">{stats.followers}</strong><span className="text-muted [font-size:var(--font-sizes-label)]">Подписчики</span>
        </button>
        <button type="button" onClick={onShowFollowing} className="flex cursor-pointer flex-col items-center gap-1 border-solid border-line bg-transparent px-2 py-[18px] [border-left-width:var(--borders-thin)] hover:bg-peach/30">
          <strong className="font-display [font-size:var(--font-sizes-stat)]">{stats.following}</strong><span className="text-muted [font-size:var(--font-sizes-label)]">Подписки</span>
        </button>
      </div>
    </section>
  );
}
