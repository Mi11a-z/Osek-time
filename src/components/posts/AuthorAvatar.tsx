import Image from "next/image";
import "./author-avatar.css";

type AuthorAvatarProps = {
  author: string;
  src?: string;
  className: string;
};

export function AuthorAvatar({ author, src, className }: AuthorAvatarProps) {
  if (src?.trim()) {
    return <Image className={className} src={src} alt="" width={60} height={60} />;
  }

  const initial = author.trim().charAt(0).toLocaleUpperCase("ru") || "?";

  return (
    <span className={`${className} author-avatar-placeholder`} aria-hidden="true">
      {initial}
    </span>
  );
}
