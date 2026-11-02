import { FeedHeader } from "../components/feed/FeedHeader";
import { FeedToolbar } from "../components/feed/FeedToolbar";
import { PostComposer } from "../components/feed/PostComposer";
import { PostCard } from "../components/posts/PostCard";
import { posts } from "../data/posts";

const shellClass = `w-full mx-auto [max-width:var(--layout-feed-max-width)] [padding:var(--layout-feed-padding)]
  min-[1600px]:[padding-top:var(--layout-feed-wide-top-from1600)]
  max-[1240px]:[padding:var(--layout-feed-padding-at1240)]
  max-[800px]:[max-width:var(--layout-feed-max-width-at800)] max-[800px]:[padding:var(--layout-feed-padding-at800)]
  max-[480px]:[padding:var(--layout-feed-padding-at480)]`;

const feedClass = `grid w-full mx-auto items-start [grid-template-columns:var(--layout-feed-columns)]
  [gap:var(--layout-feed-gap)] [margin-top:var(--layout-feed-top)] [max-width:var(--layout-posts-max-width)]
  max-[800px]:[gap:var(--layout-feed-gap-at800)]`;

export default function Home() {
  return (
    <main className={shellClass}>
      <FeedHeader />
      <FeedToolbar />
      <PostComposer />
      <section className={feedClass} aria-label="Лента публикаций">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            variant={index === 0 ? "featured" : post.image ? "photo" : "short"}
          />
        ))}
      </section>
    </main>
  );
}
