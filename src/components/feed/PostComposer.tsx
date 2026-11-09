"use client";

import { useState } from "react";
import { Icon } from "../ui/Icon";
import { createLocalPost, useLocalData } from "../../data/local-store";
import { useModeration } from "../../moderation";

const composerClass = `grid items-center [grid-template-columns:var(--composer-columns)] [gap:var(--composer-gap)]
  [padding:var(--composer-padding)] [border:var(--borders-strong)_solid_var(--ink)] [border-radius:var(--radii-post)]
  max-[1240px]:[grid-template-columns:var(--composer-columns-at1240)] max-[1240px]:[gap:var(--composer-gap-at1240)] max-[1240px]:pl-5
  max-[1000px]:[grid-template-columns:var(--composer-columns-at1000)] max-[1000px]:[gap:var(--composer-gap-at1000)] max-[1000px]:[padding:var(--composer-padding-at1000)]
  max-[480px]:[padding:var(--composer-padding-at480)] max-[480px]:[gap:var(--composer-gap-at480)]`;

const pencilClass = `pointer-events-none absolute top-[25px] left-6 size-[33px]
  max-[1240px]:left-[19px] max-[1240px]:w-7 max-[1000px]:top-[23px]
  max-[480px]:left-[13px] max-[480px]:top-[21px] max-[480px]:size-6`;

const fieldClass = `block w-full [height:var(--composer-field-height)] [padding:var(--composer-field-padding)] resize-none overflow-y-auto
  [border:var(--borders-thin)_solid_var(--colors-input-border)] [border-radius:var(--radii-composer)]
  [background:var(--colors-input-surface)] text-ink [font-size:var(--composer-text-size)] leading-[1.4]
  placeholder:text-muted placeholder:opacity-100
  max-[1240px]:[font-size:var(--composer-text-size-at1240)] max-[1240px]:pl-[65px]
  max-[1000px]:[height:var(--composer-field-height-at1000)] max-[1000px]:[font-size:var(--composer-text-size-at1000)] max-[1000px]:py-[21px]
  max-[480px]:[height:var(--composer-field-height-at480)] max-[480px]:[padding:var(--composer-field-padding-at480)]
  max-[480px]:[border-radius:var(--radii-profile-post)] max-[480px]:[font-size:var(--composer-text-size-at480)]`;

const anonymousClass = `flex items-center [gap:var(--switch-label-gap)] whitespace-nowrap cursor-pointer select-none p-0 text-left
  [font-size:var(--font-sizes-body)] [font-weight:var(--font-weights-bold)]
  max-[1240px]:[font-size:var(--font-sizes-meta)] max-[1000px]:[font-size:var(--font-sizes-body)] max-[480px]:[font-size:var(--font-sizes-small)]`;

const switchClass = `flex items-center shrink-0 [width:var(--switch-width)] [height:var(--switch-height)]
  [border-radius:var(--radii-panel)] [padding:var(--switch-padding)]
  [transition:background-color_var(--motion-transition-duration)_ease] motion-reduce:transition-none`;

const thumbClass = `[width:var(--switch-thumb-size)] [height:var(--switch-thumb-size)] [border-radius:var(--radii-round)]
  [background:var(--colors-switch-thumb)] [box-shadow:var(--shadows-switch)]
  [transition:transform_var(--motion-transition-duration)_ease] motion-reduce:transition-none`;

const publishClass = `[min-height:var(--buttons-publish-height)] [padding:var(--buttons-publish-padding)] [border-radius:var(--radii-button)]
  bg-coral [color:var(--colors-white)] [font-size:var(--buttons-publish-text-size)] [font-weight:var(--font-weights-heavy)]
  max-[1240px]:px-[23px] max-[1240px]:[font-size:var(--buttons-publish-text-size-at1240)]
  max-[1000px]:[min-height:var(--buttons-publish-height-at1000)] max-[1000px]:[padding:var(--buttons-publish-padding-at1000)]
  max-[480px]:[padding:var(--buttons-publish-padding-at480)] max-[480px]:[min-height:var(--buttons-publish-height-at480)]
  max-[480px]:[border-radius:var(--radii-small)] max-[480px]:[font-size:var(--buttons-publish-text-size-at480)]`;

const privacyClass = `flex items-center gap-3 col-span-full text-muted [font-size:var(--font-sizes-label)] leading-[1.5]
  max-[1240px]:[font-size:var(--font-sizes-caption)] max-[1240px]:gap-2 max-[1000px]:[font-size:var(--font-sizes-small)]
  max-[480px]:items-start max-[480px]:[font-size:var(--font-sizes-micro)]`;

export function PostComposer({ city, onPublished }: { city?: string; onPublished?: () => void }) {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [postText, setPostText] = useState("");
  const [publishFailed, setPublishFailed] = useState(false);
  const { ready, profile, error } = useLocalData();
  const { ready: moderationReady, blocked } = useModeration();
  const isBlocked = blocked.includes(profile.username) || blocked.includes(profile.name);
  const canPublish = ready && moderationReady && !isBlocked && postText.trim().length > 0 && postText.length <= 5000;

  function handlePublish() {
    if (!canPublish) return;
    if (!createLocalPost({ text: postText.trim(), isAnonymous, city: city ?? profile.city })) { setPublishFailed(true); return; }
    setPublishFailed(false);
    setPostText("");
    onPublished?.();
  }

  return (
    <section className={composerClass} aria-label="Новая публикация">
      <label className="relative block min-w-0">
        <Icon name="pencil" className={pencilClass} />
        <textarea
          className={fieldClass}
          rows={1}
          maxLength={5000}
          disabled={!ready || isBlocked}
          value={postText}
          onChange={(event) => setPostText(event.target.value)}
          placeholder="Что обсуждают в твоём городе?"
          aria-label="Текст новой публикации"
        />
      </label>
      <div className="grid grid-cols-[1fr_auto] items-center gap-y-2 gap-x-5 max-[1000px]:gap-x-6 max-[480px]:gap-y-[11px] max-[480px]:gap-x-2">
        <button
          type="button"
          role="switch"
          aria-checked={isAnonymous}
          aria-label="Опубликовать анонимно"
          className={anonymousClass}
          onClick={() => setIsAnonymous((previous) => !previous)}
        >
          <Icon name="mask" className="size-[27px] max-[480px]:size-[21px]" />
          <span>Анонимно</span>
          <span className={`${switchClass} ${isAnonymous ? "bg-coral" : "[background:var(--colors-switch-off)]"}`} aria-hidden="true">
            <span className={`${thumbClass} ${isAnonymous ? "[transform:translateX(calc(var(--switch-width)_-_var(--switch-padding)_*_2_-_var(--switch-thumb-size)))]" : "[transform:translateX(0)]"}`} />
          </span>
        </button>
        <button type="button" onClick={handlePublish} disabled={!canPublish} className={`${publishClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
          Опубликовать
        </button>
        <p className={privacyClass}>
          <Icon name="lock" className="size-5 [color:var(--colors-lock)] max-[480px]:size-[17px]" />
          <span>{isAnonymous ? "Автор скрыт от читателей, но виден модераторам." : "Публикация появится от вашего имени."}</span>
        </p>
      </div>
      {isBlocked && <p role="status" className="col-span-full text-coral-deep">Ваш аккаунт заблокирован: публиковать новые посты нельзя.</p>}
      {publishFailed && <p role="alert" className="col-span-full text-coral-deep">{error ?? "Не удалось сохранить публикацию. Текст остался в форме — попробуйте ещё раз."}</p>}
    </section>
  );
}
