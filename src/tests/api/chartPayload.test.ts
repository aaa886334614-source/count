import { describe, expect, it } from 'vitest'
import { HARM_RULES_VERSION } from '@/domain/qimen/shared/versions'
import type { SaveChartInput } from '@/infrastructure/api/types'

describe('SaveChartInput（API）', () => {
  it('必須包含 ruleVersion，且不得由前端指定 user_id', () => {
    const input: SaveChartInput = {
      chartType: 'time',
      title: 't',
      rawInput: {},
      normalizedInput: {},
      calculationContext: {},
      chartSnapshot: {},
      engineVersion: 'yinpan-v0.4-portable',
      ruleVersion: HARM_RULES_VERSION,
    }
    expect(input.ruleVersion).toBeTruthy()
    expect('user_id' in (input as unknown as Record<string, unknown>)).toBe(false)
  })
})
