import { describe, expect, it, beforeEach } from 'vitest'
import {
  clearPendingSave,
  readPendingSave,
  writePendingSave,
} from '@/features/chart-history/services/pendingSaveStorage'

describe('pending save sessionStorage', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).sessionStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
    }
    clearPendingSave()
  })

  it('讀寫 pending bundle', () => {
    writePendingSave({
      returnPath: '/time-chart',
      title: 't',
      note: 'n',
      saveInput: {
        chartType: 'time',
        title: 't',
        rawInput: {},
        normalizedInput: {},
        calculationContext: {},
        chartSnapshot: {},
        engineVersion: 'x',
      },
      openSaveDialog: true,
    })
    const p = readPendingSave()
    expect(p?.returnPath).toBe('/time-chart')
    expect(p?.openSaveDialog).toBe(true)
  })
})
