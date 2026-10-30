"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { posts, type Post } from "../../posts";
import "./post.css";

function PostView({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState<string[]>(post.comments);
  const [input, setInput] = useState("");

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setComments([...comments, input.trim()]);
    setInput("");
  };

  const handleDelete = (index: number) => {
    setComments(comments.filter((_, i) => i !== index));
  };

  return (
    <main className="pd-shell">
      <header className="pd-masthead">
        <Link href="/" className="pd-wordmark">Osek Time</Link>
        <Link href="/" className="pd-back">← Вернуться в ленту</Link>
      </header>

      <article className="pd-card">
        <header className="pd-author">
          {post.named ? (
            <Image className="pd-avatar" src="/images/aidana-avatar.svg" alt="" width={60} height={60} />
          ) : (
            <span className="pd-avatar pd-avatar-anon">А</span>
          )}
          <div>
            <span className="pd-name">{post.author}</span>
            <span className="pd-meta">{post.city} · {post.minutes} мин</span>
          </div>
        </header>

        <span className="pd-tag"># {post.city}</span>

        <p className={post.question ? "pd-text pd-text-big" : "pd-text"}>{post.text}</p>
        {post.question && <p className="pd-question">{post.question}</p>}

        {post.image && (
          <Image
            className="pd-photo"
            src={post.image}
            alt={post.imageAlt ?? ""}
            width={2172}
            height={724}
            sizes="(max-width: 800px) 100vw, 900px"
          />
        )}

        <footer className="pd-actions">
          <button type="button" onClick={handleLike} className={`pd-action ${isLiked ? "is-liked" : ""}`} aria-pressed={isLiked}>
            {isLiked ? "♥" : "♡"} {likes}
          </button>
          <span className="pd-action-static">💬 {comments.length}</span>
          <button type="button" onClick={() => setIsSaved(!isSaved)} className={`pd-action pd-save ${isSaved ? "is-saved" : ""}`} aria-pressed={isSaved}>
            {isSaved ? "Сохранено" : "Сохранить"}
          </button>
        </footer>
      </article>

      <section className="pd-comments" aria-label="Комментарии">
        <h2 className="pd-comments-title">Комментарии · {comments.length}</h2>

        <form onSubmit={handleAddComment} className="pd-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Написать комментарий…"
            aria-label="Текст комментария"
          />
          <button type="submit">Отправить</button>
        </form>

        {comments.length === 0 ? (
          <p className="pd-empty">Пока нет комментариев. Напишите первый!</p>
        ) : (
          <ul className="pd-comment-list">
            {comments.map((c, i) => (
              <li key={i} className="pd-comment">
                <span className="pd-comment-author">Аноним:</span>
                <span className="pd-comment-text">{c}</span>
                <button type="button" onClick={() => handleDelete(i)}>удалить</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const post = posts.find((p) => p.id === Number(params.id));

  if (!post) {
    return (
      <main className="pd-shell">
        <p className="pd-empty">Пост не найден.</p>
        <Link href="/" className="pd-back">← Вернуться в ленту</Link>
      </main>
    );
  }

  return <PostView post={post} />;
}
