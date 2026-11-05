"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { initialProfilePosts, profileUser, type ProfileTab } from "../../data/profile";
import { BackHeader } from "../ui/BackHeader";
import { EditProfileModal, type ProfileForm } from "./EditProfileModal";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePostCard } from "./ProfilePostCard";
import { ProfileTabs } from "./ProfileTabs";

export function ProfileView() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [myPosts, setMyPosts] = useState(initialProfilePosts);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [user, setUser] = useState(profileUser);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("osek-avatar");
      if (saved) setAvatar(saved);
      const savedProfile = localStorage.getItem("osek-profile");
      if (savedProfile) setUser((u) => ({ ...u, ...JSON.parse(savedProfile) }));
    } catch {}
  }, []);

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
            />
          ))
        )}
      </section>

      {editingProfile && (
        <EditProfileModal
          profile={{ name: user.name, city: user.city, bio: user.bio }}
          onSave={saveProfile}
          onClose={() => setEditingProfile(false)}
        />
      )}
    </main>
  );
}