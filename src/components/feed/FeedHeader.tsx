"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "../ui/Icon";

const navigation: { name: string; icon: IconName }[] = [
  { name: "Лента", icon: "home" },
  { name: "Популярное", icon: "flame" },
  { name: "Сохранённое", icon: "bookmark" },
];

export function FeedHeader() {
  const [activeNav, setActiveNav] = useState("Лента");

  return (
    <header className="masthead">
      <div className="brand">
        <h1 className="wordmark">Osek Time</h1>
        <p className="brand-caption">Обсуждают в Казахстане</p>
      </div>
      <nav className="main-navigation" aria-label="Основная навигация">
        {navigation.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setActiveNav(item.name)}
            className={`navigation-item ${activeNav === item.name ? "is-active" : ""}`}
            aria-current={activeNav === item.name ? "page" : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.name}</span>
          </button>
        ))}
        <Link href="/profile" className="navigation-item">
          <Icon name="user" />
          <span>Профиль</span>
        </Link>
      </nav>
    </header>
  );
}
