import type { HistoryRecord } from '@/types/qimen'
import { saveChart } from '@/infrastructure/supabase/chartRepository'

/** 將 localStorage 單宮紀錄匯入雲端（每筆獨立 chart） */
export async function importLegacyHistory(records: HistoryRecord[]): Promise<number> {
  let count = 0
  for (const r of records) {
    await saveChart({
      chartType: 'single_palace',
      title: r.note?.slice(0, 80) || r.rawInput || '本機匯入',
      rawInput: { rawInput: r.rawInput },
      normalizedInput: { code: r.normalizedCode },
      calculationContext: {
        heavenStemChoice: r.heavenStemChoice,
        earthStemChoice: r.earthStemChoice,
        source: 'legacy-localStorage-v1',
      },
      chartSnapshot: r,
      engineVersion: 'single-palace-1.0',
    })
    count += 1
  }
  return count
}
