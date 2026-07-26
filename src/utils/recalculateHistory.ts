import type { DetectedHarm, HistoryRecord, StemChoice } from '../types/qimen'
import { calculatePalace, isReadyToCalculate } from './calculatePalace'
import { formatRemedyAnimal } from './formatRemedyAnimal'

const STEM_CHOICES: readonly StemChoice[] = ['甲', '戊', '癸']

function isStemChoice(v: unknown): v is StemChoice {
  return typeof v === 'string' && (STEM_CHOICES as readonly string[]).includes(v)
}

/** 比對用快照：忽略 harm id／時間戳 */
function comparablePayload(record: HistoryRecord) {
  return {
    normalizedCode: record.normalizedCode,
    palaceInputDigit: record.palaceInputDigit,
    palaceNumber: record.palaceNumber,
    palaceName: record.palaceName,
    god: record.god,
    star: record.star,
    door: record.door,
    heavenStem: record.heavenStem,
    earthStem: record.earthStem,
    isEmptyVoid: record.isEmptyVoid,
    emptyVoidRemedy: record.emptyVoidRemedy,
    harms: (record.harms ?? []).map((h) => ({
      type: h.type,
      severity: h.severity,
      palace: h.palace,
      palaceName: h.palaceName,
      targetType: h.targetType,
      targetValue: h.targetValue,
      reason: h.reason,
      remedyAnimal: h.remedyAnimal ?? null,
    })),
  }
}

function payloadsEqual(a: HistoryRecord, b: HistoryRecord): boolean {
  return (
    JSON.stringify(comparablePayload(a)) ===
    JSON.stringify(comparablePayload(b))
  )
}

/**
 * 依目前最新規則重算一筆歷史紀錄。
 * 保留 id／createdAt／note／favorite；缺甲戊癸選擇時不崩潰，標示不完整。
 */
export function recalculateHistoryRecord(
  record: HistoryRecord,
): HistoryRecord {
  const code =
    typeof record.normalizedCode === 'string' ? record.normalizedCode : ''
  if (code.length !== 6) {
    return { ...record, dataIncomplete: true }
  }

  const heavenStemChoice = isStemChoice(record.heavenStemChoice)
    ? record.heavenStemChoice
    : undefined
  const earthStemChoice = isStemChoice(record.earthStemChoice)
    ? record.earthStemChoice
    : undefined

  if (!isReadyToCalculate(code, heavenStemChoice, earthStemChoice)) {
    return {
      ...record,
      heavenStemChoice,
      earthStemChoice,
      dataIncomplete: true,
    }
  }

  try {
    const result = calculatePalace(record.rawInput || code, code, {
      heavenStemChoice,
      earthStemChoice,
    })

    const next: HistoryRecord = {
      ...record,
      rawInput: record.rawInput || result.rawInput,
      normalizedCode: result.normalizedCode,
      palaceInputDigit: result.palaceInputDigit,
      palaceNumber: result.palaceNumber,
      palaceName: result.palaceName,
      god: result.god,
      star: result.star,
      door: result.door,
      heavenStem: result.heavenStem,
      earthStem: result.earthStem,
      heavenStemChoice: result.heavenStemChoice ?? heavenStemChoice,
      earthStemChoice: result.earthStemChoice ?? earthStemChoice,
      isEmptyVoid: result.isEmptyVoid,
      emptyVoidRemedy: result.emptyVoidRemedy,
      harms: result.harms,
      // 保留
      id: record.id,
      createdAt: record.createdAt,
      note: record.note,
      favorite: record.favorite,
      updatedAt: record.updatedAt,
    }
    delete next.dataIncomplete

    if (!payloadsEqual(record, next)) {
      next.updatedAt = new Date().toISOString()
    }

    return next
  } catch {
    return { ...record, dataIncomplete: true }
  }
}

/** 批次遷移；不新增重複 id */
export function migrateHistoryRecords(
  records: HistoryRecord[],
): { records: HistoryRecord[]; changed: boolean } {
  let changed = false
  const next = records.map((r) => {
    const updated = recalculateHistoryRecord(r)
    const incompleteChanged =
      Boolean(r.dataIncomplete) !== Boolean(updated.dataIncomplete)
    if (!payloadsEqual(r, updated) || incompleteChanged) {
      changed = true
    }
    return updated
  })
  return { records: next, changed }
}

/** 歷史卡四害摘要：門迫：驚門 */
export function formatHistoryHarmSummary(harms: DetectedHarm[]): string {
  if (!harms.length) return '無四害'
  return harms
    .map((h) =>
      h.targetValue ? `${h.type}：${h.targetValue}` : h.type,
    )
    .join('、')
}

/** 歷史卡化解摘要：辰（龍） */
export function formatHistoryRemedySummary(harms: DetectedHarm[]): string {
  const labels = harms
    .map((h) => h.remedyAnimal)
    .filter((a): a is string => Boolean(a))
    .map((a) => formatRemedyAnimal(a))
  // 去重但保序
  const unique: string[] = []
  for (const label of labels) {
    if (!unique.includes(label)) unique.push(label)
  }
  return unique.length > 0 ? unique.join('、') : '—'
}
