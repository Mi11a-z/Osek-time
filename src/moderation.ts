"use client";

import { useSyncExternalStore } from "react";

// ---------- типы ----------

export type Role = "user" | "admin";

export type ReportReason = "spam" | "abuse" | "hate" | "violence" | "illegal" | "personal" | "other";

export const reportReasons: { id: ReportReason; label: string; hint: string }[] = [
  { id: "spam", label: "Спам или реклама", hint: "Навязчивая реклама, мошенничество, ссылки на сторонние ресурсы." },
  { id: "abuse", label: "Оскорбления и травля", hint: "Унижение, угрозы или преследование конкретного человека." },
  { id: "hate", label: "Разжигание вражды", hint: "Ненависть по национальности, религии, полу и другим признакам." },
  { id: "violence", label: "Насилие и опасный контент", hint: "Призывы к насилию, самоповреждению, жестокие сцены." },
  { id: "illegal", label: "Незаконная деятельность", hint: "Продажа запрещённого, призывы к противоправным действиям." },
  { id: "personal", label: "Личные данные", hint: "Публикация чужих телефонов, адресов, документов без согласия." },
  { id: "other", label: "Другое", hint: "Опишите проблему своими словами." },
];

export type ReportStatus = "new" | "resolved" | "dismissed";

export type NewReport = {
  postId: number;
  postText: string;
  postAuthor: string;
  authorId: string | null; // null — пост анонимный
  reason: ReportReason;
  details: string;
};

export type Report = NewReport & {
  id: string;
  reporter: string;
  createdAt: number;
  status: ReportStatus;
  resolution?: string;
};

type Snapshot = {
  ready: boolean;
  role: Role;
  reports: Report[];
  removed: number[];
  blocked: string[];
};

// ---------- хранилище (localStorage, без бэкенда) ----------

const KEY = "osek-moderation";

// Код доступа лежит в клиентском коде, поэтому это защита «от случайных людей», а не настоящая безопасность.
// Задай свой через NEXT_PUBLIC_ADMIN_CODE в .env.local.
const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE ?? "osek-admin";

const EMPTY: Snapshot = { ready: false, role: "user", reports: [], removed: [], blocked: [] };

let snapshot: Snapshot = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): Snapshot {
  const next: Snapshot = { ready: true, role: "user", reports: [], removed: [], blocked: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.role === "admin") next.role = "admin";
      if (Array.isArray(data.reports)) next.reports = data.reports;
      if (Array.isArray(data.removed)) next.removed = data.removed;
      if (Array.isArray(data.blocked)) next.blocked = data.blocked;
    }
  } catch {}
  return next;
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(patch: Partial<Omit<Snapshot, "ready">>) {
  getSnapshot(); // гарантируем, что данные загружены
  snapshot = { ...snapshot, ...patch, ready: true };
  try {
    const { role, reports, removed, blocked } = snapshot;
    localStorage.setItem(KEY, JSON.stringify({ role, reports, removed, blocked }));
  } catch {}
  emit();
}

function getSnapshot(): Snapshot {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    snapshot = load();
  }
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // синхронизация между вкладками
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      snapshot = load();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useModeration(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ---------- роль ----------

export function checkAdminCode(code: string): boolean {
  return code === ADMIN_CODE;
}

export function setRole(role: Role) {
  commit({ role });
}

// ---------- жалобы ----------

function currentReporter(): string {
  try {
    const saved = localStorage.getItem("osek-profile");
    if (saved) {
      const username = JSON.parse(saved)?.username;
      if (typeof username === "string" && username) return username;
    }
  } catch {}
  return "гость";
}

export function addReport(input: NewReport) {
  const { reports } = getSnapshot();
  const reporter = currentReporter();

  // повторная жалоба того же человека на тот же пост по той же причине не создаётся
  const duplicate = reports.some(
    (r) => r.status === "new" && r.postId === input.postId && r.reporter === reporter && r.reason === input.reason,
  );
  if (duplicate) return;

  const report: Report = {
    ...input,
    details: input.details.slice(0, 300),
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reporter,
    createdAt: Date.now(),
    status: "new",
  };
  commit({ reports: [report, ...reports] });
}

export function dismissReport(id: string) {
  const { reports } = getSnapshot();
  commit({
    reports: reports.map((r) => (r.id === id ? { ...r, status: "dismissed", resolution: "Жалоба отклонена" } : r)),
  });
}

// ---------- действия админа ----------

export function removePost(postId: number) {
  const { reports, removed } = getSnapshot();
  commit({
    removed: removed.includes(postId) ? removed : [...removed, postId],
    reports: reports.map((r) =>
      r.postId === postId && r.status === "new" ? { ...r, status: "resolved", resolution: "Пост удалён" } : r,
    ),
  });
}

export function restorePost(postId: number) {
  const { removed } = getSnapshot();
  commit({ removed: removed.filter((id) => id !== postId) });
}

export function blockUser(authorId: string) {
  const { reports, blocked } = getSnapshot();
  commit({
    blocked: blocked.includes(authorId) ? blocked : [...blocked, authorId],
    reports: reports.map((r) =>
      r.authorId === authorId && r.status === "new" ? { ...r, status: "resolved", resolution: "Автор заблокирован" } : r,
    ),
  });
}

export function unblockUser(authorId: string) {
  const { blocked } = getSnapshot();
  commit({ blocked: blocked.filter((id) => id !== authorId) });
}