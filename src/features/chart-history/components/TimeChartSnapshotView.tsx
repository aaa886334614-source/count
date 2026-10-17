import type { TimeChartSnapshot } from '@/domain/qimen/shared/chartSnapshotTypes'
import { SinglePalaceCard } from '@/components/SinglePalaceCard'
import { HarmResult } from '@/components/HarmResult'
import { EnvironmentPlanPanel } from '@/features/environment-treatment/components/EnvironmentPlanPanel'

const GRID_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6] as const

export function TimeChartSnapshotView({
  snapshot,
  selectedPalace,
  onSelectPalace,
}: {
  snapshot: TimeChartSnapshot
  selectedPalace: number | null
  onSelectPalace: (n: number) => void
}) {
  const chart = snapshot.timeChart
  const raw = chart.raw as Record<string, unknown>
  const darkStems = raw.darkStems as Record<number, string> | undefined

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-muted)]">
        {snapshot.termInfo?.season}
        {snapshot.termInfo?.ju}局 · {snapshot.termInfo?.term} ·{' '}
        {snapshot.input.localDateTime}（{snapshot.input.ianaTimezone}）
      </p>
      <div className="grid grid-cols-3 gap-2">
        {GRID_ORDER.map((n) => {
          const cell = chart.palaces[n]
          const active = selectedPalace === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => onSelectPalace(n)}
              className={`min-h-[88px] rounded-xl p-2 text-left text-xs ring-1 ${active ? 'ring-[var(--color-wine)] bg-[var(--color-wine-soft)]' : 'ring-[var(--color-line)] bg-white'}`}
            >
              <div className="font-bold">{n === 5 ? '中' : n}</div>
              {cell && (
                <>
                  <div>{cell.star}</div>
                  <div>{cell.door}</div>
                  <div>{cell.deity}</div>
                  <div className="truncate">
                    {cell.tian}/{cell.di}
                  </div>
                </>
              )}
            </button>
          )
        })}
      </div>
      {darkStems && (
        <details className="rounded-lg bg-white p-3 ring-1 ring-[var(--color-line)]">
          <summary className="cursor-pointer font-medium">暗干</summary>
          <pre className="mt-2 overflow-auto text-xs">
            {JSON.stringify(darkStems, null, 2)}
          </pre>
        </details>
      )}
      {snapshot.focus && selectedPalace === snapshot.focus.palaceNumber && (
        <>
          <SinglePalaceCard result={snapshot.focus.palaceResult} />
          <HarmResult harms={snapshot.focus.palaceResult.harms} />
          {snapshot.focus.treatmentPlan && (
            <EnvironmentPlanPanel plan={snapshot.focus.treatmentPlan} />
          )}
        </>
      )}
    </div>
  )
}
