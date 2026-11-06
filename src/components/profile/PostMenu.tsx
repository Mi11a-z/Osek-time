"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../ui/Icon";

type PostMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onBlockAuthor?: () => void; // только для админа
  deleteLabel?: string;
  // header — «...» в шапке карточки (меню открывается вниз), footer — внизу карточки (вверх)
  variant?: "header" | "footer";
};

type Confirm = "delete" | "block" | null;

const itemClass = "block w-full cursor-pointer border-0 bg-transparent px-4 py-2.5 text-left hover:bg-peach";

export function PostMenu({ onEdit, onDelete, onReport, onBlockAuthor, deleteLabel = "Удалить", variant = "footer" }: PostMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const ref = useRef<HTMLDivElement>(null);
  const header = variant === "header";

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
    if (!confirm) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setConfirm(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirm]);

  if (!onEdit && !onDelete && !onReport && !onBlockAuthor) return null;

  const confirmTexts = {
    delete: { title: "Удалить публикацию?", text: "Это действие нельзя отменить.", action: "Удалить", run: onDelete },
    block: { title: "Заблокировать автора?", text: "Автор не сможет публиковать посты, а его публикации пропадут из ленты.", action: "Заблокировать", run: onBlockAuthor },
  } as const;

  return (
    <>
      <div ref={ref} className="relative">
        <button
          type="button"
          aria-label="Действия с публикацией"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex cursor-pointer items-center justify-center border-0 bg-transparent text-inherit focus-visible:[outline:var(--borders-focus)_solid_var(--coral)] focus-visible:outline-offset-4 ${header ? "min-h-9 min-w-9 p-1" : "[min-width:var(--actions-button-min-size)] [min-height:var(--actions-button-min-size)]"}`}
        >
          <Icon
            name="more"
            className={`fill-current stroke-none ${header ? "size-[26px]" : "[width:var(--actions-icon-size)] [height:var(--actions-icon-size)]"}`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className={`absolute right-0 z-20 w-56 overflow-hidden rounded-xl border-solid border-line bg-surface shadow-lg [border-width:var(--borders-thin)] ${header ? "top-full mt-1" : "bottom-full mb-1"}`}
          >
            {onEdit && (
              <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(); }} className={itemClass}>
                Редактировать
              </button>
            )}
            {onReport && (
              <button type="button" role="menuitem" onClick={() => { setOpen(false); onReport(); }} className={itemClass}>
                Пожаловаться
              </button>
            )}
            {onDelete && (
              <button type="button" role="menuitem" onClick={() => { setOpen(false); setConfirm("delete"); }} className={`${itemClass} text-coral-deep`}>
                {deleteLabel}
              </button>
            )}
            {onBlockAuthor && (
              <button type="button" role="menuitem" onClick={() => { setOpen(false); setConfirm("block"); }} className={`${itemClass} text-coral-deep`}>
                Заблокировать автора
              </button>
            )}
          </div>
        )}
      </div>

      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0_0_0/0.4)] p-4"
          onClick={() => setConfirm(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={confirmTexts[confirm].title}
            className="w-full max-w-sm rounded-[var(--radii-panel)] bg-surface p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 font-display text-lg [font-weight:var(--font-weights-heavy)]">{confirmTexts[confirm].title}</h3>
            <p className="mt-2 text-muted">{confirmTexts[confirm].text}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="cursor-pointer rounded-[var(--radii-pill)] border-solid border-line bg-transparent px-5 py-2.5 [border-width:var(--borders-thin)]"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => { const run = confirmTexts[confirm].run; setConfirm(null); run?.(); }}
                className="cursor-pointer rounded-[var(--radii-pill)] border-0 bg-coral px-5 py-2.5 [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] hover:bg-coral-deep"
              >
                {confirmTexts[confirm].action}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}