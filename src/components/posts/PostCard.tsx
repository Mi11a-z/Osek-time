"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteLocalPost, voteLocalPoll, useLocalData, type LocalPost } from "../../data/local-store";
import { usePostInteractions } from "../../usePostInteractions";
import { Comments } from "../Comments";
import { PostAuthor } from "./PostAuthor";
import { PostActions } from "./PostActions";
import { PostMenu } from "../profile/PostMenu";
import { ReportDialog } from "./ReportDialog";
import { blockUser, removePost, useModeration } from "../../moderation";

type PostCardProps = {
  post: LocalPost;
  variant: "featured" | "photo" | "short";
};

const linkClass = "whitespace-pre-wrap [overflow-wrap:anywhere] text-inherit no-underline focus-visible:[outline:var(--borders-focus)_solid_var(--coral)] focus-visible:outline-offset-4";
const featuredCardClass = "flex flex-col [padding:var(--cards-featured-padding)] [border:var(--borders-featured)_solid_var(--ink)] max-[1240px]:[padding:var(--cards-featured-padding-at1240)] max-[800px]:[padding:var(--cards-featured-padding-at800)] max-[480px]:[padding:var(--cards-featured-padding-at480)]";
const compactCardClass = "[border:var(--borders-thin)_solid_var(--colors-card-border)] [padding:var(--cards-compact-padding)] max-[1000px]:[padding:var(--cards-compact-padding-at1000)] max-[800px]:[padding:var(--cards-compact-padding-at800)] max-[480px]:[padding:var(--cards-compact-padding-at480)]";
const featuredTagClass = "mt-[18px] py-1 [font-size:var(--font-sizes-body-large)] max-[480px]:mt-3.5 max-[480px]:[font-size:var(--font-sizes-input)]";
const compactTagClass = "mt-2 py-0.5 [font-size:var(--font-sizes-body)]";

