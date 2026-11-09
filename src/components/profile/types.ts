import type { ProfileUser } from "../../data/profile";
import type { LocalPost } from "../../data/local-store";

// Пост с необязательным фото и списком комментариев
export type MyPost = LocalPost;

// Пользователь + страна
export type MyUser = ProfileUser & {
  country: string;
};
