"use client";

import { useState } from "react";
import { Comments } from "../Comments";
import { PostActions } from "../posts/PostActions";
import { PostMenu } from "./PostMenu";
import { ProfileAvatar } from "./ProfileAvatar";
import type { MyPost, MyUser } from "./types";

type ProfilePostCardProps = {
  post: MyPost;
  user: MyUser;
  avatar: string | null;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
  onAddComment: (id: number, text: string) => void;
  onDeleteComment: (id: number, index: number) => void;
};

function formatTime(minutes: number) {
  if (minutes < 1) return "только что";
  return minutes < 60 ? `${minutes} мин` : `${Math.floor(minutes / 60)} ч`;
}

export function ProfilePostCard({
  post,
  user,
  avatar,
  onLike,
  onSave,
  onDelete,
  onEdit,
  onAddComment,
  onDeleteComment,
}: ProfilePostCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);
  const [showComments, setShowComments] = useState(false);

  // у поста с фото текст может быть пустым
  const canSave = draft.trim().length > 0 || Boolean(post.image);

  function startEdit() {
    setDraft(post.text);
    setEditing(true);
  }

  function saveEdit() {
    if (!canSave) return;
    onEdit(post.id, draft.trim());
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
            <button type="button" disabled={!canSave} onClick={saveEdit} className="cursor-pointer rounded-[var(--radii-pill)] border-0 bg-coral px-4 py-2 [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] disabled:opacity-50">
              Сохранить
            </button>
          </div>
        </div>
      ) : (
        post.text && <p className="mt-3.5 leading-[1.5] [font-size:var(--font-sizes-author)] [overflow-wrap:anywhere]">{post.text}</p>
      )}

      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt="" className="mt-3.5 block max-h-[480px] w-full rounded-xl object-cover" />
      )}

      <PostActions
        likes={post.likes}
        isLiked={post.liked}
        isSaved={post.saved}
        commentCount={post.comments}
        onLike={() => onLike(post.id)}
        onSave={() => onSave(post.id)}
        onToggleComments={() => setShowComments((v) => !v)}
        commentsOpen={showComments}
        menu={<PostMenu onEdit={startEdit} onDelete={() => onDelete(post.id)} />}
        separated
      />

      <div hidden={!showComments}>
        <Comments
          comments={post.commentList ?? []}
          onAdd={(text) => onAddComment(post.id, text)}
          onDelete={(index) => onDeleteComment(post.id, index)}
          variant="feed"
        />
      </div>
    </article>
  );
}