import {
  DOOR_ELEMENT,
  DOOR_REMEDY_ANIMALS,
  HARM_SEVERITY,
  MEN_PO_BY_PALACE,
  PALACE_ELEMENT,
  PALACE_NAME,
  STEM_HARM_RULES,
} from '../../../constants/harmRules'
import type { DetectedHarm, PalaceResult } from '../../../types/qimen'

function pushMenPo(harms: DetectedHarm[], result: PalaceResult): void {
  const palace = result.palaceNumber
  const doors = MEN_PO_BY_PALACE[palace]
  if (!doors?.includes(result.door)) return

  const doorEl = DOOR_ELEMENT[result.door]
  const palaceEl = PALACE_ELEMENT[palace]
  const palaceName = result.palaceName || PALACE_NAME[palace] || ''
  const reason =
    doorEl && palaceEl
      ? `${result.door}屬${doorEl}，${palaceName}宮屬${palaceEl}，${doorEl}剋${palaceEl}`
      : `${result.door}落${palaceName}宮構成門迫`

  harms.push({
    id: `menpo-${palace}-${result.door}`,
    type: '門迫',
    severity: HARM_SEVERITY.門迫,
    palace,
    palaceName,
    targetType: 'door',
    targetValue: result.door,
    reason,
    remedyAnimal: DOOR_REMEDY_ANIMALS[result.door],
    source: 'six-digit',
  })
}

function pushStemHarms(
  harms: DetectedHarm[],
  result: PalaceResult,
  stem: string | null,
  targetType: 'heavenStem' | 'earthStem',
  label: string,
): void {
  if (!stem) return
  const palace = result.palaceNumber
  const palaceName = result.palaceName || PALACE_NAME[palace] || ''

  for (const rule of STEM_HARM_RULES) {
    if (rule.palace !== palace || rule.stem !== stem) continue
    harms.push({
      id: `${rule.type}-${targetType}-${palace}-${stem}`,
      type: rule.type,
      severity: HARM_SEVERITY[rule.type],
      palace,
      palaceName,
      targetType,
      targetValue: stem,
      reason: `${label}「${stem}」：${rule.description}`,
      remedyAnimal: rule.remedyAnimal,
      source: 'six-digit',
    })
  }
}

function pushEmptyVoid(harms: DetectedHarm[], result: PalaceResult): void {
  if (!result.isEmptyVoid) return
  const parts: string[] = []
  if (result.heavenStemDigit === '0') parts.push('天盤干')
  if (result.earthStemDigit === '0') parts.push('地盤干')
  const palaceName = result.palaceName || PALACE_NAME[result.palaceNumber] || ''

  harms.push({
    id: `empty-${result.palaceNumber}-${parts.join('-')}`,
    type: '空無',
    severity: HARM_SEVERITY.空無,
    palace: result.palaceNumber,
    palaceName,
    targetType: 'emptyVoid',
    targetValue: parts.join('、') || '空無',
    reason: `${parts.join('、')}為 0，構成空無（六位碼）`,
    source: 'six-digit',
  })
}

/** 純函式四害偵測（六位碼盤面） */
export function detectHarms(result: PalaceResult): DetectedHarm[] {
  const harms: DetectedHarm[] = []
  pushMenPo(harms, result)
  pushStemHarms(harms, result, result.heavenStem, 'heavenStem', '天盤干')
  pushStemHarms(harms, result, result.earthStem, 'earthStem', '地盤干')
  pushEmptyVoid(harms, result)
  return harms.sort((a, b) => b.severity - a.severity)
}
