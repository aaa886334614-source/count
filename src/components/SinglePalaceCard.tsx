import type { PalaceResult } from '../types/qimen'
import { Card } from './Card'

interface SinglePalaceCardProps {
  result: PalaceResult
}

export function SinglePalaceCard({ result }: SinglePalaceCardProps) {
  const stemText = (v: string | null, needs: boolean) => {
    if (needs) return '待選'
    return v ?? '\u00A0'
  }

  const highlightDoor = result.harms.some((h) => h.type === '門迫')
  const highlightHeaven = result.harms.some(
    (h) =>
      h.targetType === 'heavenStem' &&
      (h.type === '擊刑' || h.type === '入墓'),
  )
  const highlightEarth = result.harms.some(
    (h) =>
      h.targetType === 'earthStem' &&
      (h.type === '擊刑' || h.type === '入墓'),
  )
  const mark = (on: boolean) =>
    on ? 'text-[var(--color-wine)]' : 'text-[var(--color-ink)]'

  return (
    <Card title="單宮結果">
      <div className="mx-auto w-full max-w-[360px]">
        <div
          className="grid grid-cols-2 gap-x-3 gap-y-5 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface)]/40 px-4 py-5 sm:px-5 sm:py-6"
          aria-label="單宮盤"
        >
          <div className="min-h-[40px]">
            <p className="text-[12px] text-[var(--color-muted)]">八神</p>
            <p className="mt-1 text-[24px] font-bold leading-none text-[var(--color-ink)] sm:text-[26px]">
              {result.god}
            </p>
          </div>
          <div className="flex min-h-[40px] flex-col items-end">
            <p className="text-[12px] text-[var(--color-muted)]">空無</p>
            <p
              className="mt-1 text-[22px] leading-none text-[var(--color-ink)]"
              aria-label={result.isEmptyVoid ? '空無' : undefined}
            >
              {result.isEmptyVoid ? '○' : '\u00A0'}
            </p>
          </div>

          <div className="min-h-[44px]">
            <p className="text-[12px] text-[var(--color-muted)]">天盤干</p>
            <p
              className={`mt-1 text-[28px] font-bold leading-none sm:text-[30px] ${mark(highlightHeaven)}`}
            >
              {stemText(result.heavenStem, result.needsHeavenChoice)}
            </p>
          </div>
          <div className="min-h-[44px] text-right">
            <p className="text-[12px] text-[var(--color-muted)]">九星</p>
            <p className="mt-1 text-[24px] font-semibold leading-none text-[var(--color-ink)] sm:text-[26px]">
              {result.star}
            </p>
          </div>

          <div className="min-h-[44px]">
            <p className="text-[12px] text-[var(--color-muted)]">地盤干</p>
            <p
              className={`mt-1 text-[28px] font-bold leading-none sm:text-[30px] ${mark(highlightEarth)}`}
            >
              {stemText(result.earthStem, result.needsEarthChoice)}
            </p>
          </div>
          <div className="min-h-[44px] text-right">
            <p className="text-[12px] text-[var(--color-muted)]">八門</p>
            <p
              className={`mt-1 text-[24px] font-semibold leading-none sm:text-[26px] ${mark(highlightDoor)}`}
            >
              {result.door}
            </p>
          </div>

          <div className="col-span-2 border-t border-[var(--color-line)] pt-4 text-center">
            <p className="text-[12px] text-[var(--color-muted)]">宮位</p>
            <p className="mt-1 text-[40px] font-extrabold leading-none tracking-wide text-[var(--color-ink)]">
              {result.palaceInputDigit} {result.palaceName}
            </p>
          </div>
        </div>
        <p className="mt-3 text-center font-mono text-[15px] tracking-[0.22em] text-[var(--color-muted)]">
          {result.normalizedCode}
        </p>
      </div>
    </Card>
  )
}
