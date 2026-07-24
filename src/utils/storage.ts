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

export function loadHistory(): HistoryRecord[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isHistoryRecord).slice(0, MAX_HISTORY)
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
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    rawInput: result.rawInput,
    normalizedCode: result.normalizedCode,
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
  }
}

export function prependHistory(
  list: HistoryRecord[],
  record: HistoryRecord,
): HistoryRecord[] {
  return [record, ...list].slice(0, MAX_HISTORY)
}
