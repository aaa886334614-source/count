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
  return (
    <section className="card-fade rounded-[20px] bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-[26px] font-bold text-[var(--color-ink)]">
        是否儲存此排盤？
      </h2>

      {saved ? (
        <p className="mt-4 text-[18px] text-[var(--color-muted)]">
          已儲存至歷史紀錄
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheckedChange(e.target.checked)}
              className="h-5 w-5 accent-[var(--color-wine)]"
            />
            <span className="text-[18px] text-[var(--color-ink)]">
              儲存到歷史紀錄
            </span>
          </label>

          <div className="space-y-2">
            <label
              htmlFor="save-note"
              className="block text-[18px] font-medium text-[var(--color-ink)]"
            >
              備註（選填）
            </label>
            <textarea
              id="save-note"
              value={note}
              maxLength={MAX_NOTE}
              rows={3}
              placeholder="例如：老師上課案例、測試用、需要之後再次確認"
              onChange={(e) => onNoteChange(e.target.value.slice(0, MAX_NOTE))}
              className="w-full resize-none rounded-[16px] border-0 bg-[var(--color-surface)] px-4 py-3 text-[18px] text-[var(--color-ink)] outline-none ring-1 ring-[var(--color-line)] focus:ring-2 focus:ring-[var(--color-wine)]"
            />
            <p className="text-right text-[14px] text-[var(--color-muted)]">
              {note.length}/{MAX_NOTE}
            </p>
          </div>

          <button
            type="button"
            disabled={!checked}
            onClick={onSave}
            className="btn-press h-[56px] w-full rounded-[16px] bg-[var(--color-wine)] text-[20px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            儲存
          </button>
        </div>
      )}
    </section>
  )
}
