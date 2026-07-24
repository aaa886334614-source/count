import type { PalaceResult } from '../types/qimen'
import { Card } from './Card'

interface SinglePalaceCardProps {
  result: PalaceResult
}

/**
 * 教材式單宮：CSS Grid 排版
 * 左上八神｜右上空亡○
 * 左中天盤｜右中九星
 * 左下地盤｜右下八門
 * 底部中央宮位
 */
export function SinglePalaceCard({ result }: SinglePalaceCardProps) {
  const stemText = (v: string | null, needs: boolean) => {
    if (needs) return '待選'
    return v ?? '\u00A0'
  }

  return (
    <Card title="單宮結果">
      <div className="mx-auto w-[90%] max-w-[420px]">
        <div
          className="grid aspect-square w-full grid-cols-2 grid-rows-[1.1fr_1fr_1fr_1.2fr] gap-3 rounded-[20px] bg-[var(--color-surface)] p-6 ring-1 ring-[var(--color-line)]"
          aria-label="單宮盤"
        >
          {/* 左上：八神 */}
          <div className="flex items-start justify-start self-start">
            <span className="break-words text-[32px] font-semibold leading-tight text-[var(--color-ink)]">
              {result.god}
            </span>
          </div>

          {/* 右上：空亡 ○ */}
          <div className="flex items-start justify-end self-start">
            {result.isEmptyVoid ? (
              <span
                className="text-[32px] leading-none text-[var(--color-ink)]"
                aria-label="空亡"
              >
                ○
              </span>
            ) : (
              <span className="invisible text-[32px]">○</span>
            )}
          </div>

          {/* 左中：天盤干 */}
          <div className="flex items-center justify-start">
            <span className="break-words text-[32px] font-semibold leading-tight text-[var(--color-ink)]">
              {stemText(result.heavenStem, result.needsHeavenChoice)}
            </span>
          </div>

          {/* 右中：九星 */}
          <div className="flex items-center justify-end text-right">
            <span className="break-words text-[28px] font-medium leading-tight text-[var(--color-ink)]">
              {result.star}
            </span>
          </div>

          {/* 左下：地盤干 */}
          <div className="flex items-center justify-start">
            <span className="break-words text-[32px] font-semibold leading-tight text-[var(--color-ink)]">
              {stemText(result.earthStem, result.needsEarthChoice)}
            </span>
          </div>

          {/* 右下：八門 */}
          <div className="flex items-center justify-end text-right">
            <span className="break-words text-[28px] font-medium leading-tight text-[var(--color-ink)]">
              {result.door}
            </span>
          </div>

          {/* 底部中央：宮位 */}
          <div className="col-span-2 flex items-end justify-center pb-1">
            <span className="text-[40px] font-bold leading-none tracking-wide text-[var(--color-ink)]">
              {result.palaceNumber} {result.palaceName}
            </span>
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-[18px] tracking-[0.28em] text-[var(--color-muted)]">
          {result.normalizedCode}
        </p>
      </div>
    </Card>
  )
}
