import type { ReactNode } from "react";

export type IconName = "home" | "flame" | "bookmark" | "user" | "globe" | "search" | "pencil" | "lock" | "heart" | "more" | "mask" | "comment";

const paths: Record<IconName, ReactNode> = {
  home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />,
  flame: <path d="M13 3c1 5-3 5-3 9-2-1-3-3-3-5-3 3-4 6-3 9a8 8 0 0 0 15 1c2-5-1-8-3-10 0 3-1 4-2 4 1-3 1-5-1-8Z" />,
  bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
  user: <><circle cx="12" cy="7" r="4" /><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2Z" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  pencil: <><path d="m4 15-1 6 6-1L21 8a2 2 0 0 0 0-3l-2-2a2 2 0 0 0-3 0Z" /><path d="m14 5 5 5" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  more: <><circle cx="4" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="20" cy="12" r="1.5" /></>,
  mask: <path fillRule="evenodd" d="M3 4c3-1 6 1 9 1s6-2 9-1v7c0 5-4 9-9 11-5-2-9-6-9-11V4Zm3 6c1-1 4-1 5 1-1 3-5 2-5-1Zm7 1c1-2 4-2 5-1 0 3-4 4-5 1Z" />,
  comment: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
};

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`icon icon-${name} ${className}`} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
