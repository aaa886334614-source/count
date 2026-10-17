import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteChart,
  listCharts,
  type ChartRow,
} from '@/infrastructure/supabase/chartRepository'
import { listNotesForChart } from '@/infrastructure/supabase/noteRepository'
import { useAuth } from '@/app/providers/AuthProvider'
import { importLegacyHistory } from '@/features/chart-history/services/legacyImport'
import { HistoryList } from '@/components/HistoryList'
import { useHistory } from '@/hooks/useHistory'
import { exportChartsAsJson, parseImportedChartsJson } from '@/features/chart-export/services/exportCharts'

const TYPE_LABEL: Record<string, string> = {
  time: '時盤',
  ke: '刻盤',
  single_palace: '六位數單宮',
}

export function CloudChartsPage() {
  const { user, configured, loading } = useAuth()
  const local = useHistory()
  const [cloud, setCloud] = useState<ChartRow[]>([])
  const [noteSummary, setNoteSummary] = useState<Record<string, string>>({})
  const [err, setErr] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sort, setSort] = useState<'updated' | 'created'>('updated')
  const [importPreview, setImportPreview] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!configured || !user) return
    void listCharts()
      .then(async (rows) => {
        setCloud(rows)
        const summary: Record<string, string> = {}
        await Promise.all(
          rows.slice(0, 50).map(async (r) => {
            const notes = await listNotesForChart(r.id)
            summary[r.id] =
              notes[notes.length - 1]?.content.slice(0, 60) ?? '—'
          }),
        )
        setNoteSummary(summary)
      })
      .catch((e) => setErr(e instanceof Error ? e.message : '載入失敗'))
  }, [configured, user])

  const filtered = useMemo(() => {
    let rows = [...cloud]
    if (typeFilter !== 'all') {
      rows = rows.filter((r) => r.chart_type === typeFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((r) => r.title.toLowerCase().includes(q))
    }
    rows.sort((a, b) => {
      const ka = sort === 'updated' ? a.updated_at : a.created_at
      const kb = sort === 'updated' ? b.updated_at : b.created_at
      return kb.localeCompare(ka)
    })
    return rows
  }, [cloud, search, typeFilter, sort])

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">我的排盤</h1>

      {!configured && (
        <p className="text-[var(--color-muted)]">
          雲端尚未設定（docs/ENV.example.md）。下方仍可使用本機歷史。
        </p>
      )}
      {configured && !loading && !user && (
        <p className="text-[var(--color-wine)]">
          請<Link to="/account">登入</Link>以查看雲端排盤。
        </p>
      )}
      {err && <p className="text-[var(--color-wine)]">{err}</p>}

      {configured && user && (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              className="min-w-[200px] flex-1 rounded-lg border px-3 py-2 text-sm"
              placeholder="搜尋盤面名稱"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-lg border px-2 py-2 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">全部類型</option>
              <option value="time">時盤</option>
              <option value="ke">刻盤</option>
              <option value="single_palace">六位數單宮</option>
            </select>
            <select
              className="rounded-lg border px-2 py-2 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'updated' | 'created')}
            >
              <option value="updated">依最後修改</option>
              <option value="created">依建立時間</option>
            </select>
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm"
              disabled={!cloud.length}
              onClick={() => exportChartsAsJson(cloud)}
            >
              匯出全部 JSON
            </button>
            <label className="rounded-lg border px-3 py-2 text-sm cursor-pointer">
              匯入 JSON
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  void f.text().then((t) => {
                    try {
                      parseImportedChartsJson(t)
                      alert('JSON 格式有效；寫入雲端請使用「確認匯入舊版紀錄」或另存新盤。')
                    } catch (ex) {
                      alert(ex instanceof Error ? ex.message : '無效 JSON')
                    }
                  })
                }}
              />
            </label>
          </div>

          <ul className="space-y-2">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="rounded-lg bg-white p-3 ring-1 ring-[var(--color-line)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`/charts/${c.id}`}
                      className="font-medium text-[var(--color-wine)]"
                    >
                      {c.title}
                    </Link>
                    <div className="text-xs text-[var(--color-muted)]">
                      {TYPE_LABEL[c.chart_type] ?? c.chart_type} · 建立{' '}
                      {new Date(c.created_at).toLocaleString('zh-TW')} · 更新{' '}
                      {new Date(c.updated_at).toLocaleString('zh-TW')}
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-muted)]">
                      備註摘要：{noteSummary[c.id] ?? '…'}
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
                </div>
              </li>
            ))}
            {!filtered.length && (
              <p className="text-sm text-[var(--color-muted)]">尚無雲端排盤。</p>
            )}
          </ul>
        </>
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
              : `可匯入 ${importPreview} 筆（已匯入過的 id 會略過）。`}
          </p>
        )}
        {configured && user && importPreview != null && importPreview > 0 && (
          <button
            type="button"
            disabled={busy}
            className="mt-2 rounded-lg bg-[var(--color-wine)] px-3 py-1.5 text-sm text-white disabled:opacity-50"
            onClick={() => {
              setBusy(true)
              void importLegacyHistory(local.records)
                .then((n) => {
                  alert(`已匯入 ${n} 筆至雲端`)
                  return listCharts()
                })
                .then(setCloud)
                .finally(() => setBusy(false))
            }}
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
