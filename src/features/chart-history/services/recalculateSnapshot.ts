import type { ChartSnapshot } from '@/domain/qimen/shared/chartSnapshotTypes'
import {
  isSinglePalaceSnapshot,
  isTimeChartSnapshot,
} from '@/domain/qimen/shared/chartSnapshotTypes'
import { HARM_RULES_VERSION } from '@/domain/qimen/shared/versions'
import {
  buildEnvironmentActions,
  palaceContextFromResult,
} from '@/domain/qimen/treatments/buildEnvironmentActions'
import { calculatePalace } from '@/utils/calculatePalace'
import { calculateYinpanBrowser, rotateYinpanBrowser } from '@/domain/qimen/time-chart/engine/yinpanBridgeBrowser'
import { buildTimeChartFromRaw } from '@/domain/qimen/time-chart/buildTimeChart'
import { mapYinpanPalaceToResult } from '@/domain/qimen/time-chart/mapPalaceToSingle'

export interface SnapshotDiffLine {
  path: string
  before: string
  after: string
}

/** 使用最新 domain 規則重算；不修改原 snapshot */
export function recalculateFromSnapshot(snapshot: ChartSnapshot): ChartSnapshot {
  if (isSinglePalaceSnapshot(snapshot)) {
    const r = calculatePalace(
      snapshot.rawInput,
      snapshot.normalizedCode,
      {
        heavenStemChoice: snapshot.heavenStemChoice,
        earthStemChoice: snapshot.earthStemChoice,
      },
    )
    let opposite = snapshot.oppositePalaceResult
    if (snapshot.oppositeInputCode) {
      try {
        opposite = calculatePalace(
          snapshot.oppositeInputCode,
          snapshot.oppositeInputCode,
          {
            heavenStemChoice: undefined,
            earthStemChoice: undefined,
          },
        )
      } catch {
        opposite = snapshot.oppositePalaceResult
      }
    }

    const plan = buildEnvironmentActions({
      self: palaceContextFromResult(r),
      opposite: opposite ? palaceContextFromResult(opposite) : null,
      emptyVoidField: snapshot.emptyVoidField,
    })

    return {
      ...snapshot,
      meta: {
        ...snapshot.meta,
        savedAt: new Date().toISOString(),
        harmRulesVersion: HARM_RULES_VERSION,
      },
      palaceResult: r,
      oppositePalaceResult: opposite,
      treatmentPlan: plan,
    }
  }

  if (isTimeChartSnapshot(snapshot)) {
    let raw = calculateYinpanBrowser(
      snapshot.input.localDateTime,
      snapshot.input.mode,
    ) as Record<string, unknown>
    if (snapshot.rotation) raw = rotateYinpanBrowser(raw, snapshot.rotation)
    const chart = buildTimeChartFromRaw(snapshot.input, raw)
    let focus = snapshot.focus
    if (snapshot.selectedPalace != null) {
      const cell = chart.palaces[snapshot.selectedPalace]
      if (cell) {
        const pr = mapYinpanPalaceToResult(snapshot.selectedPalace, cell)
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
        const opp = oppMap[snapshot.selectedPalace]
        const oppCell = opp ? chart.palaces[opp] : undefined
        const oppR = oppCell ? mapYinpanPalaceToResult(opp, oppCell) : null
        const plan = buildEnvironmentActions({
          self: palaceContextFromResult(pr),
          opposite: oppR ? palaceContextFromResult(oppR) : null,
          emptyVoidField: snapshot.emptyVoidField,
        })
        focus = {
          palaceNumber: snapshot.selectedPalace,
          palaceResult: pr,
          oppositeResult: oppR,
          treatmentPlan: plan,
        }
      }
    }
    return {
      ...snapshot,
      meta: {
        ...snapshot.meta,
        savedAt: new Date().toISOString(),
        harmRulesVersion: HARM_RULES_VERSION,
      },
      timeChart: chart,
      focus,
      termInfo: {
        term: chart.metadata.term,
        ju: chart.metadata.ju,
        season: chart.metadata.season,
        pillars: chart.metadata.pillars,
      },
    }
  }

  return snapshot
}

export function diffSnapshots(
  before: ChartSnapshot,
  after: ChartSnapshot,
): SnapshotDiffLine[] {
  const lines: SnapshotDiffLine[] = []
  if (before.meta.harmRulesVersion !== after.meta.harmRulesVersion) {
    lines.push({
      path: 'meta.harmRulesVersion',
      before: String(before.meta.harmRulesVersion),
      after: String(after.meta.harmRulesVersion),
    })
  }
  if (isSinglePalaceSnapshot(before) && isSinglePalaceSnapshot(after)) {
    if (before.palaceResult.harms.length !== after.palaceResult.harms.length) {
      lines.push({
        path: 'palaceResult.harms.length',
        before: String(before.palaceResult.harms.length),
        after: String(after.palaceResult.harms.length),
      })
    }
  }
  if (isTimeChartSnapshot(before) && isTimeChartSnapshot(after)) {
    if (before.timeChart.metadata.ju !== after.timeChart.metadata.ju) {
      lines.push({
        path: 'timeChart.metadata.ju',
        before: String(before.timeChart.metadata.ju),
        after: String(after.timeChart.metadata.ju),
      })
    }
  }
  return lines
}
