"use client";

import { formatTime } from "../../data/format-time";

import { renderTextWithHashtags } from "../../hashtag";
import { CityLink } from "../posts/CityLink";

import { useState } from "react";
import Link from "next/link";
import { Comments } from "../Comments";
import { PostActions } from "../posts/PostActions";
import { PostPoll } from "../posts/PostPoll";
import { PostMenu } from "./PostMenu";
import { ProfileAvatar } from "./ProfileAvatar";
import { PostAuthorLabel } from "../posts/PostAuthorLabel";
import type { MyPost } from "./types";
import type { LocalComment } from "../../data/local-store";
import { setLocalPinned } from "../../data/local-store";

type ProfilePostCardProps = {
  post: MyPost;
  onLike: (id: number) => boolean;
  onSave: (id: number) => boolean;
  onDelete: (id: number) => boolean;
  onEdit: (id: number, text: string) => boolean;
  onAddComment: (id: number, text: string, isAnonymous: boolean) => boolean;
  onDeleteComment: (id: number, index: number, expectedComments: readonly LocalComment[]) => boolean;
};



export function ProfilePostCard({
  post,
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

  const canSave = draft.trim().length > 0 || Boolean(post.image || post.poll);

  function startEdit() {
    setDraft(post.text);
    setEditing(true);
  }

  function saveEdit() {
    if (!canSave) return;
    if (onEdit(post.id, draft.trim())) setEditing(false);
  }

  return (
    <article className="border-solid border-line bg-surface [padding:var(--cards-profile-padding)] [border-width:var(--borders-thin)] [border-radius:var(--cards-profile-radius)]">
      {post.pinned && <p className="mb-2 text-xs font-semibold text-coral-deep">Закреплено</p>}
      <header className="mb-3.5 flex items-center gap-3.5">
        <ProfileAvatar avatar={post.named ? post.avatar ?? null : null} name={post.author} variant="post" />
        <div>
          <PostAuthorLabel author={post.author} named={post.named} username={post.authorUsername} className="block [font-size:var(--font-sizes-body-large)] [font-weight:var(--font-weights-heavy)]" />
          <span className="block text-muted [font-size:var(--font-sizes-meta)]"><CityLink city={post.city} /> · {formatTime(post.minutes)}</span>
        </div>
      </header>
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
        post.text && <p className="mt-3.5 leading-[1.5] [font-size:var(--font-sizes-author)] [overflow-wrap:anywhere]">{renderTextWithHashtags(post.text, undefined, `/post/${post.id}`)}</p>
      )}

      {post.image && (
        <Link href={`/post/${post.id}`} aria-label="Открыть публикацию" className="mx-auto mt-3.5 block w-fit max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt={post.imageAlt ?? ""} className="block h-auto max-h-[min(75svh,650px)] w-auto max-w-full rounded-xl object-contain" />
        </Link>
      )}

      {post.poll && <PostPoll postId={post.id} poll={post.poll} />}

      <PostActions
        likes={post.likes}
        isLiked={post.liked}
        isSaved={post.saved}
        commentCount={post.comments.length}
        onLike={() => onLike(post.id)}
        onSave={() => onSave(post.id)}
        onToggleComments={() => setShowComments((v) => !v)}
        commentsOpen={showComments}
        menu={<PostMenu onEdit={startEdit} onDelete={() => onDelete(post.id)} pinned={post.pinned} onPin={post.named ? () => setLocalPinned(post.id, !post.pinned) : undefined} />}
        separated
      />

      <div hidden={!showComments}>
        <Comments
          comments={post.comments}
          onAdd={(text, isAnonymous) => onAddComment(post.id, text, isAnonymous)}
          onDelete={(index) => onDeleteComment(post.id, index, post.comments)}
          variant="feed"
        />
      </div>
    </article>
  );
}
