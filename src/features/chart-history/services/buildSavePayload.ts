import type {
  ChartSnapshot,
  TimeChartSnapshot,
} from '@/domain/qimen/shared/chartSnapshotTypes'
import {
  HARM_RULES_VERSION,
  SINGLE_PALACE_ENGINE_VERSION,
  SNAPSHOT_SCHEMA_VERSION,
  TIME_ENGINE_VERSION,
} from '@/domain/qimen/shared/versions'
import type { TreatmentPlan } from '@/domain/qimen/treatments/types'
import type { EmptyVoidFieldState } from '@/domain/qimen/treatments/types'
import type { TimeChart } from '@/domain/qimen/time-chart/types'
import type { PalaceResult, StemChoice } from '@/types/qimen'
import type { ChartType, SaveChartInput } from '@/infrastructure/supabase/chartRepository'

function meta(engineVersion: string) {
  return {
    savedAt: new Date().toISOString(),
    engineVersion,
    harmRulesVersion: HARM_RULES_VERSION,
    snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
  }
}

export function buildSinglePalaceSaveInput(opts: {
  title: string
  rawInput: string
  normalizedCode: string
  heavenStemChoice?: StemChoice
  earthStemChoice?: StemChoice
  palaceResult: PalaceResult
  emptyVoidField: EmptyVoidFieldState
  oppositePalaceResult: PalaceResult | null
  oppositeInputCode: string
  treatmentPlan: TreatmentPlan | null
}): SaveChartInput {
  const snapshot: ChartSnapshot = {
    kind: 'single_palace',
    meta: meta(SINGLE_PALACE_ENGINE_VERSION),
    rawInput: opts.rawInput,
    normalizedCode: opts.normalizedCode,
    heavenStemChoice: opts.heavenStemChoice,
    earthStemChoice: opts.earthStemChoice,
    palaceResult: opts.palaceResult,
    emptyVoidField: opts.emptyVoidField,
    oppositePalaceResult: opts.oppositePalaceResult,
    oppositeInputCode: opts.oppositeInputCode,
    treatmentPlan: opts.treatmentPlan,
  }

  return {
    chartType: 'single_palace',
    title: opts.title,
    rawInput: { rawInput: opts.rawInput },
    normalizedInput: {
      code: opts.normalizedCode,
      heavenStemChoice: opts.heavenStemChoice,
      earthStemChoice: opts.earthStemChoice,
    },
    calculationContext: {
      emptyVoidField: opts.emptyVoidField,
      oppositeInputCode: opts.oppositeInputCode,
      harmRulesVersion: HARM_RULES_VERSION,
    },
    chartSnapshot: snapshot,
    engineVersion: SINGLE_PALACE_ENGINE_VERSION,
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
  }
}

export function buildTimeChartSaveInput(opts: {
  title: string
  chart: TimeChart
  rotation: number
  selectedPalace: number | null
  emptyVoidField: EmptyVoidFieldState
  focus?: TimeChartSnapshot['focus']
}): SaveChartInput {
  const chartType: ChartType = opts.chart.input.mode === 'ke' ? 'ke' : 'time'
  const snapshot: ChartSnapshot = {
    kind: chartType,
    meta: meta(TIME_ENGINE_VERSION),
    input: {
      ...opts.chart.input,
      ianaTimezone: 'Asia/Taipei',
      dayBoundaryRule: '23:00',
    },
    rotation: opts.rotation,
    timeChart: opts.chart,
    selectedPalace: opts.selectedPalace,
    emptyVoidField: opts.emptyVoidField,
    focus: opts.focus,
    termInfo: {
      term: opts.chart.metadata.term,
      ju: opts.chart.metadata.ju,
      season: opts.chart.metadata.season,
      pillars: opts.chart.metadata.pillars,
    },
  }

  return {
    chartType,
    title: opts.title,
    rawInput: {
      localDateTime: opts.chart.input.localDateTime,
      mode: opts.chart.input.mode,
      timezone: 'Asia/Taipei',
    },
    normalizedInput: {
      localDateTime: opts.chart.input.localDateTime,
      mode: opts.chart.input.mode,
    },
    calculationContext: {
      rotation: opts.rotation,
      dayBoundaryRule: '23:00',
      ianaTimezone: 'Asia/Taipei',
      term: opts.chart.metadata.term,
      ju: opts.chart.metadata.ju,
      harmRulesVersion: HARM_RULES_VERSION,
      emptyVoidField: opts.emptyVoidField,
      selectedPalace: opts.selectedPalace,
    },
    chartSnapshot: snapshot,
    engineVersion: TIME_ENGINE_VERSION,
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
  }
}

export function defaultTimeChartTitle(localDateTime: string, mode: string): string {
  const d = localDateTime.replace('T', ' ')
  return mode === 'ke' ? `${d} 刻盤` : `${d} 時盤`
}

export function defaultSinglePalaceTitle(code: string): string {
  return `單宮 ${code} · ${new Date().toLocaleString('zh-TW')}`
}
