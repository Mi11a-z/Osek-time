"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocalData } from "../../data/local-store";
import { dismissReport, removePost, restorePost, blockUser, unblockUser, accountReports, canViewAccountReports, reportReasons, useModeration } from "../../moderation";
import { BackHeader } from "../ui/BackHeader";

const statuses = { new: "Новая", resolved: "Обработана", dismissed: "Отклонена" };
const sections = [
  { id: "all", label: "Все" },
  { id: "new", label: "Новые" },
  { id: "resolved", label: "Обработанные" },
  { id: "dismissed", label: "Отклонённые" },
] as const;
type Section = typeof sections[number]["id"];
const emptyTitles: Record<Section, string> = {
  all: "Жалоб пока нет",
  new: "Новых жалоб нет",
  resolved: "Обработанных жалоб нет",
  dismissed: "Отклонённых жалоб нет",
};

export function AccountReports({ username }: { username: string }) {
  const local = useLocalData();
  const moderation = useModeration();
  const [status, setStatus] = useState<Section>("all");
  const [reason, setReason] = useState("");
  const ready = local.ready && moderation.ready;
  const allowed = ready && canViewAccountReports(moderation.role);
  const reports = allowed ? accountReports(moderation.reports, username, local) : [];
  const byReason = reason ? reports.filter((report) => report.reason === reason) : reports;
  const counts = { all: byReason.length, new: 0, resolved: 0, dismissed: 0 };
  for (const report of byReason) counts[report.status]++;
  const filtered = status === "all" ? byReason : byReason.filter((report) => report.status === status);
  const hasFilters = status !== "all" || Boolean(reason);
  function resetFilters() {
    setStatus("all");
    setReason("");
  }
  const profileHref = username.toLowerCase() === local.profile.username.toLowerCase()
    ? "/profile" : `/user/${encodeURIComponent(username)}`;

  return (
    <main className="mx-auto max-w-3xl p-5">
      <BackHeader prefix="pf" />
      {!allowed ? (
        <p role="status">{ready ? "Этот раздел доступен только администраторам и модераторам." : "Загрузка…"}</p>
      ) : (
        <>
          <Link href={profileHref} className="text-sm text-muted hover:underline">← В профиль</Link>
          <h1 className="mt-4 break-words font-display text-3xl font-bold">Жалобы на @{username}</h1>
          {reports.length > 0 && (
            <>
              <div role="group" aria-label="Статус жалоб" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {sections.map((section) => (
                  <button key={section.id} type="button" aria-pressed={status === section.id}
                    onClick={() => setStatus(section.id)}
                    className="cursor-pointer rounded-xl border border-line bg-surface px-4 py-3 text-left text-ink hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white focus-visible:outline-coral">
                    <span className="block font-display text-2xl font-bold leading-tight tabular-nums">{counts[section.id]}</span>
                    <span className="block text-sm">{section.label}</span>
                  </button>
                ))}
              </div>
              <div className="my-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <label className="min-w-0 text-sm">
                  <span className="sr-only">Причина жалобы</span>
                  <select className="max-w-full cursor-pointer rounded-lg border border-line bg-surface px-3 py-2 text-ink focus-visible:outline-coral" value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option value="">Все причины</option>
                  {reportReasons.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <span role="status" className="text-sm text-muted">
                  {hasFilters ? `Показано ${filtered.length} из ${reports.length}` : `Всего жалоб · ${reports.length}`}
                </span>
                {hasFilters && filtered.length > 0 && <button type="button" onClick={resetFilters}
                  className="ml-auto text-sm text-ink underline underline-offset-4">Сбросить фильтры</button>}
              </div>
            </>
          )}
          {filtered.length === 0 && <div className="mt-4 rounded-xl border border-line bg-surface px-6 py-10 text-center">
            <h2 className="font-display text-xl font-bold">{reason ? "По выбранным фильтрам жалоб нет" : emptyTitles[status]}</h2>
            {reports.length > 0 && <button type="button" onClick={resetFilters}
              className="mt-4 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-coral">Показать все жалобы</button>}
          </div>}
          <ul className="m-0 grid list-none gap-3 p-0">
            {filtered.map((report) => (
              <li key={report.id} className="rounded-xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{reportReasons.find((reason) => reason.id === report.reason)?.label ?? report.reason}</strong>
                  <span className="rounded-full bg-peach px-3 py-1 text-sm">{statuses[report.status]}</span>
                </div>
                <p className="mt-2 text-sm text-muted">От @{report.reporter} · {new Date(report.createdAt).toLocaleString("ru-RU")}</p>
                <p className="mt-3 break-words">Пост №{report.postId} · {report.postText || "Без текста"}</p>
                {report.details && <p className="mt-2 break-words text-sm">Комментарий к жалобе: {report.details}</p>}
                {report.resolution && <p className="mt-2 text-sm">Решение: {report.resolution}</p>}
                {moderation.role === "admin" && <div className="mt-4 flex flex-wrap gap-2 [&_button]:cursor-pointer [&_button]:rounded-full [&_button]:border [&_button]:border-line [&_button]:px-4 [&_button]:py-2 [&_button]:text-sm [&_button]:font-semibold">
                  <Link href={`/post/${report.postId}`} className="rounded-full border border-line px-4 py-2 text-sm text-inherit hover:border-coral">Открыть пост</Link>
                  {report.status === "new" && <button type="button" onClick={() => dismissReport(report.id)}>Отклонить жалобу</button>}
                  {moderation.removed.includes(report.postId)
                    ? <button type="button" onClick={() => restorePost(report.postId)}>Восстановить пост</button>
                    : <button type="button" className="text-coral-deep" onClick={() => removePost(report.postId)}>Удалить пост</button>}
                  {report.authorId && (moderation.blocked.includes(report.authorId)
                    ? <button type="button" onClick={() => unblockUser(report.authorId!)}>Разблокировать автора</button>
                    : <button type="button" className="text-coral-deep" onClick={() => blockUser(report.authorId!, report.postAuthor)}>Заблокировать автора</button>)}
                </div>}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
