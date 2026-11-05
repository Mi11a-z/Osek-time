"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../ui/Icon";

type PostMenuProps = {
  onEdit?: () => void;
  onDelete: () => void;
};

export function PostMenu({ onEdit, onDelete }: PostMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setConfirmOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  return (
    <>
      <div ref={ref} className="relative">
        <button
          type="button"
          aria-label="Действия с публикацией"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent text-inherit [min-width:var(--actions-button-min-size)] [min-height:var(--actions-button-min-size)] focus-visible:[outline:var(--borders-focus)_solid_var(--coral)] focus-visible:outline-offset-4"
        >
          <Icon name="more" className="fill-current stroke-none [width:var(--actions-icon-size)] [height:var(--actions-icon-size)]" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 bottom-full z-20 mb-1 w-48 overflow-hidden rounded-xl border-solid border-line bg-surface shadow-lg [border-width:var(--borders-thin)]"
          >
            {onEdit && (
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); onEdit(); }}
                className="block w-full cursor-pointer border-0 bg-transparent px-4 py-2.5 text-left hover:bg-peach"
              >
                Редактировать
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); setConfirmOpen(true); }}
              className="block w-full cursor-pointer border-0 bg-transparent px-4 py-2.5 text-left text-coral-deep hover:bg-peach"
            >
              Удалить
            </button>
          </div>
        )}
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0_0_0/0.4)] p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Удалить публикацию"
            className="w-full max-w-sm rounded-[var(--radii-panel)] bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 font-display text-lg [font-weight:var(--font-weights-heavy)]">Удалить публикацию?</h3>
            <p className="mt-2 text-muted">Это действие нельзя отменить.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="cursor-pointer rounded-[var(--radii-pill)] border-solid border-line bg-transparent px-5 py-2.5 [border-width:var(--borders-thin)]"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => { setConfirmOpen(false); onDelete(); }}
                className="cursor-pointer rounded-[var(--radii-pill)] border-0 bg-coral px-5 py-2.5 [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] hover:bg-coral-deep"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}