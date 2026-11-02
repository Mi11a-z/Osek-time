"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { initialProfilePosts, profileUser, type ProfileTab } from "../../data/profile";
import { BackHeader } from "../ui/BackHeader";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePostCard } from "./ProfilePostCard";
import { ProfileTabs } from "./ProfileTabs";

export function ProfileView() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [myPosts, setMyPosts] = useState(initialProfilePosts);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("osek-avatar");
      if (saved) setAvatar(saved);
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
    <main className="pf-shell">
      <BackHeader prefix="pf" />
      <ProfileHeader user={profileUser} avatar={avatar} onAvatarChange={handleAvatar} stats={stats} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      <section className="pf-feed" aria-label="Публикации">
        {activeTab === "comments" ? (
          <p className="pf-empty">История комментариев пока недоступна.</p>
        ) : visiblePosts.length === 0 ? (
          <p className="pf-empty">Здесь пока ничего нет.</p>
        ) : (
          visiblePosts.map((post) => (
            <ProfilePostCard key={post.id} post={post} user={profileUser} avatar={avatar} onLike={toggleLike} onSave={toggleSave} />
          ))
        )}
      </section>
    </main>
  );
}
