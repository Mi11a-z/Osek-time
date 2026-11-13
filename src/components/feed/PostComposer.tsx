"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Icon } from "../ui/Icon";
import { createLocalPost, useLocalData } from "../../data/local-store";
import { useModeration } from "../../moderation";

const composerClass = `grid gap-4 p-5 [border:var(--borders-thin)_solid_var(--colors-card-border)] [border-radius:var(--radii-panel)] bg-surface max-[480px]:p-4`;

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
  const [image, setImage] = useState<string | undefined>();
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState(24);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollSettingsOpen, setPollSettingsOpen] = useState(false);
  const [imageError, setImageError] = useState("");
  const [open, setOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [publishFailed, setPublishFailed] = useState(false);
  const { ready, profile, error } = useLocalData();
  const { ready: moderationReady, blocked } = useModeration();
  const isBlocked = blocked.includes(profile.username) || blocked.includes(profile.name);
  const hasPoll = pollQuestion.trim() && pollOptions.filter((option) => option.trim()).length >= 2;
  const pollStarted = Boolean(pollQuestion.trim() || pollOptions.some((option) => option.trim()));
  const pollComplete = !pollStarted || Boolean(hasPoll);
  const canPublish = ready && moderationReady && !isBlocked && pollComplete && (postText.trim().length > 0 || Boolean(image) || Boolean(hasPoll)) && postText.length <= 5000;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (imagePreviewOpen) setImagePreviewOpen(false);
      else setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, imagePreviewOpen]);

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImageError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImageError("Выберите файл изображения."); return; }
    if (file.size > 4 * 1024 * 1024) { setImageError("Размер изображения должен быть не больше 4 МБ."); return; }
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? setImage(reader.result) : setImageError("Не удалось загрузить изображение.");
    reader.onerror = () => setImageError("Не удалось загрузить изображение.");
    reader.readAsDataURL(file);
  }

  function handlePublish() {
    if (!canPublish) return;
    const poll = hasPoll ? { question: pollQuestion.trim(), options: pollOptions.map((option) => option.trim()).filter(Boolean), durationHours: pollDuration, multiple: pollMultiple } : undefined;
    if (!createLocalPost({ text: postText.trim(), image, poll, isAnonymous, city: city ?? profile.city })) { setPublishFailed(true); return; }
    setPublishFailed(false);
    setPostText("");
    setImage(undefined);
    setPollQuestion(""); setPollOptions(["", ""]); setPollDuration(24); setPollMultiple(false); setPollSettingsOpen(false); setPollOpen(false);
    setOpen(false);
    onPublished?.();
  }

  return (
    <>
    <button type="button" onClick={() => setOpen(true)} className="mb-4 flex w-full items-center gap-4 rounded-[var(--radii-post)] border border-line bg-surface px-5 py-4 text-left text-muted shadow-sm hover:border-coral focus-visible:outline-2 focus-visible:outline-coral">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-peach text-ink"><Icon name="pencil" className="size-5" /></span>
      <span className="flex-1">Что нового?</span><span className="rounded-[var(--radii-pill)] bg-coral px-5 py-2 font-bold text-white">Создать пост</span>
    </button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(12_24_48/0.48)] p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="composer-title" className="w-full max-w-xl overflow-y-auto rounded-[var(--radii-panel)] bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="w-9" />
          <h2 id="composer-title" className="m-0 font-bold">Новая публикация</h2>
          <button type="button" aria-label="Закрыть окно" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full border-0 bg-transparent text-2xl leading-none text-muted hover:bg-peach hover:text-ink">×</button>
        </header>
    <section className={composerClass} aria-label="Новая публикация">
      <label className="relative block min-w-0">
        <Icon name="pencil" className={pencilClass} />
        <textarea
          ref={textAreaRef}
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
      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={handleImage} aria-label="Выбрать фотографию" />
        <button type="button" onClick={() => fileInput.current?.click()} className="cursor-pointer rounded-[var(--radii-pill)] border border-line bg-transparent px-4 py-2 text-sm font-semibold hover:border-coral">Добавить фото</button>
        <span className="text-xs text-muted">До 4 МБ</span>
        <button
          type="button"
          onClick={() => {
            setPostText((prev) => (prev && !prev.endsWith(" ") && !prev.endsWith("\n") ? `${prev} #` : `${prev}#`));
            textAreaRef.current?.focus();
          }}
          className="cursor-pointer rounded-[var(--radii-pill)] border border-line bg-transparent px-4 py-2 text-sm font-semibold hover:border-coral"
        >
          ＋ Добавить хэштег
        </button>
        {image && <div className="relative size-24 shrink-0">
          <button type="button" onClick={() => setImagePreviewOpen(true)} aria-label="Открыть предпросмотр фотографии" className="absolute inset-0 overflow-hidden rounded-xl border border-line bg-ink/5 focus-visible:outline-2 focus-visible:outline-coral">
            <Image src={image} alt="Предпросмотр фотографии" fill unoptimized className="object-cover" sizes="96px" />
            <span className="absolute inset-x-0 bottom-0 bg-ink/65 px-1 py-1 text-center text-[10px] font-semibold text-white">Предпросмотр</span>
          </button>
          <button type="button" aria-label="Удалить фотографию" title="Удалить фотографию" onClick={() => setImage(undefined)} className="absolute -right-2 -top-2 z-10 grid size-8 place-items-center rounded-full border border-line bg-surface text-ink shadow-sm hover:bg-coral hover:text-white focus-visible:outline-2 focus-visible:outline-coral">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" /></svg>
          </button>
        </div>}
      </div>
      {!pollOpen ? <button type="button" onClick={() => setPollOpen(true)} className="justify-self-start rounded-[var(--radii-pill)] border border-line bg-transparent px-4 py-2 text-sm font-semibold hover:border-coral">＋ Добавить опрос</button> : <div className="grid gap-3 rounded-xl bg-peach/40 p-4">
        <div className="flex items-center justify-between gap-3"><p className="m-0 text-sm font-semibold">Опрос</p><button type="button" aria-label="Удалить опрос" title="Удалить опрос" onClick={() => { setPollQuestion(""); setPollOptions(["", ""]); setPollDuration(24); setPollMultiple(false); setPollSettingsOpen(false); setPollOpen(false); }} className="grid size-9 place-items-center rounded-full border-0 bg-transparent text-muted hover:bg-surface hover:text-coral-deep"><svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" /></svg></button></div>
        <label className="grid gap-1.5 text-sm font-medium">Вопрос
          <input value={pollQuestion} onChange={(event) => setPollQuestion(event.target.value)} maxLength={300} placeholder="Какой вопрос вы хотите задать?" className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal" />
          <span className="text-right text-xs font-normal text-muted">{pollQuestion.length} / 300</span>
        </label>
        <p className="m-0 text-sm font-medium">Ответы</p>
        {pollOptions.map((option, index) => <div key={index} className="flex items-center gap-2">
          <input value={option} onChange={(event) => setPollOptions((current) => current.map((value, i) => i === index ? event.target.value : value))} maxLength={100} placeholder="Введите ответ" className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
          {pollOptions.length > 2 && <button type="button" aria-label={`Удалить вариант ${index + 1}`} onClick={() => setPollOptions((current) => current.filter((_, i) => i !== index))} className="grid size-8 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-muted hover:bg-surface hover:text-coral-deep"><svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" /></svg></button>}
        </div>)}
        {pollOptions.length < 4 && <button type="button" onClick={() => setPollOptions((current) => [...current, ""])} className="justify-self-start border-0 bg-transparent text-sm font-semibold text-coral-deep">+ Добавить вариант</button>}
        <details open={pollSettingsOpen} onToggle={(event) => setPollSettingsOpen(event.currentTarget.open)} className="rounded-lg border border-line/70 bg-surface/60 px-3 py-2">
          <summary className="cursor-pointer select-none text-sm font-semibold">Дополнительные настройки</summary>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1.5 text-sm font-medium">Срок
              <select value={pollDuration} onChange={(event) => setPollDuration(Number(event.target.value))} className="rounded-lg border border-line bg-surface px-3 py-2 font-normal">
                <option value={24}>24 часа</option><option value={72}>3 дня</option><option value={168}>7 дней</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pollMultiple} onChange={(event) => setPollMultiple(event.target.checked)} className="size-4 accent-[var(--colors-coral)]" />Разрешить несколько ответов</label>
          </div>
        </details>
      </div>}
      {!pollComplete && <p role="alert" className="m-0 text-sm text-coral-deep">Чтобы добавить опрос, заполните вопрос и минимум два варианта ответа.</p>}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
      {imageError && <p role="alert" className="col-span-full text-coral-deep">{imageError}</p>}
      {publishFailed && <p role="alert" className="col-span-full text-coral-deep">{error ?? "Не удалось сохранить публикацию. Текст остался в форме — попробуйте ещё раз."}</p>}
    </section>
      </div>
    </div>}
    {imagePreviewOpen && image && <div role="dialog" aria-modal="true" aria-label="Предпросмотр фотографии" className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgb(12_24_48/0.82)] p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setImagePreviewOpen(false); }}>
      <button type="button" aria-label="Закрыть предпросмотр" onClick={() => setImagePreviewOpen(false)} className="absolute right-5 top-5 grid size-11 place-items-center rounded-full border border-white/30 bg-ink/40 text-3xl leading-none text-white hover:bg-ink/70">×</button>
      <div className="relative h-[min(82vh,850px)] w-[min(90vw,1100px)]" onMouseDown={(event) => event.stopPropagation()}><Image src={image} alt="Полноразмерный предпросмотр фотографии" fill unoptimized className="rounded-xl object-contain" sizes="90vw" /></div>
    </div>}
    </>
  );
}
