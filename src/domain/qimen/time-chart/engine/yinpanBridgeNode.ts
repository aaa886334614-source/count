import { createRequire } from 'node:module'
import type { TimeChartMode } from '../types'

const require = createRequire(import.meta.url)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YinpanApi = any

let cached: YinpanApi | null = null

function resolveYinpanExport(mod: YinpanApi): YinpanApi {
  if (mod && typeof mod.calculate === 'function') return mod
  const inner = (mod as { default?: YinpanApi }).default
  if (inner && typeof inner.calculate === 'function') return inner
  throw new Error('yinpan-engine 匯出格式無法辨識')
}

export function getYinpanApiNode(): YinpanApi {
  if (!cached) {
    require('./vendor/solar-terms.cjs')
    cached = resolveYinpanExport(require('./vendor/yinpan-engine.cjs'))
  }
  return cached
}

export function calculateYinpanNode(input: string, mode: TimeChartMode = 'shi') {
  return getYinpanApiNode().calculate(input, mode)
}

export function rotateYinpanNode(chart: Record<string, unknown>, steps: number) {
  return getYinpanApiNode().rotate(chart, steps)
}
