import Image from "next/image";

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
    <span className={`${className} grid place-items-center [background:var(--colors-avatar)] text-ink font-display [font-size:var(--font-sizes-heading)] [font-weight:var(--font-weights-bold)]`} aria-hidden="true">
      {initial}
    </span>
  );
}
