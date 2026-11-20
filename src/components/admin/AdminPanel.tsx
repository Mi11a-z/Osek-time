"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { BackHeader } from "../ui/BackHeader";
import { useLocalData, type LocalPost } from "../../data/local-store";
import { posts as samplePosts, type Post } from "../../data/posts";
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
  type ModerationEvent,
} from "../../moderation";

export type AdminSection = "overview" | "new" | "done" | "blocked" | "removed" | "history";

const navigation: { id: AdminSection; label: string; href: string }[] = [
  { id: "overview", label: "Обзор", href: "/admin" },
  { id: "new", label: "Новые жалобы", href: "/admin/reports/new" },
  { id: "done", label: "Обработанные", href: "/admin/reports/done" },
  { id: "removed", label: "Удалённые посты", href: "/admin/posts/removed" },
  { id: "blocked", label: "Заблокированные", href: "/admin/users/blocked" },
  { id: "history", label: "История действий", href: "/admin/history" },
];

const sectionTitles: Record<AdminSection, string> = {
  overview: "Админ-панель",
  new: "Новые жалобы",
  done: "Обработанные жалобы",
  removed: "Удалённые посты",
  blocked: "Заблокированные аккаунты",
  history: "История действий",
};

const pillClass = "cursor-pointer rounded-[var(--radii-pill)] border-solid px-4 py-2 [border-width:var(--borders-thin)] [font-weight:var(--font-weights-bold)]";
const adminCardClass = "rounded-[var(--radii-panel)] border border-line bg-surface p-5 sm:p-6";
const adminPostPreviewClass = "mt-3 rounded-xl bg-peach/40 px-4 py-3 [overflow-wrap:anywhere]";

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function AdminPanel({ section = "overview" }: { section?: AdminSection }) {
  const { ready, role, reports, removed, blocked, history } = useModeration();
  const localData = useLocalData();
  const [now, setNow] = useState<number | null>(null);

  // Состояния для фильтров и поиска в разделе "История действий" (или везде, где нужно)
  const [historyCityFilter, setHistoryCityFilter] = useState("Все города");
  const [historySortOrder, setHistorySortOrder] = useState<"desc" | "asc">("desc");
  const [historySearchQuery, setHistorySearchQuery] = useState("");

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
  const visible = section === "new" ? newReports : doneReports;
  const recordedReports = new Set(history.filter((event) => event.action === "report_received").map((event) => event.reportId));
  
  const allPosts = [
    ...samplePosts.filter((post) => !localData.posts.some((localPost) => localPost.id === post.id)),
    ...localData.posts,
  ];

  const historyItems: ModerationEvent[] = [
    ...history,
    ...reports.filter((report) => !recordedReports.has(report.id)).map((report): ModerationEvent => ({
      id: `${report.id}:legacy`, createdAt: report.createdAt, action: "report_received",
      targetId: report.authorId, targetLabel: report.postAuthor, postId: report.postId,
      reportId: report.id, reason: report.reason, postText: report.postText,
      description: `Ранее поступила жалоба от @${report.reporter}${report.resolution ? ` · ${report.resolution}` : ""}`,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  // Фильтрация и сортировка для истории действий
  const filteredHistoryItems = useMemo(() => {
    const query = historySearchQuery.toLowerCase().trim();
    const cleanQuery = query.replace(/^@/, "");

    return historyItems.filter((event) => {
      const post = allPosts.find((p) => p.id === event.postId);
      const postCity = post?.city || "Все города";

      const matchesCity = historyCityFilter === "Все города" || postCity === historyCityFilter;

      const textToCheck = [
        event.postText,
        event.description,
        event.targetLabel,
        event.targetId,
        post?.text,
        post?.author,
      ].filter(Boolean).join(" ").toLowerCase();

      const matchesSearch = !cleanQuery || textToCheck.includes(cleanQuery);

      return matchesCity && matchesSearch;
    }).sort((a, b) => {
      return historySortOrder === "desc" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
    });
  }, [historyItems, historyCityFilter, historySearchQuery, historySortOrder, allPosts]);

  const posts = allPosts.filter((post) => !removed.includes(post.id));
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
    <main className="mx-auto w-full max-w-[1380px] px-5 py-6 max-[480px]:px-3">
      <BackHeader prefix="pf" />

      <h1 className="m-0 font-display [font-size:var(--font-sizes-profile-name)] [font-weight:var(--font-weights-heavy)]">{sectionTitles[section]}</h1>
      <p className="mt-1.5 text-muted">Жалобы на публикации и управление пользователями.</p>
      <button type="button" onClick={() => setRole("user")} className={`${pillClass} mt-3 border-line bg-transparent hover:border-coral`}>
        Выйти из режима админа
      </button>

      <div className="mt-6 grid grid-cols-1 items-start gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">
      <nav className="grid gap-2 sm:grid-cols-2 lg:sticky lg:top-6 lg:grid-cols-1" aria-label="Разделы админ-панели">
        {navigation.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-current={section === item.id ? "page" : undefined}
            className={`rounded-[var(--radii-pill)] border px-4 py-3 font-semibold no-underline transition-colors hover:border-coral ${section === item.id ? "border-coral bg-coral text-white" : "border-line bg-surface text-inherit"}`}
          >
            {item.label}{item.id === "new" && newReports.length > 0 ? ` · ${newReports.length}` : ""}
          </Link>
        ))}
      </nav>
      <div className="min-w-0">
      {section === "overview" && <section className="grid gap-4 lg:grid-cols-2" aria-label="Обзор активности">
        {/* 1. Пользователи */}
        <DashCard title="Пользователи" note="Регистрация недоступна в демо-режиме">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Всего" value={localData.ready ? 1 : 0} />
            {periods.map((period) => <Metric key={period.id} label={`Новых · ${period.label}`} value="—" />)}
          </div>
          <p className="mb-0 mt-4 text-sm text-muted">Приложение хранит один профиль в этом браузере, без списка аккаунтов и дат регистрации. Реальные цифры появятся, когда backend начнёт отдавать статистику.</p>
        </DashCard>

        {/* 2. Популярные темы */}
        <DashCard title="Популярные темы" note="Города в публикациях — доступные сейчас темы ленты">
          {popularCities.length ? <ol className="m-0 grid list-none gap-3 p-0">
            {popularCities.map(([city, count], index) => <li key={city} className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-peach text-sm font-bold text-coral-deep">{index + 1}</span>
              <span className="font-semibold"># {city}</span><span className="ml-auto text-sm text-muted">{count} пост.</span>
            </li>)}
          </ol> : <p className="mb-0 text-muted">Публикаций пока нет.</p>}
        </DashCard>

        {/* 3. Публикации */}
        <DashCard title="Публикации" note="Без удалённых">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Всего в ленте" value={posts.length} />
            {periods.map((period) => (
              <Metric
                key={period.id}
                label={period.label}
                value={now === null ? "—" : localData.posts.filter((post) => post.createdAt && post.createdAt >= period.since && post.createdAt <= now).length}
              />
            ))}
          </div>
          <p className="mb-0 mt-4 text-sm text-muted">За период считаются посты, сохранённые в этом браузере. У демонстрационных постов даты нет.</p>
        </DashCard>

        {/* 4. Жалобы и модерация */}
        <DashCard title="Жалобы и модерация" note="Обновляется при обработке жалоб">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Новые жалобы" value={newReports.length} />
            <Metric label="Всего жалоб" value={reports.length} />
            <Metric label="Постов удалено" value={removed.length} />
            <Metric label="Заблокировано" value={blocked.length} />
          </div>
        </DashCard>
      </section>}

      {section === "removed" ? (
        removed.length === 0 ? <p className="py-[50px] text-center text-muted">Удалённых публикаций нет.</p> : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {removed.map((id) => (
              <li key={id} className={adminCardClass}>
                {(() => {
                  const post = allPosts.find((item) => item.id === id);
                  const removedEvent = history.find((event) => event.postId === id && event.action === "post_removed");
                  const poll = post && "poll" in post ? post.poll : undefined;
                  return <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <strong>{post?.named ? post.author : removedEvent?.targetLabel ?? "Анонимный автор"}</strong>
                        {post && <span className="ml-2 text-sm text-muted">{post.city} · публикация №{id}</span>}
                        {!post && <span className="ml-2 text-sm text-muted">Публикация №{id}</span>}
                      </div>
                      <button type="button" onClick={() => restorePost(id)} className={`${pillClass} border-line bg-transparent hover:border-coral`}>Восстановить</button>
                    </div>
                    {(post?.text || removedEvent?.postText || post?.question) && <p className={`${adminPostPreviewClass} whitespace-pre-wrap`}>{post?.text || removedEvent?.postText || post?.question}</p>}
                    {post?.image && <Image src={post.image} alt={post.imageAlt ?? "Изображение из удалённой публикации"} width={1200} height={800} unoptimized className="mt-3 max-h-96 w-full rounded-xl object-contain" />}
                    {poll && <p className="mb-0 mt-3 rounded-xl bg-peach/40 p-3">Опрос: {poll.question}</p>}
                    {!post && !removedEvent?.postText && <p className="mb-0 mt-3 text-sm text-muted">Текст этой публикации недоступен в локальных данных.</p>}
                  </>;
                })()}
              </li>
            ))}
          </ul>
        )
      ) : section === "blocked" ? (
        blocked.length === 0 ? (
          <p className="py-[50px] text-center text-muted">Заблокированных пользователей нет.</p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {blocked.map((id) => (
              <li key={id} className={`flex items-center justify-between gap-3 ${adminCardClass}`}>
                <span className="[font-weight:var(--font-weights-bold)]">{id}</span>
                <button type="button" onClick={() => unblockUser(id)} className={`${pillClass} border-line bg-transparent hover:border-coral`}>
                  Разблокировать
                </button>
              </li>
            ))}
          </ul>
        )
      ) : section === "history" ? (
        <>
          {/* Панель фильтров, сортировки и поиска для истории действий */}
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[var(--radii-panel)] border border-line bg-surface p-4">
            {/* Выбор города */}
            <select
              value={historyCityFilter}
              onChange={(e) => setHistoryCityFilter(e.target.value)}
              className="rounded-xl border border-line bg-background px-3 py-2 text-sm font-medium outline-none focus:border-coral"
            >
              <option value="Все города">Все города</option>
              <option value="Алматы">Алматы</option>
              <option value="Астана">Астана</option>
              <option value="Шымкент">Шымкент</option>
            </select>

            {/* Сортировка по дате */}
            <select
              value={historySortOrder}
              onChange={(e) => setHistorySortOrder(e.target.value as "desc" | "asc")}
              className="rounded-xl border border-line bg-background px-3 py-2 text-sm font-medium outline-none focus:border-coral"
            >
              <option value="desc">Сначала новые</option>
              <option value="asc">Сначала старые</option>
            </select>

            {/* Поиск по словам поста или пользователя */}
            <div className="flex flex-1 min-w-[200px] items-center rounded-xl border border-line bg-background px-3 py-2">
              <input
                type="text"
                placeholder="Поиск по словам поста или пользователя..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted"
              />
              {historySearchQuery && (
                <button
                  type="button"
                  onClick={() => setHistorySearchQuery("")}
                  className="text-xs text-muted hover:text-ink ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {filteredHistoryItems.length === 0 ? (
            <p className="py-[50px] text-center text-muted">Ничего не найдено по вашему запросу.</p>
          ) : (
            <ul className="m-0 grid list-none gap-3 p-0">
              {filteredHistoryItems.map((event) => (
                <HistoryCard
                  key={event.id}
                  event={event}
                  post={allPosts.find((post) => post.id === event.postId)}
                />
              ))}
            </ul>
          )}
        </>
      ) : section === "new" || section === "done" ? visible.length === 0 ? (
        <p className="py-[50px] text-center text-muted">
          {section === "new" ? "Новых жалоб нет." : "Обработанных жалоб пока нет."}
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
      ) : null}
      </div>
      </div>
    </main>
  );
}

