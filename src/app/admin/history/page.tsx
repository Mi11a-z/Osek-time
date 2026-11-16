import { AdminPanel } from "@/src/components/admin/AdminPanel";

export const metadata = { title: "История действий — Админ-панель", robots: { index: false, follow: false } };

export default function AdminHistoryPage() {
  return <AdminPanel section="history" />;
}
