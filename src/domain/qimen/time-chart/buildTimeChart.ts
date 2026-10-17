import { randomUUID } from '@/shared/utils/id'
import type { TimeChart, TimeChartInput, YinpanPalaceCell } from './types'

const ENGINE_VERSION = 'yinpan-v0.4-portable'

export function buildTimeChartFromRaw(
  input: TimeChartInput,
  raw: Record<string, unknown>,
): TimeChart {
  const palaces = raw.palaces as Record<number, YinpanPalaceCell>
  return {
    id: randomUUID(),
    input,
    metadata: {
      season: String(raw.season ?? ''),
      ju: Number(raw.ju ?? 0),
      term: String(raw.term ?? ''),
      pillars: (raw.pillars as string[]) ?? [],
      xun: String(raw.xun ?? ''),
      engineVersion: ENGINE_VERSION,
      note: String(raw.note ?? ''),
    },
    palaces,
    raw,
    engineVersion: ENGINE_VERSION,
  }
}
