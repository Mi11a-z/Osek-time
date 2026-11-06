import { AdminPanel } from "../../components/admin/AdminPanel";

export const metadata = {
  title: "Админ-панель",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}