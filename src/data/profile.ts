export type ProfileTab = "posts" | "likes" | "comments" | "saved";

export type ProfileUser = {
  name: string;
  username: string;
  city: string;
  bio: string;
};

export type ProfilePost = {
  id: number;
  text: string;
  likes: number;
  comments: number;
  saved: boolean;
  liked: boolean;
  minutes: number;
};

export const profileUser: ProfileUser = {
  name: "Абылай",
  username: "aba_12",
  city: "Астана",
  bio: "Обсуждаю новости и интересные события Казахстана.",
};

export const initialProfilePosts: ProfilePost[] = [
  { id: 1, text: "Какие интересные места есть в Астане?", likes: 24, comments: 0, saved: false, liked: false, minutes: 45 },
  { id: 2, text: "Сегодня в городе отличная погода!", likes: 15, comments: 0, saved: true, liked: true, minutes: 180 },
];

export const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: "posts", label: "Публикации" },
  { id: "likes", label: "Лайки" },
  { id: "comments", label: "Комментарии" },
  { id: "saved", label: "Сохранённое" },
];
