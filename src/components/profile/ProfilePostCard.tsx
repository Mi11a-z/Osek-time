"use client";

import { useState } from "react";
import type { ProfilePost, ProfileUser } from "../../data/profile";
import { PostActions } from "../posts/PostActions";
import { PostMenu } from "./PostMenu";
import { ProfileAvatar } from "./ProfileAvatar";

type ProfilePostCardProps = {
  post: ProfilePost;
  user: ProfileUser;
  avatar: string | null;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
};

function formatTime(minutes: number) {
  return minutes < 60 ? `${minutes} мин` : `${Math.floor(minutes / 60)} ч`;
}

export function ProfilePostCard({ post, user, avatar, onLike, onSave, onDelete, onEdit }: ProfilePostCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);

  function startEdit() {
    setDraft(post.text);
    setEditing(true);
  }

  function saveEdit() {
    const text = draft.trim();
    if (!text) return;
    onEdit(post.id, text);
    setEditing(false);
  }

  return (
    <article className="border-solid border-line bg-surface [padding:var(--cards-profile-padding)] [border-width:var(--borders-thin)] [border-radius:var(--cards-profile-radius)]">
      <header className="mb-3.5 flex items-center gap-3.5">
        <ProfileAvatar avatar={avatar} name={user.name} variant="post" />
        <div>
          <span className="block [font-size:var(--font-sizes-body-large)] [font-weight:var(--font-weights-heavy)]">{user.name}</span>
          <span className="block text-muted [font-size:var(--font-sizes-meta)]">{user.city} · {formatTime(post.minutes)}</span>
        </div>
      </header>
      <span className="inline-block rounded-[var(--radii-tag)] bg-peach px-3 py-1.5 text-coral-deep [font-size:var(--font-sizes-meta)] [font-weight:var(--font-weights-bold)]"># {user.city}</span>

      {editing ? (
        <div className="mt-3.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            className="w-full rounded-xl border-solid border-line bg-transparent px-3.5 py-2.5 [border-width:var(--borders-thin)] focus:border-coral focus:outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="cursor-pointer rounded-[var(--radii-pill)] border-solid border-line bg-transparent px-4 py-2 [border-width:var(--borders-thin)]">
              Отмена
            </button>
            <button type="button" disabled={!draft.trim()} onClick={saveEdit} className="cursor-pointer rounded-[var(--radii-pill)] border-0 bg-coral px-4 py-2 [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] disabled:opacity-50">
              Сохранить
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3.5 leading-[1.5] [font-size:var(--font-sizes-author)]">{post.text}</p>
      )}

      <PostActions
        likes={post.likes}
        isLiked={post.liked}
        isSaved={post.saved}
        commentCount={post.comments}
        onLike={() => onLike(post.id)}
        onSave={() => onSave(post.id)}
        menu={<PostMenu onEdit={startEdit} onDelete={() => onDelete(post.id)} />}
        separated
      />
    </article>
  );
}