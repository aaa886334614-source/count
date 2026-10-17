import { describe, expect, it } from 'vitest'
import { buildSinglePalaceSaveInput } from '@/features/chart-history/services/buildSavePayload'
import { calculatePalace } from '@/utils/calculatePalace'
import {
  buildEnvironmentActions,
  palaceContextFromResult,
} from '@/domain/qimen/treatments/buildEnvironmentActions'

describe('雲端快照還原欄位', () => {
  it('單宮存檔包含原始輸入、盤面、四害與化解方案', () => {
    const palace = calculatePalace('182839', '182839')
    const plan = buildEnvironmentActions({
      self: palaceContextFromResult(palace),
      opposite: null,
      emptyVoidField: 'unknown',
    })
    const input = buildSinglePalaceSaveInput({
      title: 't',
      rawInput: palace.rawInput,
      normalizedCode: palace.normalizedCode,
      palaceResult: palace,
      emptyVoidField: 'unknown',
      oppositePalaceResult: null,
      oppositeInputCode: '',
      treatmentPlan: plan,
    })
    const snap = input.chartSnapshot as Record<string, unknown>
    expect(input.rawInput).toBeTruthy()
    expect(input.ruleVersion).toBeTruthy()
    expect(snap.palaceResult).toBeTruthy()
    expect(snap.treatmentPlan).toBeTruthy()
    expect((snap.palaceResult as { harms?: unknown[] }).harms?.length).toBeGreaterThan(0)
  })
})
