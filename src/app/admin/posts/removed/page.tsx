import { AdminPanel } from "@/src/components/admin/AdminPanel";

export const metadata = { title: "Удалённые посты — Админ-панель", robots: { index: false, follow: false } };

export default function RemovedPostsPage() {
  return <AdminPanel section="removed" />;
}
