import {
  DOOR_MAP,
  EMPTY_VOID_REMEDY,
  GOD_MAP,
  PALACE_DIGIT_MAP,
  STAR_MAP,
  STEM_DIGIT_MAP,
} from '../constants/mappings'
import type { PalaceResult, StemChoice } from '../types/qimen'
import { detectHarms } from './detectHarms'

export interface CalculateOptions {
  heavenStemChoice?: StemChoice
  earthStemChoice?: StemChoice
}

/** 依六位碼判斷天／地盤是否需要甲戊癸選擇 */
export function stemChoiceRequirements(code: string): {
  needsHeaven: boolean
  needsEarth: boolean
} {
  return {
    needsHeaven: code[4] === '1',
    needsEarth: code[5] === '1',
  }
}

/** 所需選擇皆完成後才可執行完整排盤 */
export function isReadyToCalculate(
  code: string,
  heavenStemChoice?: StemChoice,
  earthStemChoice?: StemChoice,
): boolean {
  const { needsHeaven, needsEarth } = stemChoiceRequirements(code)
  if (needsHeaven && !heavenStemChoice) return false
  if (needsEarth && !earthStemChoice) return false
  return true
}

function resolveStem(
  digit: string,
  choice?: StemChoice,
): {
  display: string | null
  needsChoice: boolean
  isEmpty: boolean
} {
  const mapped = STEM_DIGIT_MAP[digit]
  if (mapped === undefined) {
    throw new Error(`未知天干數字「${digit}」`)
  }
  if (mapped === null) {
    return { display: null, needsChoice: false, isEmpty: true }
  }
  if (mapped === 'CHOICE') {
    return {
      display: choice ?? null,
      needsChoice: !choice,
      isEmpty: false,
    }
  }
  return { display: mapped, needsChoice: false, isEmpty: false }
}

function lookup(
  map: Record<string, string>,
  digit: string,
  label: string,
): string {
  const value = map[digit]
  if (!value) {
    throw new Error(`${label}數字「${digit}」無對應，請檢查對照表。`)
  }
  return value
}

/** 第2位為0時，沿用第1位數字查八神表（僅一次，不遞迴） */
function resolveGod(palaceDigit: string, godDigit: string): string {
  if (godDigit !== '0') {
    return lookup(GOD_MAP, godDigit, '八神')
  }
  if (palaceDigit === '0') {
    throw new Error(
      '八神為0時需沿用宮位數字，但宮位原始數字同樣為0，無法取得八神。',
    )
  }
  return lookup(GOD_MAP, palaceDigit, '八神')
}

/**
 * 依六位碼計算單宮結果。
 * 呼叫端應先以 isReadyToCalculate 確認甲戊癸已選完。
 */
export function calculatePalace(
  rawInput: string,
  code: string,
  options: CalculateOptions = {},
): PalaceResult {
  if (!isReadyToCalculate(code, options.heavenStemChoice, options.earthStemChoice)) {
    throw new Error('甲／戊／癸尚未選擇完成，無法排盤。')
  }

  const [p, g, s, d, h, e] = code.split('')

  const palaceInfo = PALACE_DIGIT_MAP[p]
  if (!palaceInfo) {
    throw new Error(`宮位數字「${p}」無對應，請檢查對照表。`)
  }

  const palaceInputDigit = p
  const palaceNumber = palaceInfo.number
  const palaceName = palaceInfo.name
  const god = resolveGod(p, g)
  const star = lookup(STAR_MAP, s, '九星')
  const door = lookup(DOOR_MAP, d, '八門')

  const heaven = resolveStem(h, options.heavenStemChoice)
  const earth = resolveStem(e, options.earthStemChoice)
  const isEmptyVoid = heaven.isEmpty || earth.isEmpty

  const remedy = isEmptyVoid
    ? EMPTY_VOID_REMEDY[palaceNumber] ?? {
        branches: [],
        animals: [],
        note: '無補空資料',
      }
    : null

  const base: PalaceResult = {
    rawInput,
    normalizedCode: code,
    palaceInputDigit,
    palaceNumber,
    palaceName,
    god,
    star,
    door,
    heavenStemDigit: h,
    earthStemDigit: e,
    heavenStem: heaven.display,
    earthStem: earth.display,
    heavenStemChoice: options.heavenStemChoice,
    earthStemChoice: options.earthStemChoice,
    needsHeavenChoice: false,
    needsEarthChoice: false,
    isEmptyVoid,
    emptyVoidRemedy: remedy,
    harms: [],
  }

  base.harms = detectHarms(base)
  return base
}
