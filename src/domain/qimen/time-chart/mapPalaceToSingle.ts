import { PALACE_NAME } from '@/constants/harmRules'
import { detectHarms } from '@/domain/qimen/harms/detectHarms'
import { HARM_SEVERITY } from '@/constants/harmRules'
import type { DetectedHarm, PalaceResult } from '@/types/qimen'
import type { YinpanPalaceCell } from './types'

const DEITY_NORMALIZE: Record<string, string> = {
  騰蛇: '螣蛇',
}

function primaryStem(stemField: string): string | null {
  const s = (stemField ?? '').trim()
  if (!s) return null
  return s[0] ?? null
}

function xunEmptyHarm(palaceNumber: number, palaceName: string): DetectedHarm {
  return {
    id: `xun-empty-${palaceNumber}`,
    type: '空無',
    severity: HARM_SEVERITY.空無,
    palace: palaceNumber,
    palaceName,
    targetType: 'emptyVoid',
    targetValue: '旬空',
    reason: '時刻盤旬空（不同於六位碼 0 空無）',
    source: 'xun-empty',
  }
}

/** 九宮點擊 → 單宮分析用 PalaceResult（不經六位碼） */
export function mapYinpanPalaceToResult(
  palaceNumber: number,
  cell: YinpanPalaceCell,
  opts?: { rawInputLabel?: string },
): PalaceResult {
  const palaceName = PALACE_NAME[palaceNumber] ?? String(palaceNumber)
  const god = DEITY_NORMALIZE[cell.deity] ?? cell.deity
  const heavenStem = primaryStem(cell.tian)
  const earthStem = primaryStem(cell.di)
  const xunEmpty = cell.flags?.includes('空亡') ?? false

  const base: PalaceResult = {
    rawInput: opts?.rawInputLabel ?? `time-chart:${palaceNumber}`,
    normalizedCode: '',
    palaceInputDigit: String(palaceNumber),
    palaceNumber,
    palaceName,
    god,
    star: cell.star,
    door: cell.door,
    heavenStemDigit: '',
    earthStemDigit: '',
    heavenStem,
    earthStem,
    needsHeavenChoice: false,
    needsEarthChoice: false,
    isEmptyVoid: xunEmpty,
    emptyVoidRemedy: null,
    harms: [],
  }

  const harms = detectHarms({ ...base, isEmptyVoid: false }).filter(
    (h) => h.type !== '空無',
  )

  if (xunEmpty) {
    harms.push(xunEmptyHarm(palaceNumber, palaceName))
  }

  base.harms = harms.sort((a, b) => b.severity - a.severity)
  base.isEmptyVoid = xunEmpty
  return base
}
