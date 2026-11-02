"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "../ui/Icon";

const navigation: { name: string; icon: IconName }[] = [
  { name: "Лента", icon: "home" },
  { name: "Популярное", icon: "flame" },
  { name: "Сохранённое", icon: "bookmark" },
];

const headerClass = `flex items-end justify-between [gap:var(--layout-header-gap)]
  [padding:var(--layout-header-padding)] [border-bottom:var(--borders-strong)_solid_var(--ink)]
  max-[1240px]:[gap:var(--layout-header-gap-at1240)]
  max-[1000px]:flex-col max-[1000px]:items-stretch max-[1000px]:[gap:var(--layout-header-gap-at1000)]
  max-[480px]:px-0 max-[480px]:[gap:var(--layout-header-gap-at480)]`;

const logoClass = `font-display whitespace-nowrap [font-size:var(--headings-logo)] [font-weight:var(--font-weights-heavy)]
  [line-height:var(--headings-logo-line-height)] [letter-spacing:var(--headings-logo-letter-spacing)]
  max-[1240px]:[font-size:var(--headings-logo-at1240)] max-[1000px]:[font-size:var(--headings-logo-at1000)]
  max-[800px]:[font-size:var(--headings-logo-at800)] max-[480px]:[font-size:var(--headings-logo-at480)]`;

const captionClass = `mt-0.5 pl-2 leading-[1.3] tracking-[0.02em] [font-size:var(--font-sizes-title-small)]
  max-[1240px]:[font-size:var(--font-sizes-body)]
  max-[1000px]:pl-0 max-[1000px]:[font-size:var(--font-sizes-body-large)]
  max-[480px]:mt-1.5 max-[480px]:[font-size:var(--font-sizes-meta)]`;

const navigationClass = `flex flex-1 items-stretch justify-between mb-2.5 [max-width:var(--layout-navigation-max-width)]
  [gap:var(--layout-navigation-gap)] max-[1240px]:mb-0.5 max-[1240px]:[gap:var(--layout-navigation-gap-at1240)]
  max-[1000px]:w-full max-[1000px]:[max-width:var(--layout-navigation-max-width-at1000)]
  max-[800px]:[gap:var(--layout-navigation-gap-at800)]`;

const navigationItemClass = `flex items-center justify-center gap-3 [padding:18px_12px]
  [border-bottom-width:var(--borders-focus)] border-solid [font-size:var(--font-sizes-body-large)]
  [font-weight:var(--font-weights-bold)] whitespace-nowrap no-underline
  focus-visible:[outline:var(--borders-focus)_solid_var(--coral)] focus-visible:outline-offset-4
  max-[1240px]:gap-[7px] max-[1240px]:px-2 max-[1240px]:[font-size:var(--font-sizes-meta)]
  max-[1000px]:flex-1 max-[1000px]:[padding:12px_8px] max-[1000px]:[font-size:var(--font-sizes-body)]
  max-[800px]:flex-col max-[800px]:gap-2 max-[800px]:[font-size:var(--font-sizes-label)]
  max-[480px]:[padding:11px_2px] max-[480px]:gap-[7px] max-[480px]:[font-size:var(--font-sizes-micro)]`;

const navigationIconClass = "size-[27px] max-[1240px]:size-[23px]";

export function FeedHeader() {
  const [activeNav, setActiveNav] = useState("Лента");

  return (
    <header className={headerClass}>
      <div className="shrink-0 max-[1000px]:text-center">
        <h1 className={logoClass}>Osek Time</h1>
        <p className={captionClass}>Обсуждают в Казахстане</p>
      </div>
      <nav className={navigationClass} aria-label="Основная навигация">
        {navigation.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setActiveNav(item.name)}
            className={`${navigationItemClass} ${activeNav === item.name ? "text-coral-deep border-coral" : "text-inherit border-transparent"}`}
            aria-current={activeNav === item.name ? "page" : undefined}
          >
            <Icon name={item.icon} className={`${navigationIconClass} ${activeNav === item.name && item.icon === "home" ? "fill-current" : ""}`} />
            <span>{item.name}</span>
          </button>
        ))}
        <Link href="/profile" className={`${navigationItemClass} text-inherit border-transparent`}>
          <Icon name="user" className={navigationIconClass} />
          <span>Профиль</span>
        </Link>
      </nav>
    </header>
  );
}
