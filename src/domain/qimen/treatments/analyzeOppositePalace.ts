import { PALACE_NAME } from '@/constants/harmRules'
import { oppositePalaceNumber } from '@/domain/qimen/shared/oppositePalaces'
import type { DetectedHarm } from '@/types/qimen'
import type { OppositePalaceAnalysis, PalaceContext } from './types'

function hasHarmType(harms: DetectedHarm[], type: DetectedHarm['type']): boolean {
  return harms.some((h) => h.type === type)
}

function hasGengMetal(ctx: PalaceContext): boolean {
  return ctx.heavenStem === '庚' || ctx.earthStem === '庚'
}

function hasWhiteTiger(ctx: PalaceContext): boolean {
  return ctx.god === '白虎'
}

export function analyzeOppositePalace(
  self: PalaceContext,
  opposite: PalaceContext | null | undefined,
): OppositePalaceAnalysis {
  const oppNum = oppositePalaceNumber(self.palaceNumber)
  if (oppNum == null) {
    return {
      oppositePalace: null,
      oppositeKnown: false,
      usableForTreatment: false,
      blockedReasons: ['中五無對宮'],
      prerequisiteHarms: [],
    }
  }

  if (!opposite) {
    return {
      oppositePalace: oppNum,
      oppositeKnown: false,
      usableForTreatment: false,
      blockedReasons: ['對宮資料未知，無法採用對宮沖法'],
      prerequisiteHarms: [],
    }
  }

  const blockedReasons: string[] = []
  let talismanHint: string | undefined

  if (hasWhiteTiger(opposite)) {
    blockedReasons.push('對宮有白虎')
    talismanHint = '白虎可另用麒麟符（符咒階段；環境仍改回本宮）'
  }
  if (hasGengMetal(opposite)) {
    blockedReasons.push('對宮有庚金')
  }
  if (hasHarmType(opposite.harms, '入墓')) {
    blockedReasons.push('對宮有入墓')
  }
  if (hasHarmType(opposite.harms, '空無')) {
    blockedReasons.push('對宮有空無')
  }

  const prerequisiteHarms = opposite.harms.filter(
    (h) => h.type === '門迫' || h.type === '擊刑',
  )

  const blocked = blockedReasons.length > 0
  const usableForTreatment = !blocked

  return {
    oppositePalace: oppNum,
    oppositeKnown: true,
    usableForTreatment,
    blockedReasons,
    prerequisiteHarms: blocked ? [] : prerequisiteHarms,
    talismanHint,
  }
}

export function palaceLabel(num: number): string {
  return PALACE_NAME[num] ?? String(num)
}
