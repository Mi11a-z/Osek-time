import Link from "next/link";
import { PostDetail } from "../../../components/posts/PostDetail";
import { posts } from "../../../data/posts";

export function generateStaticParams() {
  return posts.map((post) => ({ id: String(post.id) }));
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = posts.find((item) => item.id === Number(id));

  if (!post) {
    return (
      <main className="mx-auto [max-width:var(--layout-post-max-width)] [padding:var(--layout-post-padding)]">
        <p className="py-[30px] text-center text-muted">Пост не найден.</p>
        <Link href="/" className="inline-block rounded-[var(--radii-pill)] border-solid border-line px-4 py-2.5 text-ink no-underline [border-width:var(--borders-thin)] [font-weight:var(--font-weights-bold)] hover:border-coral hover:text-coral-deep">← Вернуться в ленту</Link>
      </main>
    );
  }

  return <PostDetail key={post.id} post={post} />;
}
