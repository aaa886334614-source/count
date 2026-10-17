import { describe, expect, it } from 'vitest'
import { calculateYinpanNode } from '@/domain/qimen/time-chart/engine/yinpanBridgeNode'

describe('v0.4 陰盤引擎回歸', () => {
  it('核心案例與 23:00 換日', () => {
    const c1 = calculateYinpanNode('2019-05-02T09:09')
    expect(c1.ju).toBe(4)
    expect(c1.season).toBe('陽遁')

    const c2 = calculateYinpanNode('2026-10-17T15:26')
    expect(c2.ju).toBe(6)
    expect(c2.season).toBe('陰遁')

    const pre = calculateYinpanNode('2026-10-17T22:59')
    const post = calculateYinpanNode('2026-10-17T23:00')
    expect(pre.day).not.toBe(post.day)
  })

  it('九宮欄位完整', () => {
    const c = calculateYinpanNode('2006-05-23T19:45')
    for (const n of [1, 2, 3, 4, 6, 7, 8, 9]) {
      const p = c.palaces[n]
      expect(p.star && p.door && p.deity && p.tian && p.di).toBeTruthy()
    }
  })
})
