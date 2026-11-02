import { profileTabs, type ProfileTab } from "../../data/profile";

type ProfileTabsProps = {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
};

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  return (
    <nav className="flex flex-wrap [gap:var(--profile-tabs-gap)] [margin:var(--profile-tabs-margin)]" aria-label="Разделы профиля">
      {profileTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`cursor-pointer rounded-[var(--radii-pill)] border-solid px-6 py-[13px] [border-width:var(--borders-thin)] [font-weight:var(--font-weights-bold)] hover:border-coral max-[650px]:flex-1 max-[650px]:px-3.5 max-[650px]:py-3 ${activeTab === tab.id ? "border-coral bg-coral [color:var(--colors-white)]" : "border-line bg-transparent"}`}
          aria-pressed={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
