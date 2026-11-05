"use client";

import { useEffect, useState } from "react";
import type { ProfileUser } from "../../data/profile";

export type ProfileForm = Pick<ProfileUser, "name" | "city" | "bio">;

type EditProfileModalProps = {
  profile: ProfileForm;
  onSave: (profile: ProfileForm) => void;
  onClose: () => void;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border-solid border-line bg-transparent px-3.5 py-2.5 [border-width:var(--borders-thin)] focus:border-coral focus:outline-none";

export function EditProfileModal({ profile, onSave, onClose }: EditProfileModalProps) {
  const [form, setForm] = useState<ProfileForm>(profile);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const valid = form.name.trim().length > 0 && form.city.trim().length > 0;

  function submit() {
    if (!valid) return;
    onSave({ name: form.name.trim(), city: form.city.trim(), bio: form.bio.trim() });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0_0_0/0.4)] p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Редактировать профиль"
        className="w-full max-w-md rounded-[var(--radii-panel)] bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="m-0 font-display text-xl [font-weight:var(--font-weights-heavy)]">Редактировать профиль</h2>

        <label className="mt-4 block text-sm [font-weight:var(--font-weights-bold)]">
          Имя
          <input value={form.name} onChange={set("name")} maxLength={40} className={inputClass} />
        </label>

        <label className="mt-3 block text-sm [font-weight:var(--font-weights-bold)]">
          Город
          <input value={form.city} onChange={set("city")} maxLength={40} className={inputClass} />
        </label>

        <label className="mt-3 block text-sm [font-weight:var(--font-weights-bold)]">
          О себе
          <textarea value={form.bio} onChange={set("bio")} rows={3} maxLength={200} className={inputClass} />
        </label>
        <p className="mt-1 text-right text-muted [font-size:var(--font-sizes-meta)]">{form.bio.length}/200</p>

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