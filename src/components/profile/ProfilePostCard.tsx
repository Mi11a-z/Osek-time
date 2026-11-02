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
    <article className="pf-post">
      <header className="pf-post-head">
        <ProfileAvatar avatar={avatar} name={user.name} variant="post" />
        <div>
          <span className="pf-post-name">{user.name}</span>
          <span className="pf-post-meta">{user.city} · {formatTime(post.minutes)}</span>
        </div>
      </header>
      <span className="pf-tag"># {user.city}</span>
      <p className="pf-post-text">{post.text}</p>
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
