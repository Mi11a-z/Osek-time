"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { initialProfilePosts, profileUser, type ProfileTab } from "../../data/profile";
import { BackHeader } from "../ui/BackHeader";
import { EditProfileModal, type ProfileForm } from "./EditProfileModal";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePostCard } from "./ProfilePostCard";
import { ProfilePostComposer } from "./Profilepostcomposer";
import { ProfileTabs } from "./ProfileTabs";
import type { MyPost, MyUser } from "./types";

const defaultUser: MyUser = { ...profileUser, country: "Казахстан" };

export function ProfileView() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [myPosts, setMyPosts] = useState<MyPost[]>(initialProfilePosts);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [user, setUser] = useState<MyUser>(defaultUser);
  const [editingProfile, setEditingProfile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // загрузка сохранённых данных
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

  // сохранение постов (после загрузки, чтобы не затереть данные)
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

  const visiblePosts = myPosts.filter((post) => {
    if (activeTab === "likes") return post.liked;
    if (activeTab === "saved") return post.saved;
    if (activeTab === "comments") return false;
    return true;
  });

  const stats = {
    posts: myPosts.length,
    likes: myPosts.reduce((sum, post) => sum + post.likes, 0),
    comments: myPosts.reduce((sum, post) => sum + post.comments, 0),
    saved: myPosts.filter((post) => post.saved).length,
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
      />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "posts" && <ProfilePostComposer onPublish={addPost} />}

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