export function PostCard({ post, variant }: PostCardProps) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [pollSelection, setPollSelection] = useState<number[]>([]);
  const [pollExpired, setPollExpired] = useState(false);
  const interactions = usePostInteractions(post.id);
  const { profile, error } = useLocalData();
  const { role, removed, blocked } = useModeration();
  const [reporting, setReporting] = useState(false);
  const [actionFailed, setActionFailed] = useState(false);
  const isAdmin = role === "admin";
  const pollClosesAt = post.poll?.closesAt;
  // Сохраняем прежнюю связь собственных публикаций с жалобами и блокировками.
  const authorId = post.named ? (post.isOwn ? profile.name : post.author) : null;

  useEffect(() => {
    if (pollClosesAt === undefined) return;
    const update = () => setPollExpired(pollClosesAt <= Date.now());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [pollClosesAt]);

  // удалённые посты и посты заблокированных авторов скрываем из ленты
  if (removed.includes(post.id) || (authorId !== null && blocked.includes(authorId)) || (post.isOwn && (blocked.includes(profile.username) || blocked.includes(profile.name)))) return null;

  function saveAction(action: () => boolean): boolean {
    const saved = action();
    setActionFailed(!saved);
    return saved;
  }

  const href = `/post/${post.id}`;
  const featured = variant === "featured";
  const copySize = variant === "short"
    ? "mt-1.5 [font-size:var(--cards-short-text-size)] max-[1240px]:[font-size:var(--cards-short-text-size-at1240)] max-[800px]:[font-size:var(--cards-short-text-size-at800)] max-[480px]:[font-size:var(--font-sizes-body-medium)]"
    : "mt-2 [font-size:var(--cards-text-size)] max-[1240px]:[font-size:var(--cards-text-size-at1240)] max-[800px]:[font-size:var(--cards-text-size-at800)] max-[480px]:[font-size:var(--font-sizes-body-medium)]";

  return (
    <article
      className={`min-w-0 cursor-pointer [background:var(--cards-background)] [border-radius:var(--cards-radius)] [transition:box-shadow_var(--motion-transition-duration)_ease] hover:[box-shadow:var(--shadows-card-hover)] motion-reduce:[transition:none] ${featured ? featuredCardClass : compactCardClass}`}
      onClick={() => router.push(href)}
    >
      <PostAuthor
        author={post.author}
        avatar={post.avatar}
        named={post.named}
        isOwn={post.isOwn}
        username={post.authorUsername}
        city={post.city}
        minutes={post.minutes}
        variant={featured ? "featured" : "compact"}
        menu={
          <PostMenu
            variant="header"
            onReport={() => setReporting(true)}
            onDelete={post.isOwn ? () => saveAction(() => deleteLocalPost(post.id)) : isAdmin ? () => removePost(post.id) : undefined}
            deleteLabel={post.isOwn ? "Удалить публикацию" : "Удалить пост (админ)"}
            onBlockAuthor={isAdmin && authorId ? () => blockUser(authorId) : undefined}
          />
        }
      />
      <span className={`table w-fit px-3 [border-radius:var(--radii-tag)] bg-peach [color:var(--colors-tag-text)] [font-weight:var(--font-weights-semibold)] leading-[1.45] ${featured ? featuredTagClass : compactTagClass}`}># {post.city}</span>

      {featured ? (post.text.trim() || post.question ? (
        <blockquote className="mt-[22px] grid [grid-template-columns:var(--cards-quote-columns)] [gap:var(--cards-quote-gap)] [margin-bottom:var(--cards-quote-bottom)] min-[1600px]:mt-7 max-[1240px]:[grid-template-columns:var(--cards-quote-columns-at1240)] max-[1240px]:[gap:var(--cards-quote-gap-at1240)] max-[1000px]:mt-3.5 max-[800px]:[grid-template-columns:var(--cards-quote-columns-at800)] max-[800px]:[gap:var(--cards-quote-gap-at800)] max-[800px]:[margin-block:20px_35px] max-[480px]:[grid-template-columns:var(--cards-quote-columns-at480)] max-[480px]:[gap:var(--cards-quote-gap-at480)] max-[480px]:[margin-block:20px_30px]">
          <span className="font-display [font-weight:var(--font-weights-bold)] [font-size:var(--headings-quote-mark)] leading-[0.95] text-coral tracking-[-0.09em] max-[1240px]:[font-size:var(--headings-quote-mark-at1240)] max-[1000px]:[font-size:var(--headings-quote-mark-at1000)] max-[800px]:[font-size:var(--headings-quote-mark-at800)] max-[480px]:[font-size:var(--headings-quote-mark-at480)]" aria-hidden="true">“</span>
          <div>
            <p className="font-display [font-size:var(--headings-quote)] [font-weight:var(--font-weights-heavy)] [line-height:var(--headings-quote-line-height)] [letter-spacing:var(--headings-quote-letter-spacing)] text-pretty max-[1240px]:[font-size:var(--headings-quote-at1240)] max-[1000px]:[font-size:var(--headings-quote-at1000)] max-[800px]:[font-size:var(--headings-quote-at800)] max-[480px]:[font-size:var(--headings-quote-at480)] max-[480px]:[line-height:var(--headings-quote-line-height-at480)]">
              <Link href={href} className={linkClass} onClick={(event) => event.stopPropagation()}>{post.text}</Link>
            </p>
            {post.question && <p className="[margin-top:var(--headings-question-gap)] font-display [font-size:var(--headings-question)] [font-weight:var(--font-weights-medium)] [line-height:var(--headings-question-line-height)] tracking-[-0.035em] max-[1240px]:[font-size:var(--headings-question-at1240)] max-[1000px]:[font-size:var(--headings-question-at1000)] max-[800px]:[font-size:var(--headings-question-at800)] max-[480px]:[font-size:var(--headings-question-at480)] max-[480px]:[margin-top:var(--headings-question-gap-at480)]">{post.question}</p>}
          </div>
        </blockquote>
      ) : null) : post.text.trim() ? (
        <p className={`[font-weight:var(--font-weights-medium)] [line-height:var(--cards-text-line-height)] tracking-[-0.025em] ${copySize}`}>
          <Link href={href} className={linkClass} onClick={(event) => event.stopPropagation()}>{post.text}</Link>
        </p>
      ) : null}

      {post.image && (
        <Image
          className="mt-2.5 block h-auto max-h-[650px] w-full rounded-[var(--images-radius)] object-contain"
          src={post.image}
          alt={post.imageAlt ?? ""}
          width={2172}
          height={724}
          sizes="(max-width: 940px) 100vw, 880px"
        />
      )}

      {post.poll && <div className="mt-4 grid gap-2 rounded-xl border border-line bg-surface p-4" onClick={(event) => event.stopPropagation()}>
        <strong>{post.poll.question}</strong>
        {post.poll.options.map((option, index) => {
          const total = post.poll!.votes.reduce((sum, votes) => sum + votes, 0);
          const percent = total ? Math.round(post.poll!.votes[index] / total * 100) : 0;
          const voted = post.poll!.voted.length > 0;
          const closed = pollExpired;
          const selected = pollSelection.includes(index);
          return <button key={`${index}-${option}`} type="button" disabled={voted || closed} onClick={() => post.poll!.multiple ? setPollSelection((current) => selected ? current.filter((item) => item !== index) : [...current, index]) : voteLocalPoll(post.id, [index])} className={`relative overflow-hidden rounded-lg border px-3 py-2 text-left ${selected ? "border-coral" : "border-line"} ${voted || closed ? "cursor-default" : "cursor-pointer hover:border-coral"}`}>
            {voted && <span className="absolute inset-y-0 left-0 bg-peach" style={{ width: `${percent}%` }} />}
            <span className="relative flex justify-between gap-2"><span>{selected ? "✓ " : ""}{option}</span>{voted && <span>{percent}% · {post.poll!.votes[index]}</span>}</span>
          </button>;
        })}
        {post.poll.multiple && post.poll.voted.length === 0 && !pollExpired && pollSelection.length > 0 && <button type="button" onClick={() => { voteLocalPoll(post.id, pollSelection); setPollSelection([]); }} className="rounded-full border-0 bg-coral px-4 py-2 font-bold text-white">Проголосовать</button>}
        <span className="text-xs text-muted">{post.poll.votes.reduce((sum, votes) => sum + votes, 0)} голосов{post.poll.voted.length > 0 ? " · ваш голос учтён" : pollExpired ? " · опрос завершён" : ` · до ${new Date(post.poll.closesAt).toLocaleDateString("ru-RU")}`}</span>
      </div>}

      <div className="flex w-full flex-col" onClick={(event) => event.stopPropagation()}>
        <PostActions
          likes={interactions.likes}
          isLiked={interactions.isLiked}
          isSaved={interactions.isSaved}
          commentCount={interactions.comments.length}
          onLike={() => saveAction(interactions.toggleLike)}
          onSave={() => saveAction(interactions.toggleSave)}
          onToggleComments={() => setShowComments((previous) => !previous)}
          commentsOpen={showComments}
          showMore={false}
          separated={featured}
        />
        {actionFailed && error && <p role="alert" className="mt-3 rounded-xl bg-peach p-3 text-coral-deep">{error}</p>}
        {reporting && (
          <ReportDialog
            post={{ postId: post.id, postText: post.text, postAuthor: post.author, authorId }}
            onClose={() => setReporting(false)}
          />
        )}
        <div hidden={!showComments}>
          <Comments comments={interactions.comments} onAdd={(text, isAnonymous) => saveAction(() => interactions.addComment(text, isAnonymous))} onDelete={(index) => saveAction(() => interactions.deleteComment(index))} variant="feed" />
        </div>
      </div>
    </article>
  );
}

