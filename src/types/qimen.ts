export type StemChoice = '甲' | '戊' | '癸'

export type HarmType = '門迫' | '擊刑' | '入墓' | '空亡'

export type HarmTargetType = 'door' | 'heavenStem' | 'earthStem' | 'star' | 'god'

export interface HarmRule {
  type: '門迫' | '擊刑' | '入墓'
  palace: number
  targetType: HarmTargetType
  targetValue: string
  remedyBranches?: string[]
  remedyAnimals?: string[]
  description?: string
}

export interface DetectedHarm {
  type: HarmType
  severity: number
  affectedItem: string
  remedyBranches: string[]
  remedyAnimals: string[]
  description: string
}

export interface EmptyVoidRemedy {
  branches: string[]
  animals: string[]
  note?: string
}

export interface PalaceResult {
  rawInput: string
  normalizedCode: string
  palaceNumber: number
  palaceName: string
  god: string
  star: string
  door: string
  heavenStemDigit: string
  earthStemDigit: string
  heavenStem: string | null
  earthStem: string | null
  heavenStemChoice?: StemChoice
  earthStemChoice?: StemChoice
  needsHeavenChoice: boolean
  needsEarthChoice: boolean
  isEmptyVoid: boolean
  emptyVoidRemedy: EmptyVoidRemedy | null
  harms: DetectedHarm[]
}

export interface HistoryRecord {
  id: string
  createdAt: string
  rawInput: string
  normalizedCode: string
  palaceNumber: number
  palaceName: string
  god: string
  star: string
  door: string
  heavenStem: string | null
  earthStem: string | null
  heavenStemChoice?: StemChoice
  earthStemChoice?: StemChoice
  isEmptyVoid: boolean
  emptyVoidRemedy: EmptyVoidRemedy | null
  harms: DetectedHarm[]
  note?: string
}

export interface ParseSuccess {
  ok: true
  code: string
  digits: [string, string, string, string, string, string]
}

export interface ParseFailure {
  ok: false
  error: string
}

export type ParseResult = ParseSuccess | ParseFailure
