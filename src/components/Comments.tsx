"use client";

import { useState, type FormEvent } from "react";

type CommentsProps = {
  comments: string[];
  onAdd: (text: string) => void;
  onDelete: (index: number) => void;
  variant: "feed" | "detail";
};

const styles = {
  feed: {
    panel: "flex flex-col [gap:var(--comments-gap)] [margin-top:var(--comments-top)] [padding-top:var(--comments-padding-top)] [border-top:var(--borders-thin)_solid_var(--line)]",
    form: "mt-1 flex [gap:var(--comments-form-gap)]",
    input: "min-w-0 flex-1 [padding:var(--comments-input-padding)] [border-radius:var(--radii-button)] [border:var(--borders-thin)_solid_var(--line)] [background:var(--colors-white)] [font-size:var(--font-sizes-label)]",
    submit: "cursor-pointer bg-coral text-white [padding:var(--comments-button-padding)] [border-radius:var(--radii-button)] [font-weight:var(--font-weights-bold)] [font-size:var(--font-sizes-label)]",
    list: "m-0 flex list-none flex-col overflow-y-auto p-0 [gap:var(--comments-list-gap)] [max-height:var(--comments-list-max-height)]",
    item: "[overflow-wrap:anywhere] [background:var(--colors-comment-surface)] [padding:var(--comments-item-padding)] [border-radius:var(--radii-small)] [font-size:var(--font-sizes-label)]",
    author: "mr-2 [font-weight:var(--font-weights-bold)]",
    text: "",
    remove: "cursor-pointer border-0 bg-transparent px-[6px] py-[2px] text-muted [font-size:var(--font-sizes-meta)]",
    empty: "text-muted [font-size:var(--font-sizes-label)]",
  },
  detail: {
    panel: "mt-7",
    form: "mb-[18px] flex gap-[10px]",
    input: "min-w-0 flex-1 px-4 py-3 [border:var(--borders-thin)_solid_var(--line)] [border-radius:var(--radii-input)] [background:var(--colors-white)] [font-size:var(--font-sizes-input)] outline-none focus:border-coral",
    submit: "cursor-pointer border-0 bg-coral px-[22px] py-3 text-white [border-radius:var(--radii-input)] [font-weight:var(--font-weights-bold)]",
    list: "m-0 grid list-none gap-[10px] p-0",
    item: "flex flex-wrap items-baseline gap-2 bg-surface px-4 py-3 [border:var(--borders-thin)_solid_var(--line)] [border-radius:var(--radii-input)]",
    author: "[font-weight:var(--font-weights-bold)]",
    text: "min-w-0 flex-1 [overflow-wrap:anywhere]",
    remove: "cursor-pointer border-0 bg-transparent text-muted",
    empty: "py-[30px] text-center text-muted",
  },
};

export function Comments({ comments, onAdd, onDelete, variant }: CommentsProps) {
  const [input, setInput] = useState("");
  const isDetail = variant === "detail";
  const classes = styles[variant];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput("");
  }

  const form = (
    <form onSubmit={handleSubmit} className={classes.form}>
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Написать комментарий…"
        aria-label="Текст комментария"
        className={classes.input}
      />
      <button type="submit" className={classes.submit}>Отправить</button>
    </form>
  );

  const list = comments.length === 0 ? (
    <p className={classes.empty}>Пока нет комментариев. Напишите первый!</p>
  ) : (
    <ul className={classes.list}>
      {comments.map((comment, index) => (
        <li key={index} className={classes.item}>
          <span className={classes.author}>Аноним:</span>
          <span className={classes.text}>{comment}</span>
          <button type="button" className={classes.remove} onClick={() => onDelete(index)} aria-label={`Удалить комментарий: ${comment}`}>
            удалить
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <section className={classes.panel} aria-label="Комментарии">
      {isDetail && <h2 className="mb-[14px] font-display [font-size:var(--font-sizes-section)]">Комментарии · {comments.length}</h2>}
      {isDetail ? <>{form}{list}</> : <>{list}{form}</>}
    </section>
  );
}
