"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BackHeader } from "../ui/BackHeader";
import { useLocalData } from "../../data/local-store";
import { posts as samplePosts } from "../../data/posts";
import {
  blockUser,
  dismissReport,
  removePost,
  reportReasons,
  restorePost,
  setRole,
  unblockUser,
  useModeration,
  type Report,
} from "../../moderation";

type AdminTab = "new" | "done" | "blocked" | "removed";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "new", label: "Новые жалобы" },
  { id: "done", label: "Обработанные" },
  { id: "removed", label: "Удалённые посты" },
  { id: "blocked", label: "Заблокированные" },
];

const pillClass = "cursor-pointer rounded-[var(--radii-pill)] border-solid px-4 py-2 [border-width:var(--borders-thin)] [font-weight:var(--font-weights-bold)]";

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function AdminPanel() {
  const { ready, role, reports, removed, blocked } = useModeration();
  const localData = useLocalData();
  const [tab, setTab] = useState<AdminTab>("new");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return null;

  // не раскрываем, что такая страница существует
  if (role !== "admin") {
    return (
      <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]">
        <BackHeader prefix="pf" />
        <p className="py-[80px] text-center text-muted">Страница не найдена.</p>
        <p className="text-center"><Link href="/" className="text-coral-deep">На главную</Link></p>
      </main>
    );
  }

  const newReports = reports.filter((r) => r.status === "new");
  const doneReports = reports.filter((r) => r.status !== "new");
  const visible = tab === "new" ? newReports : doneReports;
  const posts = [
    ...samplePosts.filter((post) => !localData.posts.some((localPost) => localPost.id === post.id)),
    ...localData.posts,
  ].filter((post) => !removed.includes(post.id));
  const periods = [
    { id: "day", label: "Сегодня", since: now === null ? Infinity : new Date(new Date(now).setHours(0, 0, 0, 0)).getTime() },
    { id: "week", label: "7 дней", since: now === null ? Infinity : now - 7 * 24 * 60 * 60 * 1000 },
    { id: "month", label: "30 дней", since: now === null ? Infinity : now - 30 * 24 * 60 * 60 * 1000 },
  ];
  const cityCounts = posts.reduce<Record<string, number>>((counts, post) => {
    const city = post.city.trim();
    if (city) counts[city] = (counts[city] ?? 0) + 1;
    return counts;
  }, {});
  const popularCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]">
      <BackHeader prefix="pf" />

      <h1 className="m-0 font-display [font-size:var(--font-sizes-profile-name)] [font-weight:var(--font-weights-heavy)]">Админ-панель</h1>
      <p className="mt-1.5 text-muted">Жалобы на публикации и управление пользователями.</p>
      <button type="button" onClick={() => setRole("user")} className={`${pillClass} mt-3 border-line bg-transparent hover:border-coral`}>
        Выйти из режима админа
      </button>

      <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="Обзор активности">
        <div className="rounded-[var(--radii-panel)] border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 font-display text-xl font-bold">Пользователи</h2>
            <span className="text-muted text-sm">Регистрация недоступна в демо-режиме</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Известно приложению" value={localData.ready ? 1 : 0} />
            {periods.map((period) => <Metric key={period.id} label={period.label} value="—" />)}
          </div>
          <p className="mb-0 mt-4 text-sm text-muted">Приложение хранит один профиль в этом браузере, без списка аккаунтов и дат регистрации.</p>
        </div>

        <div className="rounded-[var(--radii-panel)] border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 font-display text-xl font-bold">Публикации</h2>
            <span className="text-muted text-sm">Доступно в этой ленте: {posts.length}</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {periods.map((period) => <Metric key={period.id} label={period.label} value={now === null ? "—" : localData.posts.filter((post) => post.createdAt && post.createdAt >= period.since && post.createdAt <= now).length} />)}
          </div>
          <p className="mb-0 mt-4 text-sm text-muted">Считаются новые публикации, сохранённые в этом браузере. У демонстрационных постов даты нет.</p>
        </div>

        <div className="rounded-[var(--radii-panel)] border border-line bg-surface p-5 sm:p-6">
          <h2 className="m-0 font-display text-xl font-bold">Популярные темы</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Города в публикациях — доступные сейчас темы ленты.</p>
          {popularCities.length ? <ol className="m-0 grid list-none gap-3 p-0">
            {popularCities.map(([city, count], index) => <li key={city} className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-peach text-sm font-bold text-coral-deep">{index + 1}</span>
              <span className="font-semibold"># {city}</span><span className="ml-auto text-sm text-muted">{count} пост.</span>
            </li>)}
          </ol> : <p className="mb-0 text-muted">Публикаций пока нет.</p>}
        </div>

        <div className="rounded-[var(--radii-panel)] border border-line bg-surface p-5 sm:p-6">
          <h2 className="m-0 font-display text-xl font-bold">Жалобы и модерация</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Новые" value={newReports.length} />
            <Metric label="Всего" value={reports.length} />
            <Metric label="Постов удалено" value={removed.length} />
            <Metric label="Заблокировано" value={blocked.length} />
          </div>
          <p className="mb-0 mt-4 text-sm text-muted">Блоки обновляются при обработке жалоб.</p>
        </div>
      </section>

      <nav className="flex flex-wrap [gap:var(--profile-tabs-gap)] [margin:var(--profile-tabs-margin)]" aria-label="Разделы админ-панели">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`${pillClass} px-6 py-[13px] hover:border-coral ${tab === item.id ? "border-coral bg-coral [color:var(--colors-white)]" : "border-line bg-transparent"}`}
          >
            {item.label}
            {item.id === "new" && newReports.length > 0 ? ` · ${newReports.length}` : ""}
          </button>
        ))}
      </nav>

      {tab === "removed" ? (
        removed.length === 0 ? <p className="py-[50px] text-center text-muted">Удалённых публикаций нет.</p> : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {removed.map((id) => (
              <li key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-5">
                <span>Публикация №{id}</span>
                <button type="button" onClick={() => restorePost(id)} className={`${pillClass} border-line bg-transparent hover:border-coral`}>Восстановить</button>
              </li>
            ))}
          </ul>
        )
      ) : tab === "blocked" ? (
        blocked.length === 0 ? (
          <p className="py-[50px] text-center text-muted">Заблокированных пользователей нет.</p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {blocked.map((id) => (
              <li key={id} className="flex items-center justify-between gap-3 rounded-[var(--cards-profile-radius)] border-solid border-line bg-surface px-5 py-4 [border-width:var(--borders-thin)]">
                <span className="[font-weight:var(--font-weights-bold)]">{id}</span>
                <button type="button" onClick={() => unblockUser(id)} className={`${pillClass} border-line bg-transparent hover:border-coral`}>
                  Разблокировать
                </button>
              </li>
            ))}
          </ul>
        )
      ) : visible.length === 0 ? (
        <p className="py-[50px] text-center text-muted">
          {tab === "new" ? "Новых жалоб нет." : "Обработанных жалоб пока нет."}
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0">
          {visible.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              total={reports.filter((r) => r.postId === report.postId).length}
              postRemoved={removed.includes(report.postId)}
              authorBlocked={report.authorId !== null && blocked.includes(report.authorId)}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <div className="flex min-h-20 min-w-0 flex-col justify-center rounded-xl bg-peach/40 px-3 py-3">
    <strong className="font-display text-2xl">{value}</strong>
    <span className="break-words text-xs leading-tight text-muted">{label}</span>
  </div>;
}

function ReportCard({
  report,
  total,
  postRemoved,
  authorBlocked,
}: {
  report: Report;
  total: number;
  postRemoved: boolean;
  authorBlocked: boolean;
}) {
  const reason = reportReasons.find((r) => r.id === report.reason);
  const isNew = report.status === "new";

  return (
    <li className="rounded-[var(--cards-profile-radius)] border-solid border-line bg-surface [padding:var(--cards-profile-padding)] [border-width:var(--borders-thin)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-[var(--radii-tag)] bg-peach px-3 py-1.5 text-coral-deep [font-size:var(--font-sizes-meta)] [font-weight:var(--font-weights-bold)]">
          {reason?.label ?? report.reason}
        </span>
        {total > 1 && (
          <span className="text-muted [font-size:var(--font-sizes-meta)]">Жалоб на этот пост: {total}</span>
        )}
        <span className="ml-auto text-muted [font-size:var(--font-sizes-meta)]">{formatDate(report.createdAt)}</span>
      </div>

      {reason && <p className="mt-2 text-muted [font-size:var(--font-sizes-meta)]">{reason.hint}</p>}
      {report.details && (
        <p className="mt-2 [overflow-wrap:anywhere]"><strong>Комментарий жалобы:</strong> {report.details}</p>
      )}
      <p className="mt-1 text-muted [font-size:var(--font-sizes-meta)]">Отправил: @{report.reporter}</p>

      <blockquote className="mx-0 mb-0 mt-3 rounded-xl border-0 bg-peach/40 px-4 py-3">
        <span className="block [font-weight:var(--font-weights-bold)]">
          {report.authorId ? report.postAuthor : "Анонимный автор"}
          {authorBlocked && <span className="ml-2 text-coral-deep [font-size:var(--font-sizes-meta)]">· заблокирован</span>}
          {postRemoved && <span className="ml-2 text-coral-deep [font-size:var(--font-sizes-meta)]">· пост удалён</span>}
        </span>
        <span className="mt-1 block [overflow-wrap:anywhere]">{report.postText || "(пост без текста)"}</span>
      </blockquote>

      {isNew ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => removePost(report.postId)} className={`${pillClass} border-coral bg-coral [color:var(--colors-white)] hover:bg-coral-deep`}>
            Удалить пост
          </button>
          <button
            type="button"
            disabled={!report.authorId}
            title={report.authorId ? undefined : "Автор анонимный — блокировка недоступна"}
            onClick={() => report.authorId && blockUser(report.authorId)}
            className={`${pillClass} border-ink bg-transparent hover:bg-ink hover:[color:var(--colors-white)] disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Заблокировать автора
          </button>
          <button type="button" onClick={() => dismissReport(report.id)} className={`${pillClass} border-line bg-transparent hover:border-coral`}>
            Отклонить
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-muted">Решение: {report.resolution ?? "—"}</span>
          {postRemoved && (
            <button type="button" onClick={() => restorePost(report.postId)} className={`${pillClass} border-line bg-transparent hover:border-coral`}>
              Восстановить пост
            </button>
          )}
        </div>
      )}
    </li>
  );
}
