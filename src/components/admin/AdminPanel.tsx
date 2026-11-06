"use client";

import Link from "next/link";
import { useState } from "react";
import { BackHeader } from "../ui/BackHeader";
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
  const [tab, setTab] = useState<AdminTab>("new");

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

  const stats = [
    { label: "Новых жалоб", value: newReports.length },
    { label: "Всего жалоб", value: reports.length },
    { label: "Удалено постов", value: removed.length },
    { label: "Заблокировано", value: blocked.length },
  ];

  return (
    <main className="mx-auto [max-width:var(--layout-profile-max-width)] [padding:var(--layout-profile-padding)]">
      <BackHeader prefix="pf" />

      <h1 className="m-0 font-display [font-size:var(--font-sizes-profile-name)] [font-weight:var(--font-weights-heavy)]">Админ-панель</h1>
      <p className="mt-1.5 text-muted">Жалобы на публикации и управление пользователями.</p>
      <button type="button" onClick={() => setRole("user")} className={`${pillClass} mt-3 border-line bg-transparent hover:border-coral`}>
        Выйти из режима админа
      </button>

      <section className="mt-5 grid grid-cols-4 overflow-hidden rounded-[var(--radii-panel)] border-solid border-ink bg-surface [border-width:var(--borders-strong)] max-[650px]:grid-cols-2" aria-label="Статистика">
        {stats.map((item, i) => (
          <div key={item.label} className={`flex flex-col items-center gap-1 border-solid border-line px-2 py-[18px] ${i > 0 ? "[border-left-width:var(--borders-thin)]" : ""}`}>
            <strong className="font-display [font-size:var(--font-sizes-stat)]">{item.value}</strong>
            <span className="text-muted [font-size:var(--font-sizes-label)]">{item.label}</span>
          </div>
        ))}
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