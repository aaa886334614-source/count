import type { TreatmentPlan } from '@/domain/qimen/treatments/types'
import type { EmptyVoidFieldState } from '@/domain/qimen/treatments/types'
import type { TimeChart, TimeChartInput } from '@/domain/qimen/time-chart/types'
import type { PalaceResult, StemChoice } from '@/types/qimen'
import type {
  HARM_RULES_VERSION,
  SNAPSHOT_SCHEMA_VERSION,
} from './versions'

export interface ChartSnapshotMeta {
  savedAt: string
  engineVersion: string
  harmRulesVersion: typeof HARM_RULES_VERSION | string
  snapshotSchemaVersion: typeof SNAPSHOT_SCHEMA_VERSION | number
}

export interface SinglePalaceSnapshot {
  kind: 'single_palace'
  meta: ChartSnapshotMeta
  rawInput: string
  normalizedCode: string
  heavenStemChoice?: StemChoice
  earthStemChoice?: StemChoice
  palaceResult: PalaceResult
  emptyVoidField: EmptyVoidFieldState
  oppositePalaceResult: PalaceResult | null
  oppositeInputCode: string
  treatmentPlan: TreatmentPlan | null
}

export interface TimeChartSnapshot {
  kind: 'time' | 'ke'
  meta: ChartSnapshotMeta
  input: TimeChartInput & {
    ianaTimezone: 'Asia/Taipei'
    dayBoundaryRule: '23:00'
  }
  rotation: number
  timeChart: TimeChart
  selectedPalace: number | null
  emptyVoidField: EmptyVoidFieldState
  /** 點選宮位當下的單宮分析快照（可選） */
  focus?: {
    palaceNumber: number
    palaceResult: PalaceResult
    oppositeResult: PalaceResult | null
    treatmentPlan: TreatmentPlan | null
  }
  termInfo?: {
    term: string
    ju: number
    season: string
    pillars: string[]
  }
}

export type ChartSnapshot = SinglePalaceSnapshot | TimeChartSnapshot

export function isSinglePalaceSnapshot(
  s: ChartSnapshot,
): s is SinglePalaceSnapshot {
  return s.kind === 'single_palace'
}

export function isTimeChartSnapshot(s: ChartSnapshot): s is TimeChartSnapshot {
  return s.kind === 'time' || s.kind === 'ke'
}
