import { ANIMAL_BRANCH_MAP } from '@/utils/formatRemedyAnimal'
import type { DetectedHarm } from '@/types/qimen'
import { analyzeOppositePalace, palaceLabel } from './analyzeOppositePalace'
import { resolveEmptyVoidTreatment } from './resolveEmptyVoidTreatment'
import { resolveTombTreatment } from './resolveTombTreatment'
import type {
  EmptyVoidFieldState,
  PalaceContext,
  TreatmentPlan,
  TreatmentStep,
} from './types'

export interface BuildEnvironmentInput {
  self: PalaceContext
  opposite?: PalaceContext | null
  emptyVoidField: EmptyVoidFieldState
}

let stepSeq = 0
function nextId(prefix: string): string {
  stepSeq += 1
  return `${prefix}-${stepSeq}`
}

function harmStep(
  harm: DetectedHarm,
  ctx: PalaceContext,
  prefix: string,
): TreatmentStep {
  const animal = harm.remedyAnimal ?? ''
  const branch = animal ? ANIMAL_BRANCH_MAP[animal] : undefined
  return {
    id: nextId(prefix),
    harmType: harm.type,
    sourceHarmId: harm.id,
    problemSource: harm.reason,
    targetPalace: ctx.palaceNumber,
    targetPalaceName: palaceLabel(ctx.palaceNumber),
    branch,
    animal: animal || undefined,
    purpose: `處理本宮${harm.type}：${harm.targetValue}`,
    prerequisites: [],
    status: animal ? 'pending' : 'needs-info',
  }
}

/** 四害偵測與環境化解分離；產生結構化 TreatmentPlan */
export function buildEnvironmentActions(
  input: BuildEnvironmentInput,
): TreatmentPlan {
  stepSeq = 0
  const { self, opposite, emptyVoidField } = input
  const oppositeAnalysis = analyzeOppositePalace(self, opposite)
  const steps: TreatmentStep[] = []
  const unresolved: string[] = []

  // 本宮門迫／擊刑
  for (const harm of self.harms.filter(
    (h) => h.type === '門迫' || h.type === '擊刑',
  )) {
    steps.push(harmStep(harm, self, 'self-harm'))
  }

  // 對宮前置門迫／擊刑
  const prereqIds: string[] = []
  if (
    oppositeAnalysis.oppositeKnown &&
    oppositeAnalysis.usableForTreatment &&
    opposite
  ) {
    for (const harm of oppositeAnalysis.prerequisiteHarms) {
      const s = harmStep(harm, opposite, 'opp-pre')
      steps.push(s)
      prereqIds.push(s.id)
    }
  }

  // 入墓 — 每一筆分開
  for (const harm of self.harms.filter((h) => h.type === '入墓')) {
    steps.push(
      resolveTombTreatment(self, harm, oppositeAnalysis, [...prereqIds]),
    )
  }

  // 空無 — 與入墓分開
  if (self.harms.some((h) => h.type === '空無')) {
    steps.push(
      ...resolveEmptyVoidTreatment(
        self,
        emptyVoidField,
        oppositeAnalysis,
        [...prereqIds],
      ),
    )
  }

  if (!oppositeAnalysis.oppositeKnown && oppositeAnalysis.oppositePalace) {
    unresolved.push(
      `請提供對宮${palaceLabel(oppositeAnalysis.oppositePalace)}資料，或切換至完整九宮模式`,
    )
  }
  for (const r of oppositeAnalysis.blockedReasons) {
    if (r.includes('待確認') || r.includes('未知')) unresolved.push(r)
  }

  return {
    steps,
    unresolved: [...new Set(unresolved)],
    oppositeAnalysis,
  }
}

export function palaceContextFromResult(result: {
  palaceNumber: number
  palaceName: string
  god: string
  door: string
  heavenStem: string | null
  earthStem: string | null
  harms: DetectedHarm[]
}): PalaceContext {
  return {
    palaceNumber: result.palaceNumber,
    palaceName: result.palaceName,
    god: result.god,
    door: result.door,
    heavenStem: result.heavenStem,
    earthStem: result.earthStem,
    harms: result.harms,
  }
}
