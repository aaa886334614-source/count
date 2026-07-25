import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY,
} from '../constants/mappings'
import type { HistoryRecord, PalaceResult } from '../types/qimen'

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

export function loadHistory(): HistoryRecord[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isHistoryRecord)
      .map(normalizeRecord)
      .slice(0, MAX_HISTORY)
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

export function createHistoryRecord(
  result: PalaceResult,
  note?: string,
): HistoryRecord {
  const trimmed = note?.trim()
  const now = new Date().toISOString()
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    rawInput: result.rawInput,
    normalizedCode: result.normalizedCode,
    palaceInputDigit: result.palaceInputDigit,
    palaceNumber: result.palaceNumber,
    palaceName: result.palaceName,
    god: result.god,
    star: result.star,
    door: result.door,
    heavenStem: result.heavenStem,
    earthStem: result.earthStem,
    heavenStemChoice: result.heavenStemChoice,
    earthStemChoice: result.earthStemChoice,
    isEmptyVoid: result.isEmptyVoid,
    emptyVoidRemedy: result.emptyVoidRemedy,
    harms: result.harms,
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
