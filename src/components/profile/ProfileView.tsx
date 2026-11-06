"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { initialProfilePosts, profileUser, type ProfileTab } from "../../data/profile";
import { AdminUnlockDialog } from "../admin/AdminUnlockDialog";
import { useModeration } from "../../moderation";
import { BackHeader } from "../ui/BackHeader";
import { EditProfileModal, type ProfileForm } from "./EditProfileModal";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePostCard } from "./ProfilePostCard";
import { ProfilePostComposer } from "./Profilepostcomposer";
import { ProfileTabs } from "./ProfileTabs";
import type { MyPost, MyUser } from "./types";

const defaultUser: MyUser = { ...profileUser, country: "Казахстан" };

export function ProfileView() {
  const [unlocking, setUnlocking] = useState(false);
  useEffect(() => {
    const open = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.code === "KeyA") {
        event.preventDefault();
        setUnlocking(true);
      }
    };
    window.addEventListener("keydown", open);
    return () => window.removeEventListener("keydown", open);
  }, []);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [myPosts, setMyPosts] = useState<MyPost[]>(initialProfilePosts);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [user, setUser] = useState<MyUser>(defaultUser);
  const [editingProfile, setEditingProfile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { role, removed, blocked } = useModeration();
  const isAdmin = role === "admin";
  const isBlocked = !isAdmin && blocked.includes(user.username);

  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem("osek-avatar");
      if (savedAvatar) setAvatar(savedAvatar);

      const savedProfile = localStorage.getItem("osek-profile");
      if (savedProfile) setUser((u) => ({ ...u, ...JSON.parse(savedProfile) }));

      const savedPosts = localStorage.getItem("osek-posts");
      if (savedPosts) {
        const parsed = JSON.parse(savedPosts);
        if (Array.isArray(parsed)) setMyPosts(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("osek-posts", JSON.stringify(myPosts));
    } catch {}
  }, [myPosts, hydrated]);

  function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
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

  function saveProfile(form: ProfileForm) {
    setUser((u) => ({ ...u, ...form }));
    try {
      localStorage.setItem("osek-profile", JSON.stringify(form));
    } catch {}
  }

  function addPost(text: string, image?: string) {
    if (isBlocked) return;
    const post = {
      id: Date.now(),
      text,
      image,
      likes: 0,
      liked: false,
      saved: false,
      comments: 0,
      minutes: 0,
      commentList: [],
    } as MyPost;
    setMyPosts((previous) => [post, ...previous]);
    setActiveTab("posts");
  }

  function toggleLike(id: number) {
    setMyPosts((previous) => previous.map((post) => (
      post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post
    )));
  }

  function toggleSave(id: number) {
    setMyPosts((previous) => previous.map((post) => (
      post.id === id ? { ...post, saved: !post.saved } : post
    )));
  }

  function deletePost(id: number) {
    setMyPosts((previous) => previous.filter((post) => post.id !== id));
  }

  function editPost(id: number, text: string) {
    setMyPosts((previous) => previous.map((post) => (post.id === id ? { ...post, text } : post)));
  }

  function addComment(id: number, text: string) {
    setMyPosts((previous) => previous.map((post) => (
      post.id === id
        ? { ...post, comments: post.comments + 1, commentList: [...(post.commentList ?? []), text] }
        : post
    )));
  }

  function deleteComment(id: number, index: number) {
    setMyPosts((previous) => previous.map((post) => (
      post.id === id
        ? {
            ...post,
            comments: Math.max(0, post.comments - 1),
            commentList: (post.commentList ?? []).filter((_, i) => i !== index),
          }
        : post
    )));
  }

  // посты, удалённые модератором, не показываем
  const ownPosts = myPosts.filter((post) => !removed.includes(post.id));

  const visiblePosts = ownPosts.filter((post) => {
    if (activeTab === "likes") return post.liked;
    if (activeTab === "saved") return post.saved;
    if (activeTab === "comments") return false;
    return true;
  });

  const stats = {
    posts: ownPosts.length,
    likes: ownPosts.reduce((sum, post) => sum + post.likes, 0),
    comments: ownPosts.reduce((sum, post) => sum + post.comments, 0),
    saved: ownPosts.filter((post) => post.saved).length,
  };

  return (
    <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]">
      <BackHeader prefix="pf" />
      <ProfileHeader
        user={user}
        avatar={avatar}
        onAvatarChange={handleAvatar}
        stats={stats}
        onEdit={() => setEditingProfile(true)}
        isAdmin={isAdmin}
      />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "posts" && (
        isBlocked ? (
          <p className="mb-5 rounded-[var(--cards-profile-radius)] border-solid border-coral bg-peach px-5 py-4 text-coral-deep [border-width:var(--borders-thin)]">
            Ваш аккаунт заблокирован модератором: публиковать новые посты нельзя.
          </p>
        ) : (
          <ProfilePostComposer onPublish={addPost} />
        )
      )}

      <section className="grid [gap:var(--profile-posts-gap)]" aria-label="Публикации">
        {activeTab === "comments" ? (
          <p className="py-[50px] text-center text-muted">История комментариев пока недоступна.</p>
        ) : visiblePosts.length === 0 ? (
          <p className="py-[50px] text-center text-muted">Здесь пока ничего нет.</p>
        ) : (
          visiblePosts.map((post) => (
            <ProfilePostCard
              key={post.id}
              post={post}
              user={user}
              avatar={avatar}
              onLike={toggleLike}
              onSave={toggleSave}
              onDelete={deletePost}
              onEdit={editPost}
              onAddComment={addComment}
              onDeleteComment={deleteComment}
            />
          ))
        )}
      </section>

      {unlocking && <AdminUnlockDialog onClose={() => setUnlocking(false)} />}
      {editingProfile && (
        <EditProfileModal
          profile={{
            name: user.name,
            username: user.username,
            city: user.city,
            country: user.country,
            bio: user.bio,
          }}
          onSave={saveProfile}
          onClose={() => setEditingProfile(false)}
        />
      )}
    </main>
  );
}