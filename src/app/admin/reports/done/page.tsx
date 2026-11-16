import { AdminPanel } from "@/src/components/admin/AdminPanel";

export const metadata = { title: "Обработанные жалобы — Админ-панель", robots: { index: false, follow: false } };

export default function DoneReportsPage() {
  return <AdminPanel section="done" />;
}
