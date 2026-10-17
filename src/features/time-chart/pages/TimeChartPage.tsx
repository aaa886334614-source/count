import { useEffect, useMemo, useState } from 'react'
import { SaveChartDialog } from '@/features/chart-history/components/SaveChartDialog'
import {
  buildTimeChartSaveInput,
  defaultTimeChartTitle,
} from '@/features/chart-history/services/buildSavePayload'
import { useResumePendingSave } from '@/features/chart-history/hooks/useResumePendingSave'
import type { PalaceResult } from '@/types/qimen'
import type { TimeChart, TimeChartMode } from '@/domain/qimen/time-chart/types'
import { calculateYinpanBrowser, rotateYinpanBrowser } from '@/domain/qimen/time-chart/engine/yinpanBridgeBrowser'
import { buildTimeChartFromRaw } from '@/domain/qimen/time-chart/buildTimeChart'
import { mapYinpanPalaceToResult } from '@/domain/qimen/time-chart/mapPalaceToSingle'
import { SinglePalaceCard } from '@/components/SinglePalaceCard'
import { HarmResult } from '@/components/HarmResult'
import { EnvironmentPlanPanel } from '@/features/environment-treatment/components/EnvironmentPlanPanel'
import {
  buildEnvironmentActions,
  palaceContextFromResult,
} from '@/domain/qimen/treatments/buildEnvironmentActions'
import type { EmptyVoidFieldState } from '@/domain/qimen/treatments/types'

const GRID_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6] as const

type WorkspaceState = {
  localDateTime: string
  mode: TimeChartMode
  rotation: number
  selectedPalace: number | null
  emptyVoidField: EmptyVoidFieldState
  chart: TimeChart
}

