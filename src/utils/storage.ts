import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY,
} from '../constants/mappings'
import type { HistoryRecord, PalaceResult } from '../types/qimen'
import {
  calculatePalace,
  isReadyToCalculate,
} from './calculatePalace'
import { migrateHistoryRecords } from './recalculateHistory'

function isHistoryRecord(value: unknown): value is HistoryRecord {
  if (!value || typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.createdAt === 'string' &&
    typeof r.normalizedCode === 'string' &&
    typeof r.palaceNumber === 'number'
  )
}

function normalizeRecord(r: HistoryRecord): HistoryRecord {
  const digit =
    r.palaceInputDigit ||
    (typeof r.normalizedCode === 'string' && r.normalizedCode.length > 0
      ? r.normalizedCode[0]
      : String(r.palaceNumber))
  return {
    ...r,
    palaceInputDigit: digit,
    updatedAt: r.updatedAt ?? r.createdAt,
    favorite: Boolean(r.favorite),
    harms: Array.isArray(r.harms) ? r.harms : [],
  }
}

/**
 * 讀取歷史並以最新規則重算四害等欄位；若有變更則寫回 localStorage（遷移，不建重複筆）。
 */
export function loadHistory(): HistoryRecord[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const base = parsed
      .filter(isHistoryRecord)
      .map(normalizeRecord)
      .slice(0, MAX_HISTORY)

    const { records, changed } = migrateHistoryRecords(base)
    if (changed) {
      saveHistory(records)
    }
    return records
  } catch {
    return []
  }
}

export function saveHistory(records: HistoryRecord[]): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(records.slice(0, MAX_HISTORY)),
    )
    return true
  } catch {
    return false
  }
}

/**
 * 以最新版 calculatePalace（內含 detectHarms）建立紀錄，避免寫入過期 UI state。
 */
export function createHistoryRecord(
  result: PalaceResult,
  note?: string,
): HistoryRecord {
  const trimmed = note?.trim()
  const now = new Date().toISOString()

  let fresh = result
  if (
    isReadyToCalculate(
      result.normalizedCode,
      result.heavenStemChoice,
      result.earthStemChoice,
    )
  ) {
    try {
      fresh = calculatePalace(result.rawInput, result.normalizedCode, {
        heavenStemChoice: result.heavenStemChoice,
        earthStemChoice: result.earthStemChoice,
      })
    } catch {
      fresh = result
    }
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    rawInput: fresh.rawInput,
    normalizedCode: fresh.normalizedCode,
    palaceInputDigit: fresh.palaceInputDigit,
    palaceNumber: fresh.palaceNumber,
    palaceName: fresh.palaceName,
    god: fresh.god,
    star: fresh.star,
    door: fresh.door,
    heavenStem: fresh.heavenStem,
    earthStem: fresh.earthStem,
    heavenStemChoice: fresh.heavenStemChoice,
    earthStemChoice: fresh.earthStemChoice,
    isEmptyVoid: fresh.isEmptyVoid,
    emptyVoidRemedy: fresh.emptyVoidRemedy,
    harms: fresh.harms,
    note: trimmed ? trimmed.slice(0, 100) : undefined,
    favorite: false,
  }
}

export function prependHistory(
  list: HistoryRecord[],
  record: HistoryRecord,
): HistoryRecord[] {
  return [record, ...list].slice(0, MAX_HISTORY)
}
