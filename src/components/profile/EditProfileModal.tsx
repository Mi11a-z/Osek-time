"use client";

import { useEffect, useState } from "react";

export type ProfileForm = {
  name: string;
  username: string;
  city: string;
  country: string;
  bio: string;
};

type EditProfileModalProps = {
  profile: ProfileForm;
  onSave: (profile: ProfileForm) => boolean | void;
  onClose: () => void;
  error?: string | null;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border-solid border-line bg-transparent px-3.5 py-2.5 [border-width:var(--borders-thin)] focus:border-coral focus:outline-none";

const usernamePattern = /^[a-z0-9_.]{3,20}$/i;

export function EditProfileModal({ profile, onSave, onClose, error }: EditProfileModalProps) {
  const [form, setForm] = useState<ProfileForm>(profile);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  // в юзернейме убираем @ и пробелы
  const setUsername = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, username: e.target.value.replace(/[@\s]/g, "") }));

  const usernameValid = usernamePattern.test(form.username);
  const valid =
    form.name.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.country.trim().length > 0 &&
    usernameValid;

  function submit() {
    if (!valid) return;
    const saved = onSave({
      name: form.name.trim(),
      username: form.username.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      bio: form.bio.trim(),
    });
    if (saved !== false) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0_0_0/0.4)] p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Редактировать профиль"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[var(--radii-panel)] bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="m-0 font-display text-xl [font-weight:var(--font-weights-heavy)]">Редактировать профиль</h2>

        <label className="mt-4 block text-sm [font-weight:var(--font-weights-bold)]">
          Имя
          <input value={form.name} onChange={set("name")} maxLength={40} className={inputClass} />
        </label>

        <label className="mt-3 block text-sm [font-weight:var(--font-weights-bold)]">
          Юзернейм
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-muted">@</span>
            <input value={form.username} onChange={setUsername} maxLength={20} className={`${inputClass} pl-8`} />
          </div>
        </label>
        {!usernameValid && (
          <p className="mt-1 text-coral-deep [font-size:var(--font-sizes-meta)]">
            3–20 символов: латинские буквы, цифры, «_» и «.»
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="mt-3 block text-sm [font-weight:var(--font-weights-bold)]">
            Страна
            <input value={form.country} onChange={set("country")} maxLength={40} className={inputClass} />
          </label>
          <label className="mt-3 block text-sm [font-weight:var(--font-weights-bold)]">
            Город
            <input value={form.city} onChange={set("city")} maxLength={40} className={inputClass} />
          </label>
        </div>

        <label className="mt-3 block text-sm [font-weight:var(--font-weights-bold)]">
          О себе
          <textarea value={form.bio} onChange={set("bio")} rows={3} maxLength={200} className={inputClass} />
        </label>
        <p className="mt-1 text-right text-muted [font-size:var(--font-sizes-meta)]">{form.bio.length}/200</p>

        {error && <p role="alert" className="mt-3 text-coral-deep">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-[var(--radii-pill)] border-solid border-line bg-transparent px-5 py-2.5 [border-width:var(--borders-thin)]"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={submit}
            className="cursor-pointer rounded-[var(--radii-pill)] border-0 bg-coral px-5 py-2.5 [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] hover:bg-coral-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
