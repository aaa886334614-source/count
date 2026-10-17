import type { ChartSnapshot } from '@/domain/qimen/shared/chartSnapshotTypes'
import {
  isSinglePalaceSnapshot,
  isTimeChartSnapshot,
} from '@/domain/qimen/shared/chartSnapshotTypes'

export function parseChartSnapshot(raw: unknown): ChartSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as ChartSnapshot
  if (isSinglePalaceSnapshot(s) || isTimeChartSnapshot(s)) {
    if (s.meta && s.kind) return s
  }
  return null
}
