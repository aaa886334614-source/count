interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '確定',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="card-fade w-full max-w-sm rounded-[20px] bg-white p-6 shadow-[var(--shadow-card)]">
        <h3
          id="confirm-title"
          className="text-[28px] font-bold text-[var(--color-ink)]"
        >
          {title}
        </h3>
        <p className="mt-3 text-[18px] leading-relaxed text-[var(--color-muted)]">
          {message}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-press h-[60px] rounded-[16px] bg-[var(--color-surface)] text-[18px] font-medium text-[var(--color-ink)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-press h-[60px] rounded-[16px] bg-[var(--color-wine)] text-[18px] font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
