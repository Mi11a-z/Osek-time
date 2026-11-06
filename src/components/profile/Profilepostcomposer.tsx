"use client";

import { useRef, useState, type ChangeEvent } from "react";

type ProfilePostComposerProps = {
  onPublish: (text: string, image?: string) => void;
};

// Сжимаем фото, чтобы оно поместилось в localStorage
function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ProfilePostComposer({ onPublish }: ProfilePostComposerProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function reset() {
    setText("");
    setImage(undefined);
    setError("");
    setOpen(false);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setImage(await readImage(file));
      setError("");
    } catch {
      setError("Не удалось загрузить фото. Попробуйте другое.");
    }
  }

  const canPublish = text.trim().length > 0 || Boolean(image);

  function publish() {
    if (!canPublish) return;
    onPublish(text.trim(), image);
    reset();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-5 w-full cursor-pointer rounded-[var(--cards-profile-radius)] border-dashed border-line bg-transparent px-5 py-4 text-left text-muted [border-width:var(--borders-thin)] hover:border-coral hover:text-coral-deep [font-weight:var(--font-weights-bold)]"
      >
        + Добавить пост
      </button>
    );
  }

  return (
    <section
      className="mb-5 border-solid border-line bg-surface [padding:var(--cards-profile-padding)] [border-width:var(--borders-thin)] [border-radius:var(--cards-profile-radius)]"
      aria-label="Новая публикация"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={500}
        autoFocus
        placeholder="О чём хотите рассказать?"
        aria-label="Текст публикации"
        className="w-full resize-none rounded-xl border-solid border-line bg-transparent px-3.5 py-2.5 [border-width:var(--borders-thin)] focus:border-coral focus:outline-none"
      />

      {image && (
        <div className="relative mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Предпросмотр фото" className="block max-h-[320px] w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => setImage(undefined)}
            aria-label="Убрать фото"
            className="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded-[var(--radii-round)] border-0 bg-ink [color:var(--colors-white)]"
          >
            ✕
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-coral-deep [font-size:var(--font-sizes-meta)]">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="cursor-pointer rounded-[var(--radii-pill)] border-solid border-line bg-transparent px-4 py-2 [border-width:var(--borders-thin)] hover:border-coral"
        >
          {image ? "Заменить фото" : "Добавить фото"}
        </button>
        <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} hidden />

        <span className="ml-auto text-muted [font-size:var(--font-sizes-meta)]">{text.length}/500</span>
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-[var(--radii-pill)] border-solid border-line bg-transparent px-4 py-2 [border-width:var(--borders-thin)]"
        >
          Отмена
        </button>
        <button
          type="button"
          disabled={!canPublish}
          onClick={publish}
          className="cursor-pointer rounded-[var(--radii-pill)] border-0 bg-coral px-5 py-2 [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] hover:bg-coral-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          Опубликовать
        </button>
      </div>
    </section>
  );
}