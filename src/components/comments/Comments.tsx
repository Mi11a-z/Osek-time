"use client";

import { useState, type FormEvent } from "react";
import "./comments.css";

type CommentsProps = {
  comments: string[];
  onAdd: (text: string) => void;
  onDelete: (index: number) => void;
  variant: "feed" | "detail";
};

export function Comments({ comments, onAdd, onDelete, variant }: CommentsProps) {
  const [input, setInput] = useState("");
  const isDetail = variant === "detail";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput("");
  }

  const form = (
    <form onSubmit={handleSubmit} className={isDetail ? "pd-form" : "comments-form"}>
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Написать комментарий…"
        aria-label="Текст комментария"
      />
      <button type="submit">Отправить</button>
    </form>
  );

  const list = comments.length === 0 ? (
    <p className={isDetail ? "pd-empty" : "comments-empty"}>Пока нет комментариев. Напишите первый!</p>
  ) : (
    <ul className={isDetail ? "pd-comment-list" : "comments-list"}>
      {comments.map((comment, index) => (
        <li key={index} className={isDetail ? "pd-comment" : "comments-item"}>
          <span className={isDetail ? "pd-comment-author" : "comments-author"}>Аноним:</span>
          <span className={isDetail ? "pd-comment-text" : "comments-text"}>{comment}</span>
          <button type="button" className={isDetail ? undefined : "comments-delete"} onClick={() => onDelete(index)} aria-label={`Удалить комментарий: ${comment}`}>
            удалить
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <section className={isDetail ? "pd-comments" : "comments-panel"} aria-label="Комментарии">
      {isDetail && <h2 className="pd-comments-title">Комментарии · {comments.length}</h2>}
      {isDetail ? <>{form}{list}</> : <>{list}{form}</>}
    </section>
  );
}
