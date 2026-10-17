import type { HistoryRecord } from '@/types/qimen'
import { saveChart } from '@/infrastructure/supabase/chartRepository'
import { buildSinglePalaceSaveInput } from './buildSavePayload'
import { calculatePalace } from '@/utils/calculatePalace'
import {
  buildEnvironmentActions,
  palaceContextFromResult,
} from '@/domain/qimen/treatments/buildEnvironmentActions'

const IMPORTED_KEY = 'qimen-legacy-imported-ids-v1'

function loadImportedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(IMPORTED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function markImported(ids: string[]) {
  const set = loadImportedIds()
  for (const id of ids) set.add(id)
  localStorage.setItem(IMPORTED_KEY, JSON.stringify([...set]))
}

/** 將 localStorage 單宮紀錄匯入雲端（每筆獨立 chart；已匯入 id 略過） */
export async function importLegacyHistory(records: HistoryRecord[]): Promise<number> {
  const done = loadImportedIds()
  let count = 0
  const newly: string[] = []
  for (const r of records) {
    if (done.has(r.id)) continue
    const result = calculatePalace(
      r.rawInput,
      r.normalizedCode,
      {
        heavenStemChoice: r.heavenStemChoice,
        earthStemChoice: r.earthStemChoice,
      },
    )
    const plan = buildEnvironmentActions({
      self: palaceContextFromResult(result),
      opposite: null,
      emptyVoidField: 'unknown',
    })
    const input = buildSinglePalaceSaveInput({
      title: r.note?.slice(0, 80) || r.rawInput || '本機匯入',
      rawInput: r.rawInput,
      normalizedCode: r.normalizedCode,
      heavenStemChoice: r.heavenStemChoice,
      earthStemChoice: r.earthStemChoice,
      palaceResult: result,
      emptyVoidField: 'unknown',
      oppositePalaceResult: null,
      oppositeInputCode: '',
      treatmentPlan: plan,
    })
    await saveChart(input, r.note)
    newly.push(r.id)
    count += 1
  }
  if (newly.length) markImported(newly)
  return count
}
