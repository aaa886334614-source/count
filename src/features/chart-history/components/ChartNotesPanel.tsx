import { useEffect, useState } from 'react'
import {
  createNote,
  deleteNote,
  listNotesForChart,
  updateNote,
  type ChartNoteRow,
} from '@/infrastructure/api/noteRepository'
import { useAuth } from '@/app/providers/AuthProvider'

export function ChartNotesPanel({ chartId }: { chartId: string }) {
  const { user, configured } = useAuth()
  const [notes, setNotes] = useState<ChartNoteRow[]>([])
  const [draft, setDraft] = useState('')
  const [palace, setPalace] = useState<string>('')
  const [err, setErr] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    if (!configured || !user) return
    void listNotesForChart(chartId)
      .then(setNotes)
      .catch((e) => setErr(e instanceof Error ? e.message : '載入備註失敗'))
  }, [chartId, configured, user])

  if (!configured || !user) {
    return (
      <p className="text-sm text-[var(--color-muted)]">登入後可管理雲端備註。</p>
    )
  }

  return (
    <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
      <h3 className="font-semibold">備註</h3>
      <ul className="mt-3 space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="rounded-lg border p-3 text-sm">
            {editId === n.id ? (
              <>
                <textarea
                  className="w-full rounded border p-2"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded border px-2 py-1"
                    onClick={() => setEditId(null)}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="rounded bg-[var(--color-wine)] px-2 py-1 text-white"
                    onClick={() =>
                      void updateNote(chartId, n.id, editText).then((u) => {
                        setNotes((prev) =>
                          prev.map((x) => (x.id === u.id ? u : x)),
                        )
                        setEditId(null)
                      })
                    }
                  >
                    儲存
                  </button>
                </div>
              </>
            ) : (
              <>
                {n.palace_number != null && (
                  <span className="text-xs text-[var(--color-muted)]">
                    宮位 {n.palace_number} ·{' '}
                  </span>
                )}
                <p className="whitespace-pre-wrap">{n.content}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <button
                    type="button"
                    className="text-[var(--color-wine)]"
                    onClick={() => {
                      setEditId(n.id)
                      setEditText(n.content)
                    }}
                  >
                    編輯
                  </button>
                  <button
                    type="button"
                    className="text-[var(--color-wine)]"
                    onClick={() =>
                      void deleteNote(chartId, n.id).then(() =>
                        setNotes((prev) => prev.filter((x) => x.id !== n.id)),
                      )
                    }
                  >
                    刪除
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <label className="mt-3 block text-sm">
        新增備註
        <textarea
          className="mt-1 w-full rounded-lg border px-3 py-2"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <label className="mt-2 block text-sm">
        宮位（選填，1–9）
        <input
          className="mt-1 w-24 rounded-lg border px-2 py-1"
          value={palace}
          onChange={(e) => setPalace(e.target.value.replace(/\D/g, '').slice(0, 1))}
        />
      </label>
      {err && <p className="mt-2 text-sm text-[var(--color-wine)]">{err}</p>}
      <button
        type="button"
        className="mt-3 rounded-lg bg-[var(--color-wine)] px-4 py-2 text-sm text-white"
        disabled={!draft.trim()}
        onClick={() =>
          void createNote(
            chartId,
            draft.trim(),
            palace ? Number(palace) : null,
          ).then((n) => {
            setNotes((prev) => [...prev, n])
            setDraft('')
            setPalace('')
          })
        }
      >
        新增備註
      </button>
    </section>
  )
}
