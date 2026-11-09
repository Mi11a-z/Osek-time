"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { ProfileTab } from "../../data/profile";
import {
  useLocalData, createLocalPost, toggleLocalLike, toggleLocalSaved,
  deleteLocalPost, editLocalPost, addLocalComment, deleteLocalComment,
  saveLocalProfile, saveLocalAvatar,
} from "../../data/local-store";
import { AdminUnlockDialog } from "../admin/AdminUnlockDialog";
import { useModeration } from "../../moderation";
import { BackHeader } from "../ui/BackHeader";
import { PostCard } from "../posts/PostCard";
import { EditProfileModal, type ProfileForm } from "./EditProfileModal";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePostCard } from "./ProfilePostCard";
import { ProfilePostComposer } from "./Profilepostcomposer";
import { ProfileTabs } from "./ProfileTabs";

export function ProfileView() {
  const { ready, posts, profile: user, avatar, error } = useLocalData();
  const moderation = useModeration();
  const [unlocking, setUnlocking] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
  const [readingAvatar, setReadingAvatar] = useState(false);
  const avatarRequest = useRef(0);

  useEffect(() => {
    const open = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.code === "KeyA") {
        event.preventDefault();
        setUnlocking(true);
      }
    };
    window.addEventListener("keydown", open);
    return () => { window.removeEventListener("keydown", open); avatarRequest.current += 1; };
  }, []);

  const isAdmin = moderation.role === "admin";
  const isBlocked = moderation.blocked.includes(user.username) || moderation.blocked.includes(user.name);

  function persistAvatar(value: string) {
    if (!saveLocalAvatar(value)) { setAvatarDraft(value); return; }
    setAvatarDraft(null);
    setAvatarError("");
  }

  function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const request = ++avatarRequest.current;
    setAvatarError("");
    setReadingAvatar(false);
    if (!file.type.startsWith("image/")) { setAvatarError("Выберите изображение для фото профиля."); return; }
    setReadingAvatar(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (request !== avatarRequest.current) return;
      setReadingAvatar(false);
      if (typeof reader.result === "string") persistAvatar(reader.result);
      else setAvatarError("Не удалось прочитать фото. Попробуйте ещё раз.");
    };
    reader.onerror = () => {
      if (request !== avatarRequest.current) return;
      setReadingAvatar(false);
      setAvatarError("Не удалось прочитать фото. Попробуйте ещё раз.");
    };
    reader.readAsDataURL(file);
  }

  function saveProfile(form: ProfileForm) {
    return saveLocalProfile(form);
  }

  function addPost(text: string, image?: string) {
    if (isBlocked) return false;
    const saved = createLocalPost({ text, image, isAnonymous: false, city: user.city });
    if (saved) setActiveTab("posts");
    return saved;
  }

  const availablePosts = posts.filter((post) => (
    !moderation.removed.includes(post.id) &&
    !(post.named && moderation.blocked.includes(post.author)) &&
    !(post.isOwn && isBlocked)
  ));
  const ownPosts = availablePosts.filter((post) => post.isOwn);
  const visiblePosts = availablePosts.filter((post) => {
    if (activeTab === "likes") return post.liked;
    if (activeTab === "saved") return post.saved;
    if (activeTab === "comments") return post.myCommentIndexes.length > 0;
    return post.isOwn;
  });
  const stats = {
    posts: ownPosts.length,
    likes: availablePosts.filter((post) => post.liked).length,
    comments: availablePosts.reduce((sum, post) => sum + post.myCommentIndexes.length, 0),
    saved: availablePosts.filter((post) => post.saved).length,
  };

  return (
    <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]">
      <BackHeader prefix="pf" />
      {!ready || !moderation.ready ? <p role="status" className="py-[50px] text-center text-muted">Загружаем профиль…</p> : (
        <>
          <ProfileHeader user={user} avatar={avatar} onAvatarChange={handleAvatar} stats={stats} onEdit={() => setEditingProfile(true)} isAdmin={isAdmin} />
          {error && <p role="alert" className="mt-4 rounded-xl bg-peach p-4 text-coral-deep">{error}</p>}
          {avatarError && <p role="alert" className="mt-3 text-coral-deep">{avatarError}</p>}
          {readingAvatar && <p role="status" className="mt-3 text-muted">Читаем фото…</p>}
          {avatarDraft && <button type="button" onClick={() => persistAvatar(avatarDraft)} className="mt-3 cursor-pointer text-coral-deep underline">Повторить сохранение выбранного фото</button>}
          <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === "posts" && (isBlocked ? (
            <p className="mb-5 rounded-[var(--cards-profile-radius)] border-solid border-coral bg-peach px-5 py-4 text-coral-deep [border-width:var(--borders-thin)]">Ваш аккаунт заблокирован модератором: публиковать новые посты нельзя.</p>
          ) : <ProfilePostComposer onPublish={addPost} />)}
          <section className="grid [gap:var(--profile-posts-gap)]" aria-label="Публикации">
            {visiblePosts.length === 0 ? <p className="py-[50px] text-center text-muted">{activeTab === "comments" ? "Здесь появятся публикации с вашими комментариями." : "Здесь пока ничего нет."}</p> : visiblePosts.map((post) => post.isOwn ? (
              <ProfilePostCard
                key={post.id} post={post} onLike={toggleLocalLike} onSave={toggleLocalSaved}
                onDelete={deleteLocalPost} onEdit={editLocalPost}
                onAddComment={addLocalComment} onDeleteComment={deleteLocalComment}
              />
            ) : <PostCard key={post.id} post={post} variant={post.image ? "photo" : "short"} />)}
          </section>
          {editingProfile && <EditProfileModal profile={user} onSave={saveProfile} onClose={() => setEditingProfile(false)} error={error} />}
        </>
      )}
      {unlocking && <AdminUnlockDialog onClose={() => setUnlocking(false)} />}
    </main>
  );
}
