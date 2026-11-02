import Link from "next/link";

export function BackHeader({ prefix }: { prefix: "pf" | "pd" }) {
  return (
    <header className={`${prefix}-masthead`}>
      <Link href="/" className={`${prefix}-wordmark`}>Osek Time</Link>
      <Link href="/" className={`${prefix}-back`}>← Вернуться в ленту</Link>
    </header>
  );
}
