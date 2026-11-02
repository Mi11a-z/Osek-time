import Link from "next/link";

export function BackHeader({ prefix }: { prefix: "pf" | "pd" }) {
  const wordmarkSize = prefix === "pf"
    ? "[font-size:var(--font-sizes-brand-profile)] max-[650px]:[font-size:var(--font-sizes-brand-mobile)]"
    : "[font-size:var(--font-sizes-brand-detail)] max-[650px]:[font-size:var(--font-sizes-brand-small)]";

  return (
    <header className="mb-7 flex items-end justify-between border-solid border-ink pb-[18px] [border-bottom-width:var(--borders-strong)]">
      <Link href="/" className={`font-display leading-none tracking-[-0.04em] text-ink no-underline [font-weight:var(--font-weights-heavy)] ${wordmarkSize}`}>Osek Time</Link>
      <Link href="/" className="inline-block rounded-[var(--radii-pill)] border-solid border-line px-4 py-2.5 text-ink no-underline [border-width:var(--borders-thin)] [font-weight:var(--font-weights-bold)] hover:border-coral hover:text-coral-deep">← Вернуться в ленту</Link>
    </header>
  );
}
