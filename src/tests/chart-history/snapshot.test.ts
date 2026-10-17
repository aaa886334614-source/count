import { describe, expect, it } from 'vitest'
import { calculatePalace } from '@/utils/calculatePalace'
import { buildSinglePalaceSaveInput } from '@/features/chart-history/services/buildSavePayload'
import { parseChartSnapshot } from '@/features/chart-history/services/parseSnapshot'
import {
  diffSnapshots,
  recalculateFromSnapshot,
} from '@/features/chart-history/services/recalculateSnapshot'
import { isSinglePalaceSnapshot } from '@/domain/qimen/shared/chartSnapshotTypes'

describe('ChartSnapshot 建構與還原', () => {
  it('六位數存檔 payload 含規則版本', () => {
    const r = calculatePalace('358796', '358796')
    const input = buildSinglePalaceSaveInput({
      title: 'test',
      rawInput: r.rawInput,
      normalizedCode: r.normalizedCode,
      palaceResult: r,
      emptyVoidField: 'unknown',
      oppositePalaceResult: null,
      oppositeInputCode: '',
      treatmentPlan: null,
    })
    const snap = parseChartSnapshot(input.chartSnapshot)
    expect(snap).not.toBeNull()
    if (snap && isSinglePalaceSnapshot(snap)) {
      expect(snap.palaceResult.door).toBe('驚門')
      expect(snap.meta.harmRulesVersion).toBeTruthy()
    }
  })

  it('重新計算後 diff 可擴充', () => {
    const r = calculatePalace('611122', '611122')
    const input = buildSinglePalaceSaveInput({
      title: 't',
      rawInput: r.rawInput,
      normalizedCode: r.normalizedCode,
      palaceResult: r,
      emptyVoidField: 'unknown',
      oppositePalaceResult: null,
      oppositeInputCode: '',
      treatmentPlan: null,
    })
    const before = parseChartSnapshot(input.chartSnapshot)!
    const after = recalculateFromSnapshot(before)
    const diff = diffSnapshots(before, after)
    expect(Array.isArray(diff)).toBe(true)
  })
})
