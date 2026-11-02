import type { ProfilePost, ProfileUser } from "../../data/profile";
import { PostActions } from "../posts/PostActions";
import { ProfileAvatar } from "./ProfileAvatar";

type ProfilePostCardProps = {
  post: ProfilePost;
  user: ProfileUser;
  avatar: string | null;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
};

function formatTime(minutes: number) {
  return minutes < 60 ? `${minutes} мин` : `${Math.floor(minutes / 60)} ч`;
}

export function ProfilePostCard({ post, user, avatar, onLike, onSave }: ProfilePostCardProps) {
  return (
    <article className="border-solid border-line bg-surface [padding:var(--cards-profile-padding)] [border-width:var(--borders-thin)] [border-radius:var(--cards-profile-radius)]">
      <header className="mb-3.5 flex items-center gap-3.5">
        <ProfileAvatar avatar={avatar} name={user.name} variant="post" />
        <div>
          <span className="block [font-size:var(--font-sizes-body-large)] [font-weight:var(--font-weights-heavy)]">{user.name}</span>
          <span className="block text-muted [font-size:var(--font-sizes-meta)]">{user.city} · {formatTime(post.minutes)}</span>
        </div>
      </header>
      <span className="inline-block rounded-[var(--radii-tag)] bg-peach px-3 py-1.5 text-coral-deep [font-size:var(--font-sizes-meta)] [font-weight:var(--font-weights-bold)]"># {user.city}</span>
      <p className="mt-3.5 leading-[1.5] [font-size:var(--font-sizes-author)]">{post.text}</p>
      <PostActions
        likes={post.likes}
        isLiked={post.liked}
        isSaved={post.saved}
        commentCount={post.comments}
        onLike={() => onLike(post.id)}
        onSave={() => onSave(post.id)}
        separated
      />
    </article>
  );
}
