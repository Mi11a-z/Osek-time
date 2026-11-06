import type { ProfilePost, ProfileUser } from "../../data/profile";

// Пост с необязательным фото и списком комментариев
export type MyPost = ProfilePost & {
  image?: string;
  commentList?: string[];
};

// Пользователь + страна
export type MyUser = ProfileUser & {
  country: string;
};