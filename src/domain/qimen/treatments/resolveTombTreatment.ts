import { ANIMAL_BRANCH_MAP } from '@/utils/formatRemedyAnimal'
import type { DetectedHarm } from '@/types/qimen'
import { palaceLabel } from './analyzeOppositePalace'
import type { OppositePalaceAnalysis, PalaceContext, TreatmentStep } from './types'

let stepSeq = 0
function nextId(prefix: string): string {
  stepSeq += 1
  return `${prefix}-${stepSeq}`
}

function branchAnimal(animal: string): { branch: string; animal: string } {
  const branch = ANIMAL_BRANCH_MAP[animal]
  return branch ? { branch, animal } : { branch: '', animal }
}

export function resolveTombTreatment(
  self: PalaceContext,
  tombHarm: DetectedHarm,
  oppositeAnalysis: OppositePalaceAnalysis,
  prerequisiteStepIds: string[],
): TreatmentStep {
  const useOpposite =
    oppositeAnalysis.oppositeKnown &&
    oppositeAnalysis.usableForTreatment &&
    oppositeAnalysis.oppositePalace != null

  const targetPalace = useOpposite
    ? oppositeAnalysis.oppositePalace!
    : self.palaceNumber

  const { branch, animal } = tombHarm.remedyAnimal
    ? branchAnimal(tombHarm.remedyAnimal)
    : { branch: '', animal: '' }

  const status =
    !tombHarm.remedyAnimal
      ? 'needs-info'
      : !oppositeAnalysis.oppositeKnown && !useOpposite
        ? 'needs-info'
        : 'pending'

  return {
    id: nextId('tomb'),
    harmType: '入墓',
    sourceHarmId: tombHarm.id,
    problemSource: tombHarm.reason,
    targetPalace,
    targetPalaceName: palaceLabel(targetPalace),
    branch: branch || undefined,
    animal: animal || undefined,
    purpose: useOpposite
      ? `以入墓沖墓物放對宮${palaceLabel(targetPalace)}`
      : `對宮不可用，改在本宮${palaceLabel(self.palaceNumber)}處理入墓`,
    prerequisites: [...prerequisiteStepIds],
    status,
  }
}