export function TimeChartPage() {
  const { pending, shouldOpenSave, consumeWorkspace, clearResume } =
    useResumePendingSave('/time-chart')
  const [saveOpen, setSaveOpen] = useState(false)
  const [localDateTime, setLocalDateTime] = useState('2026-10-17T15:26')
  const [mode, setMode] = useState<TimeChartMode>('shi')
  const [chart, setChart] = useState<TimeChart | null>(null)
  const [rotation, setRotation] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedPalace, setSelectedPalace] = useState<number | null>(null)
  const [emptyVoidField, setEmptyVoidField] =
    useState<EmptyVoidFieldState>('unknown')

  const selectedResult: PalaceResult | null = useMemo(() => {
    if (!chart || selectedPalace == null) return null
    const cell = chart.palaces[selectedPalace]
    if (!cell) return null
    return mapYinpanPalaceToResult(selectedPalace, cell, {
      rawInputLabel: chart.input.localDateTime,
    })
  }, [chart, selectedPalace])

  const oppositeResult = useMemo(() => {
    if (!chart || selectedPalace == null || !selectedResult) return null
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
    if (!opp) return null
    const cell = chart.palaces[opp]
    if (!cell) return null
    return mapYinpanPalaceToResult(opp, cell)
  }, [chart, selectedPalace, selectedResult])

  const plan = useMemo(() => {
    if (!selectedResult) return null
    return buildEnvironmentActions({
      self: palaceContextFromResult(selectedResult),
      opposite: oppositeResult
        ? palaceContextFromResult(oppositeResult)
        : null,
      emptyVoidField,
    })
  }, [selectedResult, oppositeResult, emptyVoidField])

  useEffect(() => {
    const ws = consumeWorkspace<WorkspaceState>()
    if (ws?.chart) {
      setLocalDateTime(ws.localDateTime)
      setMode(ws.mode)
      setChart(ws.chart)
      setRotation(ws.rotation)
      setSelectedPalace(ws.selectedPalace)
      setEmptyVoidField(ws.emptyVoidField)
      clearResume()
    }
  }, [pending])

  useEffect(() => {
    if (shouldOpenSave) setSaveOpen(true)
  }, [shouldOpenSave])

  const darkStems = chart?.raw?.darkStems as Record<number, string> | undefined

  function runChart(rot = 0) {
    try {
      let raw = calculateYinpanBrowser(localDateTime, mode) as Record<
        string,
        unknown
      >
      if (rot) raw = rotateYinpanBrowser(raw, rot)
      const built = buildTimeChartFromRaw(
        {
          localDateTime,
          timezone: 'Asia/Taipei',
          mode,
        },
        raw,
      )
      setChart(built)
      setRotation(rot)
      setError(null)
      setSelectedPalace(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '排盤失敗')
      setChart(null)
    }
  }

  return (
    <>
      <header className="card-fade space-y-2 px-0.5">
        <h1 className="text-[30px] font-extrabold leading-tight sm:text-[36px]">
          時刻排盤（陰盤 v0.4）
        </h1>
        <p className="text-[15px] text-[var(--color-muted)]">
          台灣時間、23:00 換日；點擊宮位查看單宮四害與環境方案。
        </p>
      </header>

      <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
        <label className="block text-sm">
          日期時間（台灣）
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={localDateTime}
            onChange={(e) => setLocalDateTime(e.target.value)}
          />
        </label>
        <div className="mt-3 flex gap-2">
          {(['shi', 'ke'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`rounded-lg px-3 py-1.5 ${mode === m ? 'bg-[var(--color-wine)] text-white' : 'border'}`}
              onClick={() => setMode(m)}
            >
              {m === 'shi' ? '時盤' : '刻盤'}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn-press mt-4 h-12 w-full rounded-[16px] bg-[var(--color-wine)] font-semibold text-white"
          onClick={() => runChart(0)}
        >
          自動起局
        </button>
        {chart && (
          <button
            type="button"
            className="mt-3 w-full rounded-[16px] border py-2 font-medium"
            onClick={() => setSaveOpen(true)}
          >
            儲存盤面
          </button>
        )}
        {chart && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm text-[var(--color-muted)]">
              {chart.metadata.season}
              {chart.metadata.ju}局 · {chart.metadata.term}
            </span>
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <button
                key={s}
                type="button"
                className="rounded border px-2 py-1 text-xs"
                onClick={() => runChart(s)}
              >
                轉{s}宮
              </button>
            ))}
            {rotation > 0 && (
              <button
                type="button"
                className="rounded border px-2 py-1 text-xs"
                onClick={() => runChart(0)}
              >
                回原盤
              </button>
            )}
          </div>
        )}
      </section>

      {error && (
        <p className="rounded-[16px] bg-[var(--color-wine-soft)] px-4 py-3 text-[var(--color-wine)]">
          {error}
        </p>
      )}

      {darkStems && (
        <details className="rounded-lg bg-white p-3 ring-1 ring-[var(--color-line)]">
          <summary className="cursor-pointer font-medium">暗干</summary>
          <pre className="mt-2 overflow-auto text-xs">
            {JSON.stringify(darkStems, null, 2)}
          </pre>
        </details>
      )}

      {chart && (
        <div className="grid grid-cols-3 gap-2">
          {GRID_ORDER.map((n) => {
            const cell = chart.palaces[n]
            const active = selectedPalace === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedPalace(n)}
                className={`min-h-[88px] rounded-xl p-2 text-left text-xs ring-1 ${active ? 'ring-[var(--color-wine)] bg-[var(--color-wine-soft)]' : 'ring-[var(--color-line)] bg-white'}`}
              >
                <div className="font-bold">{n === 5 ? '中' : n}</div>
                {cell && (
                  <>
                    <div>{cell.star}</div>
                    <div>{cell.door}</div>
                    <div className="truncate">{cell.deity}</div>
                  </>
                )}
              </button>
            )
          })}
        </div>
      )}

      {selectedResult && (
        <>
          <SinglePalaceCard result={selectedResult} />
          {selectedResult.isEmptyVoid && (
            <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
              <h3 className="font-semibold">旬空現場確認</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ['unknown', '尚未確認'],
                    ['falseEmpty', '假空'],
                    ['trueEmpty', '真空'],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    className={`rounded-lg px-3 py-1.5 text-sm ${emptyVoidField === v ? 'bg-[var(--color-wine)] text-white' : 'border'}`}
                    onClick={() => setEmptyVoidField(v)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          )}
          <HarmResult harms={selectedResult.harms} />
          {plan && <EnvironmentPlanPanel plan={plan} />}
        </>
      )}

      <SaveChartDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        defaultTitle={
          chart
            ? defaultTimeChartTitle(localDateTime, mode)
            : '時刻排盤'
        }
        returnPath="/time-chart"
        workspaceState={
          chart
            ? ({
                localDateTime,
                mode,
                rotation,
                selectedPalace,
                emptyVoidField,
                chart,
              } satisfies WorkspaceState)
            : undefined
        }
        buildSaveInput={() => {
          if (!chart) return null
          return buildTimeChartSaveInput({
            title: defaultTimeChartTitle(localDateTime, mode),
            chart,
            rotation,
            selectedPalace,
            emptyVoidField,
            focus:
              selectedResult && selectedPalace != null && plan
                ? {
                    palaceNumber: selectedPalace,
                    palaceResult: selectedResult,
                    oppositeResult: oppositeResult,
                    treatmentPlan: plan,
                  }
                : undefined,
          })
        }}
      />
    </>
  )
}
