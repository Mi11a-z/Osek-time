"use client";

import { useEffect, useState } from "react";
import { addReport, reportReasons, type NewReport, type ReportReason } from "../../moderation";

type ReportDialogProps = {
  post: Pick<NewReport, "postId" | "postText" | "postAuthor" | "authorId">;
  onClose: () => void;
};

export function ReportDialog({ post, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const needsDetails = reason === "other";
  const canSend = reason !== null && (!needsDetails || details.trim().length > 0);

  function submit() {
    if (!reason || !canSend) return;
    addReport({ ...post, reason, details: details.trim() });
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0_0_0/0.4)] p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Пожаловаться на публикацию"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col rounded-[var(--radii-panel)] bg-surface p-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <>
            <h3 className="m-0 font-display text-lg [font-weight:var(--font-weights-heavy)]">Спасибо за жалобу</h3>
            <p className="mt-2 text-muted">Модераторы проверят публикацию и примут решение.</p>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={onClose} className="cursor-pointer rounded-[var(--radii-pill)] border-0 bg-coral px-5 py-2.5 [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] hover:bg-coral-deep">
                Закрыть
              </button>
            </div>
          </>
        ) : (
          <>
            {/* заголовок всегда виден */}
            <div className="shrink-0">
              <h3 className="m-0 font-display text-lg [font-weight:var(--font-weights-heavy)]">Пожаловаться на публикацию</h3>
              <p className="mt-1 text-muted [font-size:var(--font-sizes-meta)]">Выберите, что не так с этим постом.</p>
            </div>

            {/* прокручивается только список */}
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-2" role="radiogroup" aria-label="Причина жалобы">
                {reportReasons.map((item) => (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-solid px-3.5 py-2.5 [border-width:var(--borders-thin)] ${reason === item.id ? "border-coral bg-peach" : "border-line"}`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      checked={reason === item.id}
                      onChange={() => setReason(item.id)}
                      className="mt-1 accent-[var(--coral)]"
                    />
                    <span>
                      <span className="block [font-weight:var(--font-weights-bold)]">{item.label}</span>
                      <span className="block text-muted [font-size:var(--font-sizes-meta)]">{item.hint}</span>
                    </span>
                  </label>
                ))}
              </div>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder={needsDetails ? "Опишите проблему (обязательно)" : "Дополнительные детали (необязательно)"}
                aria-label="Детали жалобы"
                className="mt-3 w-full resize-none rounded-xl border-solid border-line bg-transparent px-3.5 py-2.5 [border-width:var(--borders-thin)] focus:border-coral focus:outline-none"
              />
            </div>

            {/* кнопки всегда видны */}
            <div className="mt-4 flex shrink-0 justify-end gap-2">
              <button type="button" onClick={onClose} className="cursor-pointer rounded-[var(--radii-pill)] border-solid border-line bg-transparent px-5 py-2.5 [border-width:var(--borders-thin)]">
                Отмена
              </button>
              <button
                type="button"
                disabled={!canSend}
                onClick={submit}
                className="cursor-pointer rounded-[var(--radii-pill)] border-0 bg-coral px-5 py-2.5 [color:var(--colors-white)] [font-weight:var(--font-weights-bold)] hover:bg-coral-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                Отправить
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}