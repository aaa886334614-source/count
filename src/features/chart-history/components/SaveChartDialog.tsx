import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import type { SaveChartInput } from '@/infrastructure/supabase/chartRepository'
import { saveChart } from '@/infrastructure/supabase/chartRepository'
import {
  clearPendingSave,
  readPendingSave,
  writePendingSave,
} from '@/features/chart-history/services/pendingSaveStorage'

export function SaveChartDialog(props: {
  open: boolean
  onClose: () => void
  defaultTitle: string
  buildSaveInput: () => SaveChartInput | null
  returnPath: string
  workspaceState?: unknown
  onSaved?: (chartId: string) => void
}) {
  const { user, configured, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState(props.defaultTitle)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (props.open) {
      setTitle(props.defaultTitle)
      setError(null)
      setSuccess(null)
    }
  }, [props.open, props.defaultTitle])

  useEffect(() => {
    if (!props.open || authLoading) return
    const pending = readPendingSave()
    if (!pending?.openSaveDialog || pending.returnPath !== props.returnPath) return
    if (user) {
      setTitle(pending.title)
      setNote(pending.note)
      clearPendingSave()
    }
  }, [props.open, props.returnPath, user, authLoading])

  async function handleConfirm() {
    const pending = readPendingSave()
    const built = props.buildSaveInput()
    const input = built ?? pending?.saveInput ?? null
    if (!input) {
      setError('目前沒有可儲存的盤面資料')
      return
    }
    const payload = { ...input, title: title.trim() }
    if (!configured) {
      setError('Supabase 尚未設定，無法雲端存盤')
      return
    }
    if (!user) {
      writePendingSave({
        returnPath: props.returnPath,
        title,
        note,
        saveInput: payload,
        workspace: props.workspaceState,
        openSaveDialog: true,
      })
      navigate('/account', {
        state: { message: '登入後將返回並繼續儲存盤面' },
      })
      return
    }
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const row = await saveChart(payload, note)
      clearPendingSave()
      setSuccess('已儲存至雲端')
      props.onSaved?.(row.id)
      setTimeout(() => {
        props.onClose()
        setSuccess(null)
      }, 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : '儲存失敗')
    } finally {
      setBusy(false)
    }
  }

  if (!props.open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-chart-title"
    >
      <div className="w-full max-w-md rounded-[16px] bg-white p-5 shadow-lg">
        <h2 id="save-chart-title" className="text-lg font-semibold">
          儲存盤面
        </h2>
        <label className="mt-3 block text-sm">
          盤面名稱
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </label>
        <label className="mt-3 block text-sm">
          備註（選填，可日後在「我的排盤」追加）
          <textarea
            className="mt-1 w-full rounded-lg border px-3 py-2"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={5000}
          />
        </label>
        {error && (
          <p className="mt-2 text-sm text-[var(--color-wine)]">{error}</p>
        )}
        {success && (
          <p className="mt-2 text-sm text-green-700">{success}</p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-lg border py-2"
            disabled={busy}
            onClick={props.onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-[var(--color-wine)] py-2 text-white disabled:opacity-50"
            disabled={busy || !title.trim()}
            onClick={() => void handleConfirm()}
          >
            {busy ? '儲存中…' : user ? '確認儲存' : '登入並儲存'}
          </button>
        </div>
      </div>
    </div>
  )
}
