"use client";

import { useState } from "react";
import { Icon } from "../ui/Icon";

export function PostComposer() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [postText, setPostText] = useState("");

  function handlePublish() {
    if (!postText.trim()) {
      alert("Напишите текст публикации!");
      return;
    }
    alert(`Пост опубликован (${isAnonymous ? "Анонимно" : "От вашего имени"})!`);
    setPostText("");
  }

  return (
    <section className="composer" aria-label="Новая публикация">
      <label className="composer-field">
        <Icon name="pencil" />
        <textarea
          rows={1}
          value={postText}
          onChange={(event) => setPostText(event.target.value)}
          placeholder="Что обсуждают в твоём городе?"
          aria-label="Текст новой публикации"
        />
      </label>
      <div className="composer-controls">
        <button
          type="button"
          role="switch"
          aria-checked={isAnonymous}
          aria-label="Опубликовать анонимно"
          className="anonymous-control composer-anonymous"
          onClick={() => setIsAnonymous((previous) => !previous)}
        >
          <Icon name="mask" />
          <span>Анонимно</span>
          <span className={`composer-toggle ${isAnonymous ? "is-on" : ""}`} aria-hidden="true">
            <span className="composer-toggle-thumb" />
          </span>
        </button>
        <button type="button" onClick={handlePublish} className="publish-button">
          Опубликовать
        </button>
        <p className="privacy-note">
          <Icon name="lock" />
          <span>Автор скрыт от читателей, но виден модераторам.</span>
        </p>
      </div>
    </section>
  );
}
