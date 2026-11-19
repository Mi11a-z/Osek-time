import { AccountReports } from "../../../../../components/admin/AccountReports";

export const metadata = { title: "Жалобы на аккаунт · Osek Time" };

export default async function AccountReportsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let handle = username;
  try {
    handle = decodeURIComponent(username);
  } catch { /* Keep malformed handles as literal text. */ }
  return <AccountReports username={handle} />;
}
