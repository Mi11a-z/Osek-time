import { posts as feedPosts, type Post } from "./posts";
import { initialProfilePosts, profileUser, type ProfileUser } from "./profile";

export type LocalComment = { id: string; text: string; username: string; isAnonymous: boolean };
export type LocalPost = Omit<Post, "comments"> & { authorUsername?: string; comments: LocalComment[]; legacyAnonymousComments: string[]; isOwn: boolean; liked: boolean; saved: boolean; myCommentIndexes: number[] };
export type LocalProfile = ProfileUser & { country: string };
export type LocalSnapshot = { ready: boolean; posts: LocalPost[]; profile: LocalProfile; avatar: string | null; error: string | null };
type LocalData = Pick<LocalSnapshot, "posts" | "profile" | "avatar">;
type Storage = { getItem(key: string): string | null; setItem(key: string, value: string): void };
type NewPost = { text: string; image?: string; isAnonymous?: boolean; city?: string };

export const LOCAL_STORAGE_KEY = "osek-local-v1";
export const LEGACY_STORAGE_KEYS = ["osek-posts", "osek-profile", "osek-avatar", "osek-saved-posts"];
const defaultProfile: LocalProfile = { ...profileUser, country: "Казахстан" };
export const EMPTY_LOCAL_SNAPSHOT: LocalSnapshot = { ready: false, posts: [], profile: defaultProfile, avatar: null, error: null };

