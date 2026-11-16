import { AdminPanel } from "@/src/components/admin/AdminPanel";

export const metadata = { title: "Новые жалобы — Админ-панель", robots: { index: false, follow: false } };

export default function NewReportsPage() {
  return <AdminPanel section="new" />;
}
