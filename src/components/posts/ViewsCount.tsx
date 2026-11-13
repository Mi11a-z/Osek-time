export function ViewsCount({ count }: { count: number }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 text-sm text-muted"
            title="Просмотры"
            aria-label={`Просмотров: ${count}`}
        >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            {count}
        </span>
    );
}