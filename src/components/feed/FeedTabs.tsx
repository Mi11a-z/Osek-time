"use client";

export type FeedMode = "recommended" | "following";

const tabs: { id: FeedMode; label: string }[] = [
  { id: "recommended", label: "Рекомендации" },
  { id: "following", label: "Подписки" },
];

type FeedTabsProps = {
  active: FeedMode;
  onChange: (mode: FeedMode) => void;
};

export function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <div role="tablist" aria-label="Тип ленты" className="grid grid-cols-2 border-b border-line">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`cursor-pointer border-0 border-b-2 border-solid bg-transparent py-3 text-center [font-size:var(--font-sizes-body)] [font-weight:var(--font-weights-bold)] focus-visible:[outline:var(--borders-focus)_solid_var(--coral)] focus-visible:outline-offset-[-2px] ${isActive
              ? "border-coral text-coral-deep"
              : "border-transparent text-muted hover:text-ink"
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}