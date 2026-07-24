import { HARM_RULES } from '../constants/harmRules'
import { HARM_SEVERITY } from '../constants/mappings'
import type { DetectedHarm, PalaceResult } from '../types/qimen'

function matchTarget(
  result: PalaceResult,
  targetType: string,
  targetValue: string,
): boolean {
  switch (targetType) {
    case 'door':
      return result.door === targetValue
    case 'star':
      return result.star === targetValue
    case 'god':
      return result.god === targetValue
    case 'heavenStem':
      return result.heavenStem === targetValue
    case 'earthStem':
      return result.earthStem === targetValue
    default:
      return false
  }
}

/**
 * 依設定表判定四害。
 * 空亡依數字 0 判定；門迫／擊刑／入墓僅在 HARM_RULES 有明確規則時成立。
 */
export function detectHarms(result: PalaceResult): DetectedHarm[] {
  const harms: DetectedHarm[] = []

  if (result.isEmptyVoid) {
    harms.push({
      type: '空亡',
      severity: HARM_SEVERITY['空亡'],
      affectedItem:
        result.heavenStemDigit === '0' && result.earthStemDigit === '0'
          ? '天盤干、地盤干'
          : result.heavenStemDigit === '0'
            ? '天盤干'
            : '地盤干',
      remedyBranches: result.emptyVoidRemedy?.branches ?? [],
      remedyAnimals: result.emptyVoidRemedy?.animals ?? [],
      description: '天盤干或地盤干為 0，構成空亡。',
    })
  }

  for (const rule of HARM_RULES) {
    if (rule.palace !== result.palaceNumber) continue
    if (!matchTarget(result, rule.targetType, rule.targetValue)) continue

    harms.push({
      type: rule.type,
      severity: HARM_SEVERITY[rule.type] ?? 1,
      affectedItem: rule.targetValue,
      remedyBranches: rule.remedyBranches ?? [],
      remedyAnimals: rule.remedyAnimals ?? [],
      description: rule.description ?? `${rule.type}條件成立`,
    })
  }

  return harms.sort((a, b) => b.severity - a.severity)
}