class LocalDataError extends Error {}
const invalid = () => new LocalDataError("Сохранённые данные повреждены или имеют неизвестный формат. Они не перезаписаны.");
function record(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function integer(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0; }
function string(value: unknown, min = 0, max = 10000): value is string { return typeof value === "string" && value.length >= min && value.length <= max; }
function strings(value: unknown): value is string[] { return Array.isArray(value) && value.every((item) => string(item)); }
function parse(raw: string): unknown { try { return JSON.parse(raw); } catch { throw invalid(); } }
function username(value: unknown): value is string { return typeof value === "string" && /^[a-z0-9_.]{3,20}$/i.test(value); }

function readComment(value: unknown, version: 2 | 3 = 3): LocalComment {
  if (!record(value) || !string(value.id, 1, 100) || !/^[a-z0-9:_-]+$/i.test(value.id)
    || !string(value.text, 1) || !value.text.trim() || !username(value.username)
    || (version === 3 && typeof value.isAnonymous !== "boolean")) throw invalid();
  return { id: value.id, text: value.text, username: value.username, isAnonymous: version === 3 ? value.isAnonymous as boolean : false };
}

function migrateComments(postId: number, texts: string[], ownIndexes: number[], author: string, archive: string[] = []) {
  const comments: LocalComment[] = [];
  const legacyAnonymousComments = [...archive];
  const known = new Set(ownIndexes);
  texts.forEach((text, index) => {
    if (known.has(index)) {
      comments.push(readComment({ id: `legacy:${postId}:${index}`, text, username: author, isAnonymous: false }));
    } else legacyAnonymousComments.push(text);
  });
  return { comments, legacyAnonymousComments, myCommentIndexes: comments.map((_, index) => index) };
}

function newCommentId(data: LocalData) {
  const used = new Set(data.posts.flatMap((post) => post.comments.map((comment) => comment.id)));
  const base = globalThis.crypto?.randomUUID?.() ?? `comment:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  let id = base;
  let suffix = 1;
  while (used.has(id)) id = `${base}:${suffix++}`;
  return id;
}

function media(value: unknown): value is string {
  if (!string(value, 1, 12_000_000)) return false;
  if (/^\/images\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes("..")) return true;
  // FileReader produces base64 image URLs. Keep existing local images without
  // allowing scripts, external tracking URLs, or arbitrary URL schemes.
  const prefix = /^data:image\/(?:png|jpe?g|webp|gif|avif|bmp|svg\+xml|x-icon);base64,/.exec(value);
  if (!prefix) return false;
  const payload = value.slice(prefix[0].length);
  return payload.length > 0 && payload.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(payload);
}

function readProfile(value: unknown): LocalProfile {
  if (!record(value) || !string(value.name, 1, 1000) || !string(value.username, 1, 1000)
    || !string(value.city, 1, 1000) || !string(value.country, 1, 1000) || !string(value.bio)) throw invalid();
  return { name: value.name, username: value.username, city: value.city, country: value.country, bio: value.bio };
}

function readPost(value: unknown, version: 1 | 2 | 3, author: string): LocalPost {
  if (!record(value) || !integer(value.id) || value.id === 0 || typeof value.named !== "boolean"
    || !string(value.author, 1, 1000) || !string(value.city, 1, 1000) || !integer(value.minutes)
    || !string(value.text) || (!value.text.trim() && !media(value.image)) || !integer(value.likes) || !Array.isArray(value.comments)
    || typeof value.isOwn !== "boolean" || typeof value.liked !== "boolean" || typeof value.saved !== "boolean"
    || !Array.isArray(value.myCommentIndexes) || (value.liked && value.likes < 1)) throw invalid();
  const rawComments = value.comments;
  const indexes = value.myCommentIndexes;
  if (!indexes.every((index): index is number => integer(index) && index < rawComments.length) || new Set(indexes).size !== indexes.length) throw invalid();
  if (version === 1 && !strings(rawComments)) throw invalid();
  const archive = value.legacyAnonymousComments ?? (version === 1 ? [] : undefined);
  if (!strings(archive)) throw invalid();
  const commentData = version === 1
    ? migrateComments(value.id, rawComments as string[], indexes, author, archive)
    : { comments: rawComments.map((comment) => readComment(comment, version === 3 ? 3 : 2)), legacyAnonymousComments: [...archive], myCommentIndexes: [...indexes] };
  if (value.authorUsername !== undefined && !username(value.authorUsername)) throw invalid();
  for (const field of ["avatar", "image"] as const) if (value[field] !== undefined && !media(value[field])) throw invalid();
  for (const field of ["question", "imageAlt"] as const) if (value[field] !== undefined && !string(value[field])) throw invalid();
  return {
    id: value.id, named: value.named, author: value.author, authorUsername: value.authorUsername as string | undefined, city: value.city, minutes: value.minutes,
    text: value.text, likes: value.likes, ...commentData, isOwn: value.isOwn, liked: value.liked, saved: value.saved,
    avatar: value.avatar as string | undefined, image: value.image as string | undefined,
    question: value.question as string | undefined, imageAlt: value.imageAlt as string | undefined,
  };
}

function resolveOwnAuthors(data: LocalData): LocalData {
  return { ...data, posts: data.posts.map((post) => post.isOwn ? {
    ...post, author: post.named ? data.profile.username : "Аноним", avatar: post.named ? data.avatar ?? undefined : undefined,
    authorUsername: username(data.profile.username) ? data.profile.username : undefined,
  } : post) };
}

function readCanonical(raw: string): LocalData {
  const data = parse(raw);
  if (!record(data) || (data.version !== 1 && data.version !== 2 && data.version !== 3) || !Array.isArray(data.posts) || !(data.avatar === null || media(data.avatar))) throw invalid();
  const profile = readProfile(data.profile);
  const version = data.version;
  const posts = data.posts.map((post) => readPost(post, version, profile.username));
  if (new Set(posts.map((post) => post.id)).size !== posts.length) throw invalid();
  const commentIds = posts.flatMap((post) => post.comments.map((comment) => comment.id));
  if (new Set(commentIds).size !== commentIds.length) throw invalid();
  return resolveOwnAuthors({ posts, profile, avatar: data.avatar });
}

function migrateLegacy(storage: Storage): LocalData {
  const profileRaw = storage.getItem("osek-profile");
  const profileValue = profileRaw === null ? {} : parse(profileRaw);
  if (!record(profileValue)) throw invalid();
  const profile = readProfile({
    name: profileValue.name ?? defaultProfile.name, username: profileValue.username ?? defaultProfile.username,
    city: profileValue.city ?? defaultProfile.city, country: profileValue.country ?? defaultProfile.country,
    bio: profileValue.bio ?? defaultProfile.bio,
  });
  const avatarRaw = storage.getItem("osek-avatar");
  const avatar = avatarRaw === null || avatarRaw === "" || avatarRaw === "null" ? null : avatarRaw;
  if (avatar !== null && !media(avatar)) throw invalid();
  const savedRaw = storage.getItem("osek-saved-posts");
  const saved = savedRaw === null ? [] : parse(savedRaw);
  if (!Array.isArray(saved) || !saved.every((id) => integer(id) && id > 0)) throw invalid();
  const posts: LocalPost[] = feedPosts.map((post) => ({ ...post, comments: [], legacyAnonymousComments: [...post.comments], isOwn: false, liked: false, saved: saved.includes(post.id), myCommentIndexes: [] }));
  const oldPostsRaw = storage.getItem("osek-posts");
  const oldPosts: unknown = oldPostsRaw === null ? initialProfilePosts : parse(oldPostsRaw);
  if (!Array.isArray(oldPosts)) throw invalid();
  const usedIds = new Set(posts.map((post) => post.id));
  let fallbackId = 1003;
  for (const old of oldPosts) {
    if (!record(old) || !integer(old.id) || old.id === 0 || !string(old.text) || (!old.text.trim() && !media(old.image)) || !integer(old.likes)
      || typeof old.liked !== "boolean" || typeof old.saved !== "boolean" || !integer(old.minutes) || (old.liked && old.likes < 1)
      || (old.commentList !== undefined && !strings(old.commentList)) || (old.image !== undefined && !media(old.image))) throw invalid();
    // Profile IDs 1/2 used to refer to different posts from feed IDs 1/2.
    let id = old.id === 1 ? 1001 : old.id === 2 ? 1002 : old.id;
    if (usedIds.has(id) || (old.id !== 1 && old.id !== 2 && (id === 1001 || id === 1002))) {
      while (usedIds.has(fallbackId)) fallbackId++;
      id = fallbackId++;
    }
    usedIds.add(id);
    const comments = [...(old.commentList as string[] | undefined ?? [])];
    const anonymous = old.isAnonymous === true || old.named === false;
    posts.push({
      id, text: old.text, named: !anonymous, author: anonymous ? "Аноним" : profile.username, authorUsername: profile.username, city: profile.city,
      minutes: old.minutes, likes: old.likes, liked: old.liked, saved: old.saved, isOwn: true,
      ...migrateComments(id, comments, comments.map((_, index) => index), profile.username), image: old.image as string | undefined,
    });
  }
  return resolveOwnAuthors({ posts, profile, avatar });
}

function read(storage: Storage): LocalData {
  const raw = storage.getItem(LOCAL_STORAGE_KEY);
  return raw === null ? migrateLegacy(storage) : readCanonical(raw);
}

export function createLocalStore(getStorage: () => Storage) {
  let snapshot = EMPTY_LOCAL_SNAPSHOT;
  let loaded = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  function load() {
    try { snapshot = { ...read(getStorage()), ready: true, error: null }; }
    catch (error) { snapshot = { ...snapshot, ready: true, error: error instanceof LocalDataError ? error.message : "Не удалось прочитать данные браузера. Проверьте доступ к локальному хранилищу." }; }
    loaded = true;
  }
  function getSnapshot() { if (!loaded) load(); return snapshot; }
  function reload() { load(); emit(); }
  function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }

  function change(update: (data: LocalData) => LocalData): boolean {
    getSnapshot();
    let success = false;
    try {
      const storage = getStorage();
      // Never base a write on an old React render: another tab may have saved
      // unrelated changes since then. Invalid persisted data is not replaced.
      const next = resolveOwnAuthors(update(read(storage)));
      // Own avatars are derived from the profile; storing the same base64 image
      // in every post would multiply localStorage usage unnecessarily.
      const posts = next.posts.map((post) => post.isOwn ? { ...post, avatar: undefined } : post);
      storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ version: 3, ...next, posts }));
      snapshot = { ...next, ready: true, error: null };
      success = true;
    } catch (error) {
      snapshot = { ...snapshot, ready: true, error: error instanceof LocalDataError ? error.message : "Не удалось сохранить изменение. Проверьте свободное место и доступ к хранилищу браузера." };
    }
    emit();
    return success;
  }

  function updatePost(id: number, update: (post: LocalPost, data: LocalData) => LocalPost) {
    return change((data) => {
      if (!data.posts.some((post) => post.id === id)) throw new LocalDataError("Публикация уже удалена или не найдена.");
      return { ...data, posts: data.posts.map((post) => post.id === id ? update(post, data) : post) };
    });
  }
  function own(post: LocalPost) { if (!post.isOwn) throw new LocalDataError("Изменять можно только свои публикации."); }
  function content(value: unknown, allowEmpty = false) {
    if (typeof value !== "string" || (!allowEmpty && !value.trim()) || value.trim().length > 5000) throw new LocalDataError(allowEmpty ? "Текст должен быть не длиннее 5000 символов." : "Введите текст длиной от 1 до 5000 символов.");
    return value.trim();
  }

  return {
    getSnapshot, subscribe, reload,
    createLocalPost(input: NewPost) {
      return change((data) => {
        if (input.image !== undefined && !media(input.image)) throw new LocalDataError("Не удалось прочитать изображение. Выберите его ещё раз.");
        const text = content(input.text, input.image !== undefined);
        const city = input.city?.trim() || data.profile.city;
        if (city.length > 1000 || (input.isAnonymous !== undefined && typeof input.isAnonymous !== "boolean")) throw new LocalDataError("Проверьте параметры публикации.");
        const used = new Set(data.posts.map((post) => post.id));
        let id = Math.max(1, Date.now());
        while (used.has(id)) id++;
        if (!Number.isSafeInteger(id)) throw new LocalDataError("Не удалось создать номер публикации. Повторите попытку.");
        const post: LocalPost = {
          id, text, image: input.image, city, named: !input.isAnonymous, author: data.profile.username, authorUsername: data.profile.username, minutes: 0,
          likes: 0, comments: [], legacyAnonymousComments: [], liked: false, saved: false, isOwn: true, myCommentIndexes: [],
        };
        return { ...data, posts: [post, ...data.posts] };
      });
    },
    toggleLocalLike(id: number) { return updatePost(id, (post) => ({ ...post, liked: !post.liked, likes: Math.max(0, post.likes + (post.liked ? -1 : 1)) })); },
    toggleLocalSaved(id: number) { return updatePost(id, (post) => ({ ...post, saved: !post.saved })); },
    deleteLocalPost(id: number) {
      return change((data) => {
        const post = data.posts.find((entry) => entry.id === id);
        if (!post) throw new LocalDataError("Публикация уже удалена или не найдена.");
        own(post);
        return { ...data, posts: data.posts.filter((entry) => entry.id !== id) };
      });
    },
    editLocalPost(id: number, text: string) { return updatePost(id, (post) => { own(post); return { ...post, text: content(text, post.image !== undefined) }; }); },
    addLocalComment(id: number, text: string, isAnonymous = false) {
      return updatePost(id, (post, data) => {
        if (typeof isAnonymous !== "boolean") throw new LocalDataError("Выберите режим публикации комментария.");
        if (!username(data.profile.username)) throw new LocalDataError("Укажите корректный ник аккаунта в профиле, чтобы оставить комментарий.");
        const comment: LocalComment = { id: newCommentId(data), text: content(text), username: data.profile.username, isAnonymous };
        return { ...post, comments: [...post.comments, comment], myCommentIndexes: [...post.myCommentIndexes, post.comments.length] };
      });
    },
    deleteLocalComment(id: number, index: number, expectedComments?: readonly LocalComment[]) {
      return updatePost(id, (post) => {
        if (expectedComments && (expectedComments.length !== post.comments.length || expectedComments.some((comment, i) => {
          const current = post.comments[i];
          return comment.id !== current.id || comment.text !== current.text || comment.username !== current.username || comment.isAnonymous !== current.isAnonymous;
        }))) {
          throw new LocalDataError("Комментарии обновились в другой вкладке. Повторите удаление после обновления списка.");
        }
        if (!integer(index) || index >= post.comments.length) throw new LocalDataError("Комментарий уже удалён или не найден.");
        return { ...post, comments: post.comments.filter((_, i) => i !== index), myCommentIndexes: post.myCommentIndexes.filter((i) => i !== index).map((i) => i > index ? i - 1 : i) };
      });
    },
    saveLocalProfile(profile: LocalProfile) {
      return change((data) => {
        const next = readProfile(profile);
        if (!next.name.trim() || !next.city.trim() || !next.country.trim() || !/^[a-z0-9_.]{3,20}$/i.test(next.username)) throw new LocalDataError("Проверьте имя, юзернейм, город и страну.");
        return { ...data, profile: { name: next.name.trim(), username: next.username, city: next.city.trim(), country: next.country.trim(), bio: next.bio.trim() } };
      });
    },
    saveLocalAvatar(avatar: string | null) {
      return change((data) => {
        if (avatar !== null && !media(avatar)) throw new LocalDataError("Не удалось прочитать изображение профиля.");
        return { ...data, avatar };
      });
    },
  };
}
