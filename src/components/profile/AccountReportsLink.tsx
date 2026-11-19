import Link from "next/link";

export function AccountReportsLink({ username, count }: { username: string; count: number }) {
  return (
    <Link
      href={`/admin/users/${encodeURIComponent(username)}/reports`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Жалобы на @${username}, всего ${count}. Открыть в новой вкладке`}
      className="rounded-full border border-line px-4 py-2 text-center text-sm font-semibold text-ink no-underline hover:border-coral"
    >
      Жалобы · {count} <span aria-hidden="true">↗</span>
    </Link>
  );
}
