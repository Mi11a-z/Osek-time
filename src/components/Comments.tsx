"use client";

import { useState, type FormEvent } from "react";
import { useLocalData, type LocalComment } from "../data/local-store";
import { useModeration } from "../moderation";

type CommentsProps = {
  comments: LocalComment[];
  onAdd: (text: string, isAnonymous: boolean) => boolean | void;
  onDelete: (index: number) => void;
  variant: "feed" | "detail";
  error?: string | null;
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

export function Comments({ comments, onAdd, onDelete, variant, error }: CommentsProps) {
  const [input, setInput] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { profile, ready } = useLocalData();
  const moderation = useModeration();
  const isAdmin = moderation.ready && moderation.role === "admin";
  const canComment = ready && /^[a-z0-9_.]{3,20}$/i.test(profile.username);
  const isDetail = variant === "detail";
  const classes = styles[variant];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canComment || !input.trim()) return;
    if (onAdd(input.trim(), isAnonymous) !== false) setInput("");
  }

  const form = (
    <div>
      <button
        type="button"
        role="switch"
        aria-label="Комментировать анонимно"
        aria-checked={isAnonymous}
        disabled={!canComment}
        onClick={() => setIsAnonymous((value) => !value)}
        className="mb-2 flex cursor-pointer items-center [gap:var(--switch-label-gap)] [font-size:var(--font-sizes-meta)] [font-weight:var(--font-weights-bold)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>Анонимно</span>
        <span aria-hidden="true" className={`flex shrink-0 items-center [width:var(--switch-width)] [height:var(--switch-height)] [padding:var(--switch-padding)] [border-radius:var(--radii-panel)] [transition:background-color_var(--motion-transition-duration)_ease] motion-reduce:transition-none ${isAnonymous ? "bg-coral" : "[background:var(--colors-switch-off)]"}`}>
          <span className={`[width:var(--switch-thumb-size)] [height:var(--switch-thumb-size)] [border-radius:var(--radii-round)] [background:var(--colors-switch-thumb)] [box-shadow:var(--shadows-switch)] [transition:transform_var(--motion-transition-duration)_ease] motion-reduce:transition-none ${isAnonymous ? "[transform:translateX(calc(var(--switch-width)_-_var(--switch-padding)_*_2_-_var(--switch-thumb-size)))]" : "[transform:translateX(0)]"}`} />
        </span>
      </button>
      <p className="mb-2 text-muted [font-size:var(--font-sizes-meta)]">
        {canComment ? isAnonymous ? "Комментарий будет опубликован анонимно." : <>Комментарий от <strong>@{profile.username}</strong></> : <>Чтобы написать комментарий, укажите ник в <a href="/profile" className="underline">профиле</a>.</>}
      </p>
      <form onSubmit={handleSubmit} className={classes.form}>
        <input
          type="text"
          disabled={!canComment}
          maxLength={5000}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Написать комментарий…"
          aria-label="Текст комментария"
          className={classes.input}
        />
        <button type="submit" disabled={!canComment || !input.trim()} className={`${classes.submit} disabled:cursor-not-allowed disabled:opacity-50`}>Отправить</button>
      </form>
    </div>
  );

  const list = comments.length === 0 ? (
    <p className={classes.empty}>Пока нет комментариев. Напишите первый!</p>
  ) : (
    <ul className={classes.list}>
      {comments.map((comment, index) => (
        <li key={comment.id} className={classes.item}>
          <span className={`${classes.author} inline-block align-top`}>
            {comment.isAnonymous ? <>
              Аноним
              {isAdmin && <span className="block text-muted [font-size:var(--font-sizes-meta)] [font-weight:var(--font-weights-medium)]">@{comment.username}</span>}
            </> : <>@{comment.username}:</>}
          </span>
          <span className={classes.text}>{comment.text}</span>
          <button type="button" className={classes.remove} onClick={() => onDelete(index)} aria-label={`Удалить комментарий: ${comment.text}`}>
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
      {error && <p role="alert" className="mt-2 text-sm text-coral-deep">{error}</p>}
    </section>
  );
}
