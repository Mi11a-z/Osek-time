import { AdminPanel } from "@/src/components/admin/AdminPanel";

export const metadata = { title: "Заблокированные — Админ-панель", robots: { index: false, follow: false } };

export default function BlockedUsersPage() {
  return <AdminPanel section="blocked" />;
}
