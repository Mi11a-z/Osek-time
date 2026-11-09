import { Suspense } from "react";
import { PostDetail } from "../../../components/posts/PostDetail";
import { posts } from "../../../data/posts";
import LoadingPost from "./loading";

type PostPageProps = { params: Promise<{ id: string }> };

// Эти примеры нужны для проверки и предварительной сборки Cache Components.
// Новые локальные ID также доступны: поиск записи выполняется в браузере.
export function generateStaticParams() {
  return posts.map((post) => ({ id: String(post.id) }));
}

async function ResolvedPost({ params }: PostPageProps) {
  const { id } = await params;
  const numericId = /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id)) ? Number(id) : 0;
  return <PostDetail key={id} postId={numericId} />;
}

export default function PostPage({ params }: PostPageProps) {
  return <Suspense fallback={<LoadingPost />}><ResolvedPost params={params} /></Suspense>;
}
