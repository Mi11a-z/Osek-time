type ProfileAvatarProps = {
  avatar: string | null;
  name: string;
  variant?: "profile" | "post";
};

export function ProfileAvatar({ avatar, name, variant = "profile" }: ProfileAvatarProps) {
  const className = variant === "profile" ? "pf-avatar" : "pf-post-avatar";

  if (avatar) {
    return (
      // Uploaded data URLs are displayed directly rather than sent through image optimization.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatar} alt={variant === "profile" ? `Фото профиля: ${name}` : ""} className={className} />
    );
  }

  return <span className={`${className} pf-avatar-empty`}>{name[0]}</span>;
}
