import { Check } from 'lucide-react'

interface SavePromptProps {
  checked: boolean
  note: string
  saved: boolean
  onCheckedChange: (checked: boolean) => void
  onNoteChange: (note: string) => void
  onSave: () => void
}

const MAX_NOTE = 100

export function SavePrompt({
  checked,
  note,
  saved,
  onCheckedChange,
  onNoteChange,
  onSave,
}: SavePromptProps) {
  if (saved) {
    return (
      <div className="card-fade flex items-center gap-2.5 rounded-[14px] bg-[var(--color-wine-soft)] px-4 py-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-wine)] text-white">
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <p className="text-[15px] font-medium text-[var(--color-wine)]">
          已儲存至歷史紀錄
        </p>
      </div>
    )
  }

  return (
    <section className="card-fade rounded-[20px] bg-white px-5 py-5 shadow-[var(--shadow-card)]">
      <h2 className="text-[22px] font-extrabold text-[var(--color-ink)] sm:text-[24px]">
        是否儲存此排盤？
      </h2>

      <label className="mt-3 flex min-h-[48px] cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="h-5 w-5 accent-[var(--color-wine)]"
        />
        <span className="text-[16px] text-[var(--color-ink)]">
          儲存到歷史紀錄
        </span>
      </label>

      <div className="mt-3">
        <label
          htmlFor="save-note"
          className="mb-1.5 block text-[14px] font-medium text-[var(--color-muted)]"
        >
          備註（選填）
        </label>
        <textarea
          id="save-note"
          value={note}
          maxLength={MAX_NOTE}
          rows={2}
          placeholder="例如：老師上課案例、測試用"
          onChange={(e) => onNoteChange(e.target.value.slice(0, MAX_NOTE))}
          className="w-full resize-none rounded-[14px] border-0 bg-[var(--color-surface)] px-3.5 py-2.5 text-[16px] text-[var(--color-ink)] outline-none ring-1 ring-[var(--color-line)] focus:ring-2 focus:ring-[var(--color-wine)]"
        />
        <p className="mt-1 text-right text-[12px] text-[var(--color-muted)]">
          {note.length}/{MAX_NOTE}
        </p>
      </div>

      <button
        type="button"
        disabled={!checked}
        onClick={onSave}
        className="btn-press mt-2 h-[52px] w-full rounded-[16px] bg-[var(--color-wine)] text-[18px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        儲存
      </button>
    </section>
  )
}
