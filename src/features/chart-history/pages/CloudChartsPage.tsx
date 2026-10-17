import { useEffect, useState } from 'react'
import { listCharts, deleteChart } from '@/infrastructure/supabase/chartRepository'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { importLegacyHistory } from '@/features/chart-history/services/legacyImport'
import { HistoryList } from '@/components/HistoryList'
import { useHistory } from '@/hooks/useHistory'

export function CloudChartsPage() {
  const { user, configured } = useAuth()
  const local = useHistory()
  const [cloud, setCloud] = useState<
    Awaited<ReturnType<typeof listCharts>>
  >([])
  const [err, setErr] = useState<string | null>(null)
  const [importPreview, setImportPreview] = useState<number | null>(null)

  useEffect(() => {
    if (!configured || !user) return
    void listCharts()
      .then(setCloud)
      .catch((e) => setErr(e instanceof Error ? e.message : '載入失敗'))
  }, [configured, user])

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">我的排盤</h1>
      {!configured && (
        <p className="text-[var(--color-muted)]">
          雲端尚未設定。本機歷史仍可使用下方列表；登入後可匯入舊版紀錄。
        </p>
      )}
      {configured && !user && (
        <p className="text-[var(--color-wine)]">請至「會員」登入後查看雲端排盤。</p>
      )}
      {err && <p className="text-[var(--color-wine)]">{err}</p>}

      {configured && user && cloud.length > 0 && (
        <ul className="space-y-2">
          {cloud.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg bg-white p-3 ring-1 ring-[var(--color-line)]"
            >
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-[var(--color-muted)]">
                  {c.chart_type} · {c.updated_at}
                </div>
              </div>
              <button
                type="button"
                className="text-sm text-[var(--color-wine)]"
                onClick={() =>
                  void deleteChart(c.id).then(() =>
                    setCloud((prev) => prev.filter((x) => x.id !== c.id)),
                  )
                }
              >
                刪除
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
        <h2 className="font-semibold">本機歷史（consciousness-qimen-history-v1）</h2>
        <button
          type="button"
          className="mt-2 rounded-lg border px-3 py-1.5 text-sm"
          onClick={() => setImportPreview(local.records.length)}
        >
          預覽匯入舊版紀錄 ({local.records.length} 筆)
        </button>
        {importPreview != null && (
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {importPreview === 0
              ? '無可匯入資料。'
              : `可匯入 ${importPreview} 筆；${configured && user ? '確認後寫入雲端（避免重複需自行核對標題）。' : '請先登入 Supabase。'}`}
          </p>
        )}
        {configured && user && importPreview != null && importPreview > 0 && (
          <button
            type="button"
            className="mt-2 rounded-lg bg-[var(--color-wine)] px-3 py-1.5 text-sm text-white"
            onClick={() =>
              void importLegacyHistory(local.records).then((n) =>
                alert(`已匯入 ${n} 筆（程式實作；請至 Supabase 確認）`),
              )
            }
          >
            確認匯入
          </button>
        )}
      </div>

      <HistoryList
        records={local.records}
        onSelect={() => {}}
        onDelete={local.removeRecord}
        onClearAll={() => {}}
        onUpdateNote={(id, note) =>
          local.updateRecord(id, { note: note || undefined })
        }
        onToggleFavorite={local.toggleFavorite}
      />
    </section>
  )
}
