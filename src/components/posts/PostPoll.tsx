"use client";

import { useEffect, useState } from "react";
import { voteLocalPoll, type LocalPost } from "../../data/local-store";

export function PostPoll({ postId, poll }: { postId: number; poll: NonNullable<LocalPost["poll"]> }) {
  const [pollSelection, setPollSelection] = useState<number[]>([]);
  const [pollExpired, setPollExpired] = useState(false);
  const pollClosesAt = poll.closesAt;
  useEffect(() => {
    const update = () => setPollExpired(pollClosesAt <= Date.now());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [pollClosesAt]);

  const total = poll.votes.reduce((sum, count) => sum + count, 0);
  const voted = poll.voted.length > 0;
  return (
    <div className="mt-4 grid gap-2 rounded-xl border border-line bg-surface p-4" onClick={(event) => event.stopPropagation()}>
        <strong>{poll.question}</strong>
        {poll.options.map((option, index) => {
          const percent = total ? Math.round(poll.votes[index] / total * 100) : 0;
          const closed = pollExpired;
          const selected = pollSelection.includes(index);
          return <button key={`${index}-${option}`} type="button" disabled={voted || closed} onClick={() => poll.multiple ? setPollSelection((current) => selected ? current.filter((item) => item !== index) : [...current, index]) : voteLocalPoll(postId, [index])} className={`relative overflow-hidden rounded-lg border px-3 py-2 text-left ${selected ? "border-coral" : "border-line"} ${voted || closed ? "cursor-default" : "cursor-pointer hover:border-coral"}`}>
            {voted && <span className="absolute inset-y-0 left-0 bg-peach" style={{ width: `${percent}%` }} />}
            <span className="relative flex justify-between gap-2"><span>{selected ? "✓ " : ""}{option}</span>{voted && <span>{percent}% · {poll.votes[index]}</span>}</span>
          </button>;
        })}
        {poll.multiple && poll.voted.length === 0 && !pollExpired && pollSelection.length > 0 && <button type="button" onClick={() => { voteLocalPoll(postId, pollSelection); setPollSelection([]); }} className="rounded-full border-0 bg-coral px-4 py-2 font-bold text-white">Проголосовать</button>}
        <span className="text-xs text-muted">{total} голосов{poll.voted.length > 0 ? " · ваш голос учтён" : pollExpired ? " · опрос завершён" : ` · до ${new Date(poll.closesAt).toLocaleDateString("ru-RU")}`}</span>
    </div>
  );
}
