"use client";

import { useState } from "react";
import { Icon } from "../ui/Icon";

const cities = ["Все города", "Алматы", "Астана", "Шымкент"];

const toolbarClass = `flex items-center justify-between [gap:var(--layout-toolbar-gap)] [margin:var(--layout-toolbar-margin)]
  max-[1000px]:flex-wrap max-[1000px]:[gap:var(--layout-toolbar-gap-at1000)] max-[1000px]:my-5
  max-[480px]:[gap:var(--layout-toolbar-gap-at480)] max-[480px]:my-[17px]`;

const citiesClass = `flex shrink-0 gap-[14px] max-[1240px]:gap-2.5 max-[1000px]:flex-1
  max-[800px]:grid max-[800px]:grid-cols-[1.35fr_1fr_1fr_1.1fr] max-[800px]:gap-2
  max-[480px]:w-full max-[480px]:grid-cols-[1.4fr_1fr_1fr_1.15fr] max-[480px]:gap-1.5`;

const chipClass = `flex items-center justify-center gap-3 [min-height:var(--buttons-city-height)]
  [padding:var(--buttons-city-padding)] [border-width:var(--borders-thin)] border-solid
  [border-radius:var(--radii-chip)] [font-size:var(--font-sizes-body)] [font-weight:var(--font-weights-bold)] whitespace-nowrap
  max-[1000px]:flex-1 max-[800px]:px-3 max-[800px]:[font-size:var(--font-sizes-label)] max-[800px]:gap-[7px]
  max-[480px]:min-h-[42px] max-[480px]:[padding:9px_7px] max-[480px]:[font-size:var(--font-sizes-caption)]
  max-[480px]:[border-radius:var(--radii-chip-small)] max-[480px]:gap-[5px]`;

const searchClass = `flex items-center gap-[14px] [width:var(--search-width)] [min-width:var(--search-min-width)]
  [padding:var(--search-padding)] [border:var(--borders-thin)_solid_var(--line)] [border-radius:var(--radii-panel)]
  [min-height:var(--search-height)] max-[1240px]:[width:var(--search-width-at1240)] max-[1240px]:px-[17px]
  max-[1000px]:[width:var(--search-width-at1000)]
  max-[480px]:[min-width:var(--search-min-width-at480)] max-[480px]:[min-height:var(--search-height-at480)]
  max-[480px]:[border-radius:var(--radii-search-small)] max-[480px]:[padding:var(--search-padding-at480)] max-[480px]:gap-2.5`;

export function FeedToolbar() {
  const [activeCity, setActiveCity] = useState("Все города");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className={toolbarClass} aria-label="Города и поиск">
      <div className={citiesClass} role="group" aria-label="Выбор города">
        {cities.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => setActiveCity(city)}
            className={`${chipClass} ${activeCity === city ? "bg-coral border-coral [color:var(--colors-white)] px-[22px]" : "bg-transparent border-line text-inherit max-[1240px]:px-[21px]"}`}
            aria-pressed={activeCity === city}
          >
            {city === "Все города" && <Icon name="globe" className="size-[23px] max-[480px]:size-4" />}
            {city}
          </button>
        ))}
      </div>
      <label className={searchClass}>
        <Icon name="search" className="size-[23px]" />
        <input
          className="w-full min-w-0 p-0 border-0 bg-transparent text-ink [font-size:var(--font-sizes-body)] placeholder:text-muted placeholder:opacity-100 max-[1240px]:[font-size:var(--font-sizes-meta)] max-[480px]:[font-size:var(--font-sizes-small)]"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Поиск по постам, городам, темам…"
          aria-label="Поиск по постам, городам и темам"
        />
      </label>
    </section>
  );
}
