"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { ProfileTab } from "../../data/profile";
import {
  useLocalData, toggleLocalLike, toggleLocalSaved,
  deleteLocalPost, editLocalPost, addLocalComment, deleteLocalComment,
  saveLocalProfile, saveLocalAvatar,
} from "../../data/local-store";
import { AdminUnlockDialog } from "../admin/AdminUnlockDialog";
import { accountReports, canViewAccountReports, setRole, useModeration } from "../../moderation";
import { BackHeader } from "../ui/BackHeader";
import { PostCard } from "../posts/PostCard";
import { EditProfileModal, type ProfileForm } from "./EditProfileModal";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePostCard } from "./ProfilePostCard";
import { PostComposer } from "../feed/PostComposer";
import { ProfileTabs } from "./ProfileTabs";
import { followersOf, setFollowing, useFollowGraph } from "../../data/follows";
import { FollowListDialog, type FollowAccount } from "./FollowListDialog";


export function ProfileView() {
  const local = useLocalData();
  const { ready, posts, profile: user, avatar, error } = local;
  const moderation = useModeration();
  const [unlocking, setUnlocking] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
  const [readingAvatar, setReadingAvatar] = useState(false);
  const [followList, setFollowList] = useState<"following" | "followers" | null>(null);
  const followGraph = useFollowGraph();
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
  const accounts: FollowAccount[] = Array.from(new Map<string, FollowAccount>([
    { username: user.username.toLowerCase(), name: user.name, city: user.city, avatar: avatar ?? undefined },
    ...posts.filter((post) => post.named).map((post) => ({ username: (post.authorUsername ?? (post.isOwn ? user.username : post.author.toLowerCase())).toLowerCase(), name: post.isOwn ? user.name : post.author, city: post.city, avatar: post.avatar })),
  ].map((account) => [account.username, account] as [string, FollowAccount])).values());
  const accountByUsername = new Map(accounts.map((account) => [account.username, account]));
  const followingUsernames = followGraph[user.username.toLowerCase()] ?? [];
  const followerUsernames = followersOf(followGraph, user.username.toLowerCase());
  const reportsCount = canViewAccountReports(moderation.role)
    ? accountReports(moderation.reports, user.username, local).length
    : undefined;
  const followAccounts = (usernames: string[]): FollowAccount[] => usernames.flatMap((username) => {
    const account = accountByUsername.get(username);
    return account ? [account] : [];
  });

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
  if (activeTab === "posts") visiblePosts.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  const stats = {
    posts: ownPosts.length,
    following: followingUsernames.length,
    followers: followerUsernames.length,
  };

  return (
    <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]">
      <BackHeader prefix="pf" />
      {!ready || !moderation.ready ? <p role="status" className="py-[50px] text-center text-muted">Загружаем профиль…</p> : (
        <>
          <ProfileHeader user={user} avatar={avatar} onAvatarChange={handleAvatar} stats={stats} onEdit={() => setEditingProfile(true)} isAdmin={isAdmin} reportsCount={reportsCount} onLeaveModeration={moderation.role === "moderator" ? () => setRole("user") : undefined} onShowFollowing={() => setFollowList("following")} onShowFollowers={() => setFollowList("followers")} />
          {error && <p role="alert" className="mt-4 rounded-xl bg-peach p-4 text-coral-deep">{error}</p>}
          {avatarError && <p role="alert" className="mt-3 text-coral-deep">{avatarError}</p>}
          {readingAvatar && <p role="status" className="mt-3 text-muted">Читаем фото…</p>}
          {avatarDraft && <button type="button" onClick={() => persistAvatar(avatarDraft)} className="mt-3 cursor-pointer text-coral-deep underline">Повторить сохранение выбранного фото</button>}
          <ProfileTabs activeTab={activeTab} onChange={setActiveTab}>
            {!isBlocked && <PostComposer variant="profile" onPublished={() => setActiveTab("posts")} />}
          </ProfileTabs>
          {activeTab === "posts" && isBlocked && (
            <p className="mb-5 rounded-[var(--cards-profile-radius)] border-solid border-coral bg-peach px-5 py-4 text-coral-deep [border-width:var(--borders-thin)]">Ваш аккаунт заблокирован модератором: публиковать новые посты нельзя.</p>
          )}
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
          {followList && <FollowListDialog title={followList === "following" ? "Подписки" : "Подписчики"} accounts={followAccounts(followList === "following" ? followingUsernames : followerUsernames)} viewerUsername={user.username.toLowerCase()} followedUsernames={followingUsernames} onToggleFollow={(target, follow) => setFollowing(user.username, target, follow)} onClose={() => setFollowList(null)} />}
        </>
      )}
      {unlocking && <AdminUnlockDialog onClose={() => setUnlocking(false)} />}
    </main>
  );
}
