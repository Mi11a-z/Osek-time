import { profileTabs, type ProfileTab } from "../../data/profile";

type ProfileTabsProps = {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
};

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  return (
    <nav className="pf-tabs" aria-label="Разделы профиля">
      {profileTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`pf-tab ${activeTab === tab.id ? "is-active" : ""}`}
          aria-pressed={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
