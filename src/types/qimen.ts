export type StemChoice = '甲' | '戊' | '癸'

export type HarmType = '門迫' | '擊刑' | '入墓' | '空無'

export type HarmTargetType =
  | 'door'
  | 'heavenStem'
  | 'earthStem'
  | 'emptyVoid'

export interface DetectedHarm {
  id: string
  type: HarmType
  severity: number
  palace: number
  palaceName: string
  targetType: HarmTargetType
  targetValue: string
  reason: string
  remedyAnimal?: string
  /** six-digit | xun-empty | time-plate */
  source?: string
}

export interface EmptyVoidRemedy {
  branches: string[]
  animals: string[]
  note?: string
}

export interface PalaceResult {
  rawInput: string
  normalizedCode: string
  /** 使用者輸入的第1位原始數字（0–9） */
  palaceInputDigit: string
  /** 標準宮號（0／5 → 2），用於四害、補空、九宮定位 */
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
  updatedAt: string
  rawInput: string
  normalizedCode: string
  palaceInputDigit: string
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
  favorite?: boolean
  /** 舊資料缺甲／戊／癸選擇，無法依最新規則重算時為 true */
  dataIncomplete?: boolean
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
