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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-sm rounded border border-neutral-400 bg-white p-4 shadow-lg">
        <h3 id="confirm-title" className="text-base font-semibold text-black">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">
          {message}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded border border-neutral-400 bg-white text-sm text-black"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] rounded border border-red-900 bg-red-900 text-sm text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
