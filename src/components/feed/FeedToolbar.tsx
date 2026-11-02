"use client";

import { useState } from "react";
import { Icon } from "../ui/Icon";

const cities = ["Все города", "Алматы", "Астана", "Шымкент"];

export function FeedToolbar() {
  const [activeCity, setActiveCity] = useState("Все города");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="feed-toolbar" aria-label="Города и поиск">
      <div className="city-filters" role="group" aria-label="Выбор города">
        {cities.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => setActiveCity(city)}
            className={`city-chip ${activeCity === city ? "is-selected" : ""}`}
            aria-pressed={activeCity === city}
          >
            {city === "Все города" && <Icon name="globe" />}
            {city}
          </button>
        ))}
      </div>
      <label className="search-field">
        <Icon name="search" />
        <input
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
