import type { DetectedHarm, HarmType } from '@/types/qimen'

export type EmptyVoidFieldState = 'unknown' | 'falseEmpty' | 'trueEmpty'

export interface PalaceContext {
  palaceNumber: number
  palaceName: string
  god: string
  door: string
  heavenStem: string | null
  earthStem: string | null
  harms: DetectedHarm[]
}

export interface OppositePalaceAnalysis {
  oppositePalace: number | null
  oppositeKnown: boolean
  usableForTreatment: boolean
  blockedReasons: string[]
  /** 對宮僅門迫／擊刑時，需先處理的前置四害 */
  prerequisiteHarms: DetectedHarm[]
  /** 白虎時可選符咒建議（不取代改回本宮原則） */
  talismanHint?: string
}

export type TreatmentStepStatus =
  | 'pending'
  | 'blocked'
  | 'needs-info'
  | 'needs-scene'

export interface TreatmentStep {
  id: string
  harmType: HarmType | 'scene-check' | 'cleanup'
  sourceHarmId?: string
  problemSource: string
  targetPalace: number
  targetPalaceName: string
  branch?: string
  animal?: string
  purpose: string
  prerequisites: string[]
  status: TreatmentStepStatus
  talismanNote?: string
}

export interface TreatmentPlan {
  steps: TreatmentStep[]
  unresolved: string[]
  oppositeAnalysis: OppositePalaceAnalysis
}
