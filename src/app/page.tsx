import { FeedHeader } from "../components/feed/FeedHeader";
import { FeedToolbar } from "../components/feed/FeedToolbar";
import { PostComposer } from "../components/feed/PostComposer";
import { PostCard } from "../components/posts/PostCard";
import { posts } from "../data/posts";
import "../components/feed/feed.css";

export default function Home() {
  return (
    <main className="page-shell">
      <FeedHeader />
      <FeedToolbar />
      <PostComposer />
      <section className="feed-grid" aria-label="Лента публикаций">
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
