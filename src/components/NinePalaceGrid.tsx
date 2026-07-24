import { NINE_PALACE_ORDER, PALACE_MAP } from '../constants/mappings'
import { Card } from './Card'

interface NinePalaceGridProps {
  activePalace?: number | null
}

export function NinePalaceGrid({ activePalace = null }: NinePalaceGridProps) {
  return (
    <Card title="完整九宮">
      <div className="grid grid-cols-3 gap-2">
        {NINE_PALACE_ORDER.map((num) => {
          const name = PALACE_MAP[String(num)]
          const active = activePalace === num
          return (
            <div
              key={num}
              className={`flex min-h-[72px] flex-col items-center justify-center rounded-[16px] px-2 py-3 text-center ${
                active
                  ? 'bg-[var(--color-wine)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink)]'
              }`}
            >
              <span className="text-[22px] font-semibold">
                {num} {name}
              </span>
              {active && (
                <span className="mt-1 text-[14px] tracking-wider opacity-90">
                  本盤
                </span>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-[16px] leading-relaxed text-[var(--color-muted)]">
        4 巽｜9 離｜2 坤　／　3 震｜5 中｜7 兌　／　8 艮｜1 坎｜6 乾
      </p>
    </Card>
  )
}
