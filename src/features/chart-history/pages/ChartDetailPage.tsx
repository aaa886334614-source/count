import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import {
  getChartById,
  updateChartSnapshot,
  updateChartTitle,
  deleteChart,
  type ChartRow,
} from '@/infrastructure/supabase/chartRepository'
import { parseChartSnapshot } from '@/features/chart-history/services/parseSnapshot'
import {
  diffSnapshots,
  recalculateFromSnapshot,
} from '@/features/chart-history/services/recalculateSnapshot'
import {
  isSinglePalaceSnapshot,
  isTimeChartSnapshot,
  type ChartSnapshot,
} from '@/domain/qimen/shared/chartSnapshotTypes'
import { SinglePalaceCard } from '@/components/SinglePalaceCard'
import { HarmResult } from '@/components/HarmResult'
import { EnvironmentPlanPanel } from '@/features/environment-treatment/components/EnvironmentPlanPanel'
import { EmptyVoidInfo } from '@/components/EmptyVoidInfo'
import { TimeChartSnapshotView } from '@/features/chart-history/components/TimeChartSnapshotView'
import { ChartNotesPanel } from '@/features/chart-history/components/ChartNotesPanel'
import { mapYinpanPalaceToResult } from '@/domain/qimen/time-chart/mapPalaceToSingle'
import {
  buildEnvironmentActions,
  palaceContextFromResult,
} from '@/domain/qimen/treatments/buildEnvironmentActions'
import { exportChartsAsJson } from '@/features/chart-export/services/exportCharts'

