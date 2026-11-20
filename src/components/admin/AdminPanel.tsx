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

  // Состояния фильтров, сортировки и поиска
  const [cityFilter, setCityFilter] = useState("Все города");
  const [actionFilter, setActionFilter] = useState<"all" | ModerationEvent["action"]>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const allPosts = useMemo(() => [
    ...samplePosts.filter((post) => !localData.posts.some((localPost) => localPost.id === post.id)),
    ...localData.posts,
  ], [localData.posts]);

  const newReports = reports.filter((r) => r.status === "new");
  const doneReports = reports.filter((r) => r.status !== "new");
  const rawVisibleReports = section === "new" ? newReports : doneReports;

  const recordedReports = new Set(history.filter((event) => event.action === "report_received").map((event) => event.reportId));
  const historyItems: ModerationEvent[] = useMemo(() => [
    ...history,
    ...reports.filter((report) => !recordedReports.has(report.id)).map((report): ModerationEvent => ({
      id: `${report.id}:legacy`, createdAt: report.createdAt, action: "report_received",
      targetId: report.authorId, targetLabel: report.postAuthor, postId: report.postId,
      reportId: report.id, reason: report.reason, postText: report.postText,
      description: `Ранее поступила жалоба от @${report.reporter}${report.resolution ? ` · ${report.resolution}` : ""}`,
    })),
  ], [history, reports, recordedReports]);

  // Безопасная функция поиска по пользователю и словам (без ошибок типизации)
  const matchesUserOrText = (params: {
    post?: LocalPost | Post;
    report?: Report;
    event?: ModerationEvent;
    cleanQuery: string;
  }) => {
    const { post, report, event, cleanQuery } = params;
    if (!cleanQuery) return true;

    const searchableParts: (string | null | undefined)[] = [
      post?.text,
      post?.question,
      report?.postText,
      report?.details,
      event?.postText,
      event?.description,
      event?.targetLabel,
      event?.targetId,
      report?.postAuthor,
      report?.authorId,
      report?.reporter,
      post?.named ? post.author : undefined,
      post && "authorUsername" in post ? (post.authorUsername as string) : undefined,
      localData.profile.name,
      localData.profile.username,
    ];

    const fullTextSearchString = searchableParts
      .filter((item): item is string => typeof item === "string" && item.length > 0)
      .join(" ")
      .toLowerCase();

    const normalizedQuery = cleanQuery.replace(/^@/, "").toLowerCase();
    const targetString = fullTextSearchString.replace(/@/g, "");

    return targetString.includes(normalizedQuery);
  };

  const filteredHistoryItems = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();

    return historyItems
      .filter((event) => {
        const post = allPosts.find((p) => p.id === event.postId);
        const report = reports.find((r) => r.id === event.reportId);
        const postCity = post?.city || "Все города";

        const matchesCity = cityFilter === "Все города" || postCity === cityFilter;
        const matchesAction = actionFilter === "all" || event.action === actionFilter;
        const matchesQuery = matchesUserOrText({ post, report, event, cleanQuery });

        return matchesCity && matchesAction && matchesQuery;
      })
      .sort((a, b) => (sortOrder === "desc" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
  }, [historyItems, cityFilter, actionFilter, searchQuery, sortOrder, allPosts, reports, localData.profile]);

  const filteredReports = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();

    return rawVisibleReports
      .filter((report) => {
        const post = allPosts.find((p) => p.id === report.postId);
        const postCity = post?.city || "Все города";

        const matchesCity = cityFilter === "Все города" || postCity === cityFilter;
        const matchesQuery = matchesUserOrText({ post, report, cleanQuery });

        return matchesCity && matchesQuery;
      })
      .sort((a, b) => (sortOrder === "desc" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
  }, [rawVisibleReports, cityFilter, searchQuery, sortOrder, allPosts, localData.profile]);

  if (!ready) return null;

  if (role !== "admin") {
    return (
      <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]">
        <BackHeader prefix="pf" />
        <p className="py-[80px] text-center text-muted">Страница не найдена.</p>
        <p className="text-center"><Link href="/" className="text-coral-deep">На главную</Link></p>
      </main>
    );
  }

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

  const showFilterBar = section === "history" || section === "new" || section === "done";

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
          {showFilterBar && (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[var(--radii-panel)] border border-line bg-surface p-4">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                aria-label="Фильтр по городу"
                className="cursor-pointer rounded-xl border border-line bg-background px-3 py-2 text-sm font-medium outline-none focus:border-coral"
              >
                <option value="Все города">Все города</option>
                <option value="Алматы">Алматы</option>
                <option value="Астана">Астана</option>
                <option value="Шымкент">Шымкент</option>
              </select>

              {section === "history" && (
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as "all" | ModerationEvent["action"])}
                  aria-label="Фильтр по действиям"
                  className="cursor-pointer rounded-xl border border-line bg-background px-3 py-2 text-sm font-medium outline-none focus:border-coral"
                >
                  <option value="all">Все действия</option>
                  <option value="report_received">Поступила жалоба</option>
                  <option value="report_dismissed">Жалоба отклонена</option>
                  <option value="post_removed">Пост удалён</option>
                  <option value="post_restored">Пост восстановлен</option>
                  <option value="user_blocked">Заблокированные</option>
                  <option value="user_unblocked">Блокировка снята</option>
                </select>
              )}

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
                aria-label="Сортировка по дате"
                className="cursor-pointer rounded-xl border border-line bg-background px-3 py-2 text-sm font-medium outline-none focus:border-coral"
              >
                <option value="desc">Сначала новые</option>
                <option value="asc">Сначала старые</option>
              </select>

              <div className="flex min-w-[220px] flex-1 items-center rounded-xl border border-line bg-background px-3 py-2 focus-within:border-coral">
                <input
                  type="search"
                  placeholder="Поиск по посту, имени или @юзернейму..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="ml-2 cursor-pointer text-xs text-muted hover:text-ink"
                    aria-label="Очистить поиск"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {section === "overview" && (
            <section className="grid gap-4 lg:grid-cols-2" aria-label="Обзор активности">
              <DashCard title="Пользователи" note="Регистрация недоступна в демо-режиме">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label="Всего" value={localData.ready ? 1 : 0} />
                  {periods.map((period) => <Metric key={period.id} label={`Новых · ${period.label}`} value="—" />)}
                </div>
                <p className="mb-0 mt-4 text-sm text-muted">Приложение хранит один профиль в этом браузере, без списка аккаунтов и дат регистрации. Реальные цифры появятся, когда backend начнёт отдавать статистику.</p>
              </DashCard>

              <DashCard title="Популярные темы" note="Города в публикациях — доступные сейчас темы ленты">
                {popularCities.length ? (
                  <ol className="m-0 grid list-none gap-3 p-0">
                    {popularCities.map(([city, count], index) => (
                      <li key={city} className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-peach text-sm font-bold text-coral-deep">{index + 1}</span>
                        <span className="font-semibold"># {city}</span>
                        <span className="ml-auto text-sm text-muted">{count} пост.</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mb-0 text-muted">Публикаций пока нет.</p>
                )}
              </DashCard>

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

              <DashCard title="Жалобы и модерация" note="Обновляется при обработке жалоб">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label="Новые жалобы" value={newReports.length} />
                  <Metric label="Всего жалоб" value={reports.length} />
                  <Metric label="Постов удалено" value={removed.length} />
                  <Metric label="Заблокировано" value={blocked.length} />
                </div>
              </DashCard>
            </section>
          )}

          {section === "removed" ? (
            removed.length === 0 ? (
              <p className="py-[50px] text-center text-muted">Удалённых публикаций нет.</p>
            ) : (
              <ul className="m-0 grid list-none gap-3 p-0">
                {removed.map((id) => (
                  <li key={id} className={adminCardClass}>
                    {(() => {
                      const post = allPosts.find((item) => item.id === id);
                      const removedEvent = history.find((event) => event.postId === id && event.action === "post_removed");
                      const poll = post && "poll" in post ? post.poll : undefined;
                      return (
                        <>
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
                        </>
                      );
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
            filteredHistoryItems.length === 0 ? (
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
            )
          ) : section === "new" || section === "done" ? (
            filteredReports.length === 0 ? (
              <p className="py-[50px] text-center text-muted">
                {rawVisibleReports.length === 0
                  ? (section === "new" ? "Новых жалоб нет." : "Обработанных жалоб пока нет.")
                  : "Ничего не найдено по вашему запросу."}
              </p>
            ) : (
              <ul className="m-0 grid list-none gap-4 p-0">
                {filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    total={reports.filter((r) => r.postId === report.postId).length}
                    postRemoved={removed.includes(report.postId)}
                    authorBlocked={report.authorId !== null && blocked.includes(report.authorId)}
                  />
                ))}
              </ul>
            )
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
  return (
    <div className="flex min-h-20 min-w-0 flex-col justify-center rounded-xl bg-peach/40 px-3 py-3">
      <strong className="font-display text-2xl">{value}</strong>
      <span className="break-words text-xs leading-tight text-muted">{label}</span>
    </div>
  );
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
  const linkedPost = event.targetId
    ? local.posts.find((entry) => entry.named && (entry.authorUsername?.toLowerCase() === event.targetId?.toLowerCase() || entry.author.toLowerCase() === event.targetId?.toLowerCase()))
    : undefined;
  const targetHref = event.targetId && (event.targetId.toLowerCase() === local.profile.username.toLowerCase() || event.targetId.toLowerCase() === local.profile.name.toLowerCase())
    ? "/profile"
    : event.targetId ? `/user/${encodeURIComponent(linkedPost?.authorUsername ?? event.targetId.toLowerCase())}` : undefined;

  return (
    <li className={adminCardClass}>
      <div className="flex flex-wrap items-center gap-2">
        <strong>{historyLabels[event.action]}</strong>
        {post?.city && <span className="rounded-md bg-peach px-2 py-0.5 text-xs font-semibold text-coral-deep">{post.city}</span>}
        <span className="ml-auto text-sm text-muted">{formatDate(event.createdAt)}</span>
      </div>
      {authorLabel && (
        <p className="mb-0 mt-2 text-sm">
          Автор поста:{" "}
          {targetHref ? (
            <Link href={targetHref} className="font-bold text-coral-deep underline-offset-2 hover:underline">{authorLabel}</Link>
          ) : (
            <strong>{authorLabel}</strong>
          )}
          {event.targetId ? ` · @${event.targetId}` : post?.named === false ? " · анонимно" : ""}
        </p>
      )}
      {!authorLabel && event.targetId && (
        <p className="mb-0 mt-2 text-sm">
          Аккаунт:{" "}
          {targetHref ? (
            <Link href={targetHref} className="font-bold text-coral-deep underline-offset-2 hover:underline">@{event.targetId}</Link>
          ) : (
            <strong>@{event.targetId}</strong>
          )}
        </p>
      )}
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