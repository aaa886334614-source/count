import type { DetectedHarm } from '../types/qimen'
import { formatRemedyAnimal } from '../utils/formatRemedyAnimal'
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
        <p className="text-[16px] text-[var(--color-muted)]">本次未發現四害</p>
      </Card>
    )
  }

  return (
    <Card title="四害判定">
      <ul className="space-y-3">
        {harms.map((harm) => (
          <li
            key={harm.id}
            className="rounded-[16px] bg-[var(--color-wine-soft)] px-4 py-4"
          >
            <span className="inline-flex rounded-full bg-[var(--color-wine)] px-2.5 py-0.5 text-[12px] font-semibold text-white">
              {harm.type}
            </span>
            <p className="mt-2 text-[22px] font-extrabold text-[var(--color-wine)]">
              {itemLabel(harm)}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[14px] leading-snug">
              <div>
                <p className="text-[12px] text-[var(--color-wine)]/70">
                  所在宮位
                </p>
                <p className="font-medium text-[var(--color-wine-dark)]">
                  {harm.palaceName}宮
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[var(--color-wine)]/70">
                  影響位置
                </p>
                <p className="font-medium text-[var(--color-wine-dark)]">
                  {positionLabel(harm)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[12px] text-[var(--color-wine)]/70">原因</p>
                <p className="break-words font-medium text-[var(--color-wine-dark)]">
                  {harm.reason}
                </p>
              </div>
              {harm.remedyAnimal && (
                <div className="col-span-2">
                  <p className="text-[12px] text-[var(--color-wine)]/70">
                    化解提示
                  </p>
                  <p className="text-[18px] font-bold text-[var(--color-wine)]">
                    {formatRemedyAnimal(harm.remedyAnimal)}
                  </p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
