import {
  DOOR_MAP,
  EMPTY_VOID_REMEDY,
  GOD_MAP,
  PALACE_MAP,
  STAR_MAP,
  STEM_DIGIT_MAP,
} from '../constants/mappings'
import type { PalaceResult, StemChoice } from '../types/qimen'
import { detectHarms } from './detectHarms'

export interface CalculateOptions {
  heavenStemChoice?: StemChoice
  earthStemChoice?: StemChoice
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

/**
 * 依六位碼計算單宮結果。digits 為字串陣列，逐位解析。
 */
export function calculatePalace(
  rawInput: string,
  code: string,
  options: CalculateOptions = {},
): PalaceResult {
  const [p, g, s, d, h, e] = code.split('')

  const palaceNumber = Number(p)
  const palaceName = lookup(PALACE_MAP, p, '宮位')
  const god = lookup(GOD_MAP, g, '八神')
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
    needsHeavenChoice: heaven.needsChoice,
    needsEarthChoice: earth.needsChoice,
    isEmptyVoid,
    emptyVoidRemedy: remedy,
    harms: [],
  }

  base.harms = detectHarms(base)
  return base
}
