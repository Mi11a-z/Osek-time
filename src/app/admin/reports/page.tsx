import { AdminPanel } from "@/src/components/admin/AdminPanel";

export const metadata = { title: "Жалобы — Админ-панель", robots: { index: false, follow: false } };

export default function ReportsPage() {
  return <AdminPanel section="reports" />;
}
