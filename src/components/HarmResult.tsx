import type { DetectedHarm } from '../types/qimen'
import { Card } from './Card'

interface HarmResultProps {
  harms: DetectedHarm[]
}

function positionLabel(harm: DetectedHarm): string {
  switch (harm.targetType) {
    case 'door':
      return '八門'
    case 'heavenStem':
      return '天盤干'
    case 'earthStem':
      return '地盤干'
    case 'emptyVoid':
      return '空無'
    default:
      return ''
  }
}

function itemLabel(harm: DetectedHarm): string {
  if (harm.targetType === 'heavenStem') return `天盤${harm.targetValue}`
  if (harm.targetType === 'earthStem') return `地盤${harm.targetValue}`
  return harm.targetValue
}

export function HarmResult({ harms }: HarmResultProps) {
  if (harms.length === 0) {
    return (
      <Card title="四害判定">
        <p className="text-[18px] text-[var(--color-muted)]">本次未發現四害</p>
      </Card>
    )
  }

  return (
    <Card title="四害判定">
      <ul className="space-y-4">
        {harms.map((harm) => (
          <li
            key={harm.id}
            className="rounded-[16px] bg-[var(--color-wine-soft)] px-4 py-4 text-[var(--color-wine)]"
          >
            <p className="text-[22px] font-bold">四害：{harm.type}</p>
            <p className="mt-2 text-[18px]">影響項目：{itemLabel(harm)}</p>
            <p className="mt-1 text-[18px]">
              所在宮位：{harm.palaceName}宮
            </p>
            <p className="mt-1 text-[18px]">
              影響位置：{positionLabel(harm)}
            </p>
            <p className="mt-1 text-[18px]">原因：{harm.reason}</p>
            {harm.remedyAnimal && (
              <p className="mt-2 text-[20px] font-semibold">
                化解提示：{harm.remedyAnimal}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}
