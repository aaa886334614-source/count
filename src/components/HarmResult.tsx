import type { DetectedHarm } from '../types/qimen'
import { Card } from './Card'

interface HarmResultProps {
  harms: DetectedHarm[]
}

export function HarmResult({ harms }: HarmResultProps) {
  if (harms.length === 0) {
    return (
      <Card title="四害判定">
        <p className="text-[18px] text-[var(--color-muted)]">
          未發現已設定規則中的四害
        </p>
      </Card>
    )
  }

  const maxSeverity = Math.max(...harms.map((h) => h.severity))

  return (
    <Card title="四害判定">
      <ul className="space-y-4">
        {harms.map((harm, index) => {
          const highlight = harm.severity === maxSeverity
          return (
            <li
              key={`${harm.type}-${harm.affectedItem}-${index}`}
              className={`rounded-[16px] px-4 py-4 ${
                highlight
                  ? 'bg-[var(--color-wine-soft)] text-[var(--color-wine)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-wine-dark)]'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[22px] font-bold text-[var(--color-wine)]">
                  {harm.type}
                </span>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[14px] text-[var(--color-wine)]">
                  四害
                </span>
              </div>
              <p className="mt-2 text-[18px]">影響項目：{harm.affectedItem}</p>
              {harm.remedyBranches.length > 0 && (
                <p className="mt-1 text-[18px]">
                  化解地支：{harm.remedyBranches.join('、')}
                </p>
              )}
              {harm.remedyAnimals.length > 0 && (
                <p className="mt-1 text-[18px]">
                  動物提示：{harm.remedyAnimals.join('、')}
                </p>
              )}
              {harm.description && (
                <p className="mt-2 text-[16px] opacity-80">{harm.description}</p>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
