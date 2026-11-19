import { useEffect, useRef, useState, type ReactNode } from "react";
import { profileTabs, type ProfileTab } from "../../data/profile";

type ProfileTabsProps = {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  children?: ReactNode;
};

export function ProfileTabs({ activeTab, onChange, children }: ProfileTabsProps) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const current = profileTabs.find((tab) => tab.id === activeTab);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  return (
    <header className="mb-3 mt-5 flex items-center justify-between gap-3 border-b border-line pb-2">
      <div ref={container} className="relative"
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
        onKeyDown={(event) => {
          if (open && event.key === "Escape") {
            setOpen(false);
            trigger.current?.focus();
          }
        }}>
        <h2 className="m-0 font-display text-xl font-bold">
          <button type="button" ref={trigger} aria-expanded={open} aria-label={`Раздел профиля: ${current?.label}`}
            onClick={() => setOpen(!open)} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md bg-transparent pr-2 hover:text-coral-deep">
            {current?.label}
            <span aria-hidden="true" className={`size-2 border-r border-b border-current ${open ? "rotate-[225deg]" : "rotate-45"}`} />
          </button>
        </h2>
        {open && (
          <div className="absolute left-0 top-full z-20 min-w-48 rounded-xl border border-line bg-surface p-1 shadow-lg">
            {profileTabs.map((tab) => (
              <button key={tab.id} type="button" aria-current={activeTab === tab.id || undefined}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-peach aria-current:bg-peach aria-current:font-semibold"
                onClick={() => {
                  onChange(tab.id);
                  setOpen(false);
                  trigger.current?.focus();
                }}>
                {tab.label}{activeTab === tab.id && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      {children}
    </header>
  );
}
