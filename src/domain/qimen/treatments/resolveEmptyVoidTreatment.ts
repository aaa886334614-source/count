import {
  PALACE_BRANCH_ANIMALS,
  oppositePalaceNumber,
} from '@/domain/qimen/shared/oppositePalaces'
import { palaceLabel } from './analyzeOppositePalace'
import type {
  EmptyVoidFieldState,
  OppositePalaceAnalysis,
  PalaceContext,
  TreatmentStep,
} from './types'

let stepSeq = 0
function nextId(prefix: string): string {
  stepSeq += 1
  return `${prefix}-${stepSeq}`
}

export function resolveEmptyVoidTreatment(
  self: PalaceContext,
  emptyVoidField: EmptyVoidFieldState,
  oppositeAnalysis: OppositePalaceAnalysis,
  prerequisiteStepIds: string[],
): TreatmentStep[] {
  if (emptyVoidField === 'unknown') {
    return [
      {
        id: nextId('empty-scene'),
        harmType: 'scene-check',
        problemSource: '本宮空無需現場確認',
        targetPalace: self.palaceNumber,
        targetPalaceName: palaceLabel(self.palaceNumber),
        purpose: '先判斷真空或假空：雜物多為假空，清除雜物且不再加物；真空才進入補空／對宮沖',
        prerequisites: [],
        status: 'needs-scene',
      },
    ]
  }

  if (emptyVoidField === 'falseEmpty') {
    return [
      {
        id: nextId('empty-false'),
        harmType: 'cleanup',
        problemSource: '現場判定為假空',
        targetPalace: self.palaceNumber,
        targetPalaceName: palaceLabel(self.palaceNumber),
        purpose: '清除本宮雜物，不可再自動加入補空物件',
        prerequisites: [],
        status: 'pending',
      },
    ]
  }

  // trueEmpty — 真空
  const oppNum =
    oppositeAnalysis.oppositePalace ??
    oppositePalaceNumber(self.palaceNumber)

  const useOpposite =
    oppositeAnalysis.oppositeKnown &&
    oppositeAnalysis.usableForTreatment &&
    oppNum != null

  if (!oppositeAnalysis.oppositeKnown) {
    return [
      {
        id: nextId('empty-need-opp'),
        harmType: '空無',
        problemSource: '本宮真空',
        targetPalace: self.palaceNumber,
        targetPalaceName: palaceLabel(self.palaceNumber),
        purpose: '真空需對宮資料才能決定對宮沖或本宮補空',
        prerequisites: [...prerequisiteStepIds],
        status: 'needs-info',
      },
    ]
  }

  if (useOpposite && oppNum != null) {
    const branches = PALACE_BRANCH_ANIMALS[oppNum] ?? []
    if (branches.length === 1) {
      const { branch, animal } = branches[0]!
      return [
        {
          id: nextId('empty-opp'),
          harmType: '空無',
          problemSource: '本宮真空，對宮可用',
          targetPalace: oppNum,
          targetPalaceName: palaceLabel(oppNum),
          branch,
          animal,
          purpose: `採對宮${palaceLabel(oppNum)}地支放${branch}（${animal}）`,
          prerequisites: [...prerequisiteStepIds],
          status: 'pending',
        },
      ]
    }
    return [
      {
        id: nextId('empty-multi'),
        harmType: '空無',
        problemSource: '本宮真空，對宮有多支',
        targetPalace: oppNum,
        targetPalaceName: palaceLabel(oppNum),
        purpose: `對宮${palaceLabel(oppNum)}有${branches.map((b) => b.branch).join('、')}，教材選支細則待確認`,
        prerequisites: [...prerequisiteStepIds],
        status: 'needs-info',
      },
    ]
  }

  // 對宮不可用 — 本宮補空（單支宮位可自動）
  const selfBranches = PALACE_BRANCH_ANIMALS[self.palaceNumber] ?? []
  if (selfBranches.length === 1) {
    const { branch, animal } = selfBranches[0]!
    return [
      {
        id: nextId('empty-self'),
        harmType: '空無',
        problemSource: `對宮不可用：${oppositeAnalysis.blockedReasons.join('、')}`,
        targetPalace: self.palaceNumber,
        targetPalaceName: palaceLabel(self.palaceNumber),
        branch,
        animal,
        purpose: `改在本宮${palaceLabel(self.palaceNumber)}放${branch}（${animal}）`,
        prerequisites: [...prerequisiteStepIds],
        status: 'pending',
        talismanNote: oppositeAnalysis.talismanHint,
      },
    ]
  }

  return [
    {
      id: nextId('empty-self-multi'),
      harmType: '空無',
      problemSource: `對宮不可用：${oppositeAnalysis.blockedReasons.join('、')}`,
      targetPalace: self.palaceNumber,
      targetPalaceName: palaceLabel(self.palaceNumber),
      purpose: '本宮有多支可選，教材細則待確認',
      prerequisites: [...prerequisiteStepIds],
      status: 'needs-info',
      talismanNote: oppositeAnalysis.talismanHint,
    },
  ]
}
