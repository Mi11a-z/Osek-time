import Link from "next/link";
import { PostDetail } from "../../../components/posts/PostDetail";
import { posts } from "../../../data/posts";
import "./post.css";

export function generateStaticParams() {
  return posts.map((post) => ({ id: String(post.id) }));
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = posts.find((item) => item.id === Number(id));

  if (!post) {
    return (
      <main className="pd-shell">
        <p className="pd-empty">Пост не найден.</p>
        <Link href="/" className="pd-back">← Вернуться в ленту</Link>
      </main>
    );
  }

  return <PostDetail key={post.id} post={post} />;
}