function DashCard({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className={adminCardClass}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-display text-xl font-bold">{title}</h2>
        {note && <span className="text-sm text-muted">{note}</span>}
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <div className="flex min-h-20 min-w-0 flex-col justify-center rounded-xl bg-peach/40 px-3 py-3">
    <strong className="font-display text-2xl">{value}</strong>
    <span className="break-words text-xs leading-tight text-muted">{label}</span>
  </div>;
}

const historyLabels: Record<ModerationEvent["action"], string> = {
  report_received: "Поступила жалоба",
  report_dismissed: "Жалоба отклонена",
  post_removed: "Пост удалён из ленты",
  post_restored: "Пост восстановлен",
  user_blocked: "Аккаунт заблокирован",
  user_unblocked: "Блокировка снята",
};

function HistoryCard({ event, post }: { event: ModerationEvent; post?: LocalPost | Post }) {
  const local = useLocalData();
  const reason = event.reason && reportReasons.find((entry) => entry.id === event.reason);
  const authorLabel = event.targetLabel || post?.author;
  const postText = event.postText || post?.text || post?.question;
  const linkedPost = event.targetId ? local.posts.find((entry) => entry.named && (entry.authorUsername?.toLowerCase() === event.targetId?.toLowerCase() || entry.author.toLowerCase() === event.targetId?.toLowerCase())) : undefined;
  const targetHref = event.targetId && (event.targetId.toLowerCase() === local.profile.username.toLowerCase() || event.targetId.toLowerCase() === local.profile.name.toLowerCase())
    ? "/profile"
    : event.targetId ? `/user/${encodeURIComponent(linkedPost?.authorUsername ?? event.targetId.toLowerCase())}` : undefined;
  return (
    <li className={adminCardClass}>
      <div className="flex flex-wrap items-center gap-2">
        <strong>{historyLabels[event.action]}</strong>
        {post?.city && <span className="rounded-md bg-peach px-2 py-0.5 text-xs text-coral-deep font-semibold">{post.city}</span>}
        <span className="ml-auto text-sm text-muted">{formatDate(event.createdAt)}</span>
      </div>
      {authorLabel && <p className="mb-0 mt-2 text-sm">Автор поста: {targetHref ? <Link href={targetHref} className="font-bold text-coral-deep underline-offset-2 hover:underline">{authorLabel}</Link> : <strong>{authorLabel}</strong>}{event.targetId ? ` · @${event.targetId}` : post?.named === false ? " · анонимно" : ""}</p>}
      {!authorLabel && event.targetId && <p className="mb-0 mt-2 text-sm">Аккаунт: {targetHref ? <Link href={targetHref} className="font-bold text-coral-deep underline-offset-2 hover:underline">@{event.targetId}</Link> : <strong>@{event.targetId}</strong>}</p>}
      <p className="mb-0 mt-1 text-sm text-muted">
        {event.description}{reason ? ` · причина: ${reason.label}` : ""}{event.postId ? ` · пост №${event.postId}` : ""}
      </p>
      {postText && <p className={`${adminPostPreviewClass} whitespace-pre-wrap`}>{postText}</p>}
      {post?.image && <Image src={post.image} alt={post.imageAlt ?? "Изображение публикации"} width={1200} height={800} unoptimized className="mt-3 max-h-96 w-full rounded-xl object-contain" />}
    </li>
  );
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
    <li className={adminCardClass}>
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

      <blockquote className={`${adminPostPreviewClass} mx-0 mb-0 border-0`}>
        <span className="block [font-weight:var(--font-weights-bold)]">
          {report.authorId ? report.postAuthor : "Анонимный автор"}
          {authorBlocked && <span className="ml-2 text-coral-deep [font-size:var(--font-sizes-meta)]">· заблокирован</span>}
          {postRemoved && <span className="ml-2 text-coral-deep [font-size:var(--font-sizes-meta)]">· пост удалён</span>}
        </span>
        <span className="mt-1 block [overflow-wrap:anywhere]">{report.postText || "(пост без текста)"}</span>
      </blockquote>

      {isNew ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => removePost(report.postId, { authorId: report.authorId, author: report.postAuthor, postText: report.postText })} className={`${pillClass} border-coral bg-coral [color:var(--colors-white)] hover:bg-coral-deep`}>
            Удалить пост
          </button>
          <button
            type="button"
            disabled={!report.authorId}
            title={report.authorId ? undefined : "Автор анонимный — блокировка недоступна"}
            onClick={() => report.authorId && blockUser(report.authorId, report.postAuthor)}
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