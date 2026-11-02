type ProfileAvatarProps = {
  avatar: string | null;
  name: string;
  variant?: "profile" | "post";
};

export function ProfileAvatar({ avatar, name, variant = "profile" }: ProfileAvatarProps) {
  const className = variant === "profile"
    ? "rounded-[var(--radii-round)] border-solid border-surface bg-ink object-cover [width:var(--avatars-profile-size)] [height:var(--avatars-profile-size)] [border-width:var(--borders-avatar)]"
    : "shrink-0 rounded-[var(--radii-round)] bg-ink object-cover [width:var(--avatars-profile-post-size)] [height:var(--avatars-profile-post-size)]";
  const initialSize = variant === "profile"
    ? "[font-size:var(--font-sizes-brand-profile)]"
    : "[font-size:var(--font-sizes-title)]";

  if (avatar) {
    return (
      // Uploaded data URLs are displayed directly rather than sent through image optimization.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatar} alt={variant === "profile" ? `Фото профиля: ${name}` : ""} className={`block ${className}`} />
    );
  }

  return <span className={`${className} flex items-center justify-center font-display [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] ${initialSize}`}>{name[0]}</span>;
}
