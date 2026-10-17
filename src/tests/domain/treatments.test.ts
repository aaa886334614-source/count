import { describe, expect, it } from 'vitest'
import { calculatePalace } from '@/utils/calculatePalace'
import {
  buildEnvironmentActions,
  palaceContextFromResult,
} from '@/domain/qimen/treatments/buildEnvironmentActions'
import type { PalaceContext } from '@/domain/qimen/treatments/types'

describe('六位碼 358796', () => {
  it('解析震／驚門門迫／辰龍', () => {
    const r = calculatePalace('358796', '358796')
    expect(r.palaceName).toBe('震')
    expect(r.door).toBe('驚門')
    expect(r.harms.some((h) => h.type === '門迫' && h.remedyAnimal === '龍')).toBe(
      true,
    )
  })
})

describe('602504 八神0', () => {
  it('乾／玄武／天芮／死門／天盤空無／丁', () => {
    const r = calculatePalace('602504', '602504')
    expect(r.palaceName).toBe('乾')
    expect(r.god).toBe('玄武')
    expect(r.star).toBe('天芮')
    expect(r.door).toBe('死門')
    expect(r.heavenStem).toBe(null)
    expect(r.earthStem).toBe('丁')
  })
})

describe('艮＋庚 擊刑與入墓', () => {
  it('同時成立兩筆', () => {
    const r = calculatePalace('811172', '811172')
    expect(
      r.harms.filter((h) => h.type === '擊刑' && h.targetValue === '庚'),
    ).toHaveLength(1)
    expect(
      r.harms.filter((h) => h.type === '入墓' && h.targetValue === '庚'),
    ).toHaveLength(1)
  })
})

describe('乾乙入墓 沖墓龍', () => {
  it('入墓化解物為辰（龍）', () => {
    const r = calculatePalace('611122', '611122')
    const tomb = r.harms.find((h) => h.type === '入墓')
    expect(tomb?.remedyAnimal).toBe('龍')
    const plan = buildEnvironmentActions({
      self: palaceContextFromResult(r),
      opposite: null,
      emptyVoidField: 'unknown',
    })
    const step = plan.steps.find((s) => s.harmType === '入墓')
    expect(step?.animal).toBe('龍')
    expect(step?.branch).toBe('辰')
  })
})

function ctx(partial: Partial<PalaceContext> & Pick<PalaceContext, 'palaceNumber' | 'palaceName'>): PalaceContext {
  return {
    god: '值符',
    door: '休門',
    heavenStem: null,
    earthStem: null,
    harms: [],
    ...partial,
  }
}

describe('空無現場流程', () => {
  it('假空：清理雜物，不加物', () => {
    const self = ctx({
      palaceNumber: 7,
      palaceName: '兌',
      harms: [
        {
          id: 'e1',
          type: '空無',
          severity: 2,
          palace: 7,
          palaceName: '兌',
          targetType: 'emptyVoid',
          targetValue: '天盤干',
          reason: 'test',
        },
      ],
    })
    const plan = buildEnvironmentActions({
      self,
      opposite: ctx({ palaceNumber: 3, palaceName: '震', god: '值符', harms: [] }),
      emptyVoidField: 'falseEmpty',
    })
    expect(plan.steps.some((s) => s.harmType === 'cleanup')).toBe(true)
    expect(plan.steps.every((s) => !s.branch)).toBe(true)
  })

  it('真空：兌對震可用 → 震宮卯兔', () => {
    const self = ctx({
      palaceNumber: 7,
      palaceName: '兌',
      harms: [
        {
          id: 'e1',
          type: '空無',
          severity: 2,
          palace: 7,
          palaceName: '兌',
          targetType: 'emptyVoid',
          targetValue: '天盤干',
          reason: 'test',
        },
      ],
    })
    const opposite = ctx({
      palaceNumber: 3,
      palaceName: '震',
      god: '值符',
      harms: [],
    })
    const plan = buildEnvironmentActions({
      self,
      opposite,
      emptyVoidField: 'trueEmpty',
    })
    const step = plan.steps.find((s) => s.harmType === '空無' && s.status === 'pending')
    expect(step?.targetPalace).toBe(3)
    expect(step?.branch).toBe('卯')
    expect(step?.animal).toBe('兔')
  })

  it('真空：震有白虎 → 兌宮酉雞', () => {
    const self = ctx({
      palaceNumber: 7,
      palaceName: '兌',
      harms: [
        {
          id: 'e1',
          type: '空無',
          severity: 2,
          palace: 7,
          palaceName: '兌',
          targetType: 'emptyVoid',
          targetValue: '天盤干',
          reason: 'test',
        },
      ],
    })
    const opposite = ctx({
      palaceNumber: 3,
      palaceName: '震',
      god: '白虎',
      harms: [],
    })
    const plan = buildEnvironmentActions({
      self,
      opposite,
      emptyVoidField: 'trueEmpty',
    })
    const step = plan.steps.find(
      (s) => s.harmType === '空無' && s.targetPalace === 7,
    )
    expect(step?.branch).toBe('酉')
    expect(step?.animal).toBe('雞')
  })
})

describe('對宮前置門迫', () => {
  it('先處理對宮門迫再沖', () => {
    const self = ctx({
      palaceNumber: 6,
      palaceName: '乾',
      harms: [
        {
          id: 't1',
          type: '入墓',
          severity: 2,
          palace: 6,
          palaceName: '乾',
          targetType: 'heavenStem',
          targetValue: '乙',
          reason: '入墓',
          remedyAnimal: '龍',
        },
      ],
    })
    const opposite = ctx({
      palaceNumber: 4,
      palaceName: '巽',
      god: '值符',
      door: '驚門',
      harms: [
        {
          id: 'mp1',
          type: '門迫',
          severity: 4,
          palace: 4,
          palaceName: '巽',
          targetType: 'door',
          targetValue: '驚門',
          reason: '門迫',
          remedyAnimal: '龍',
        },
      ],
    })
    const plan = buildEnvironmentActions({
      self,
      opposite,
      emptyVoidField: 'unknown',
    })
    const pre = plan.steps.find((s) => s.targetPalace === 4 && s.harmType === '門迫')
    const tomb = plan.steps.find((s) => s.harmType === '入墓')
    expect(pre).toBeTruthy()
    expect(tomb?.prerequisites).toContain(pre!.id)
  })
})