export function ChartDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, configured, loading } = useAuth()
  const [row, setRow] = useState<ChartRow | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [titleEdit, setTitleEdit] = useState('')
  const [selectedPalace, setSelectedPalace] = useState<number | null>(null)
  const [recalcPreview, setRecalcPreview] = useState<
    ReturnType<typeof diffSnapshots> | null
  >(null)
  const [recalcCandidate, setRecalcCandidate] = useState<ChartSnapshot | null>(
    null,
  )

  const snapshot = useMemo(
    () => (row ? parseChartSnapshot(row.chart_snapshot) : null),
    [row],
  )

  useEffect(() => {
    if (!id || !configured || !user) return
    void getChartById(id)
      .then((r) => {
        if (!r) throw new Error('找不到盤面')
        setRow(r)
        setTitleEdit(r.title)
        const s = parseChartSnapshot(r.chart_snapshot)
        if (s && isTimeChartSnapshot(s)) {
          setSelectedPalace(s.selectedPalace)
        }
      })
      .catch((e) => setErr(e instanceof Error ? e.message : '載入失敗'))
  }, [id, configured, user])

  const timeFocus = useMemo(() => {
    if (!snapshot || !isTimeChartSnapshot(snapshot) || selectedPalace == null) {
      return null
    }
    const cell = snapshot.timeChart.palaces[selectedPalace]
    if (!cell) return null
    const pr = mapYinpanPalaceToResult(selectedPalace, cell)
    const oppMap: Record<number, number> = {
      1: 9,
      9: 1,
      2: 8,
      8: 2,
      3: 7,
      7: 3,
      4: 6,
      6: 4,
    }
    const opp = oppMap[selectedPalace]
    const oppCell = opp ? snapshot.timeChart.palaces[opp] : undefined
    const oppR = oppCell ? mapYinpanPalaceToResult(opp, oppCell) : null
    const plan = buildEnvironmentActions({
      self: palaceContextFromResult(pr),
      opposite: oppR ? palaceContextFromResult(oppR) : null,
      emptyVoidField: snapshot.emptyVoidField,
    })
    return { pr, plan }
  }, [snapshot, selectedPalace])

  if (loading) return <p>載入中…</p>
  if (!configured) {
    return (
      <p className="text-[var(--color-muted)]">
        請先設定 Supabase（docs/ENV.example.md）
      </p>
    )
  }
  if (!user) {
    return (
      <p className="text-[var(--color-wine)]">
        請<Link to="/account">登入</Link>後查看雲端盤面。
      </p>
    )
  }
  if (err) return <p className="text-[var(--color-wine)]">{err}</p>
  if (!row || !snapshot) return <p>載入盤面…</p>

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/charts" className="text-sm text-[var(--color-wine)]">
          ← 我的排盤
        </Link>
        <span className="text-xs text-[var(--color-muted)]">
          規則 {String(snapshot.meta.harmRulesVersion)} · 引擎{' '}
          {snapshot.meta.engineVersion}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2 font-medium"
          value={titleEdit}
          onChange={(e) => setTitleEdit(e.target.value)}
        />
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm"
          onClick={() =>
            void updateChartTitle(row.id, titleEdit.trim()).then(() =>
              setRow({ ...row, title: titleEdit.trim() }),
            )
          }
        >
          重新命名
        </button>
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm"
          onClick={() => exportChartsAsJson([row])}
        >
          匯出 JSON
        </button>
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm text-[var(--color-wine)]"
          onClick={() =>
            void deleteChart(row.id).then(() => navigate('/charts'))
          }
        >
          刪除
        </button>
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        建立 {row.created_at} · 更新 {row.updated_at}
      </p>

      {isSinglePalaceSnapshot(snapshot) && (
        <>
          <SinglePalaceCard result={snapshot.palaceResult} />
          <EmptyVoidInfo
            isEmptyVoid={snapshot.palaceResult.isEmptyVoid}
            remedy={snapshot.palaceResult.emptyVoidRemedy}
          />
          <p className="text-sm">現場空無：{snapshot.emptyVoidField}</p>
          <HarmResult harms={snapshot.palaceResult.harms} />
          {snapshot.treatmentPlan && (
            <EnvironmentPlanPanel plan={snapshot.treatmentPlan} />
          )}
        </>
      )}

      {isTimeChartSnapshot(snapshot) && (
        <TimeChartSnapshotView
          snapshot={{
            ...snapshot,
            focus: timeFocus
              ? {
                  palaceNumber: selectedPalace!,
                  palaceResult: timeFocus.pr,
                  oppositeResult: null,
                  treatmentPlan: timeFocus.plan,
                }
              : snapshot.focus,
          }}
          selectedPalace={selectedPalace}
          onSelectPalace={setSelectedPalace}
        />
      )}

      <section className="rounded-[16px] border border-dashed p-4">
        <h3 className="font-semibold">規則版本</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          預設顯示儲存當下的快照，不會自動覆蓋。
        </p>
        <button
          type="button"
          className="mt-2 rounded-lg border px-3 py-1.5 text-sm"
          onClick={() => {
            const next = recalculateFromSnapshot(snapshot)
            setRecalcCandidate(next)
            setRecalcPreview(diffSnapshots(snapshot, next))
          }}
        >
          使用最新規則重新計算（預覽）
        </button>
        {recalcPreview && (
          <div className="mt-3 text-sm">
            {recalcPreview.length === 0 ? (
              <p>與目前快照無明顯差異（簡要比對）。</p>
            ) : (
              <ul className="list-disc pl-5">
                {recalcPreview.map((d) => (
                  <li key={d.path}>
                    {d.path}: {d.before} → {d.after}
                  </li>
                ))}
              </ul>
            )}
            {recalcCandidate && (
              <button
                type="button"
                className="mt-2 rounded-lg bg-[var(--color-wine)] px-3 py-1.5 text-white"
                onClick={() =>
                  void updateChartSnapshot(row.id, {
                    chart_snapshot: recalcCandidate,
                    engine_version: recalcCandidate.meta.engineVersion,
                  }).then(() => {
                    setRow({
                      ...row,
                      chart_snapshot: recalcCandidate,
                    })
                    setRecalcPreview(null)
                    setRecalcCandidate(null)
                  })
                }
              >
                確認更新保存的快照
              </button>
            )}
          </div>
        )}
      </section>

      <ChartNotesPanel chartId={row.id} />
    </section>
  )
}
