"use client";

import { useEffect, useState, type FormEvent } from "react";
import { checkAdminCode, setRole } from "../../moderation";

export function AdminUnlockDialog({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (checkAdminCode(code)) {
      setRole("admin");
      onClose();
    } else {
      setError("Неверный код.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0_0_0/0.4)] p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label="Вход для администратора"
        className="w-full max-w-sm rounded-[var(--radii-panel)] bg-surface p-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="m-0 font-display text-lg [font-weight:var(--font-weights-heavy)]">Код доступа</h3>
        <input
          type="password"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          autoFocus
          autoComplete="off"
          aria-label="Код доступа"
          className="mt-3 w-full rounded-xl border-solid border-line bg-transparent px-3.5 py-2.5 [border-width:var(--borders-thin)] focus:border-coral focus:outline-none"
        />
        {error && <p className="mt-2 text-coral-deep [font-size:var(--font-sizes-meta)]">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-[var(--radii-pill)] border-solid border-line bg-transparent px-5 py-2.5 [border-width:var(--borders-thin)]">
            Отмена
          </button>
          <button type="submit" disabled={!code} className="cursor-pointer rounded-[var(--radii-pill)] border-0 bg-coral px-5 py-2.5 [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] hover:bg-coral-deep disabled:opacity-50">
            Войти
          </button>
        </div>
      </form>
    </div>
  );
}