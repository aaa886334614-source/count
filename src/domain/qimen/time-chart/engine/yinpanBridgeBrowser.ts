/**
 * 瀏覽器端載入 v0.4 引擎：先注入節氣表至 globalThis.QimenTerms
 */
import type { TimeChartMode } from '../types'
// @ts-expect-error vendor CJS
import terms from './vendor/solar-terms.cjs'
// @ts-expect-error vendor CJS
import yinpan from './vendor/yinpan-engine.cjs'

const termsData = (terms as { default?: unknown }).default ?? terms
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).QimenTerms = termsData

const api =
  (yinpan as { default?: typeof yinpan }).default ??
  (yinpan as {
    calculate: (input: string, mode?: TimeChartMode) => Record<string, unknown>
    rotate: (c: Record<string, unknown>, s: number) => Record<string, unknown>
  })

export function calculateYinpanBrowser(
  input: string,
  mode: TimeChartMode = 'shi',
) {
  return api.calculate(input, mode)
}

export function rotateYinpanBrowser(
  chart: Record<string, unknown>,
  steps: number,
) {
  return api.rotate(chart, steps)
}
