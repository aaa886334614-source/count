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
      <div className="mx-auto w-full max-w-[400px]">
        <div
          className="grid aspect-[5/6] w-full grid-cols-2 grid-rows-[auto_1fr_1fr_auto] gap-x-4 gap-y-6 rounded-[16px] border border-[var(--color-line)] bg-white p-5 sm:p-7"
          aria-label="單宮盤"
        >
          <div className="flex items-start justify-start">
            <span className="text-[28px] font-semibold leading-none text-[var(--color-ink)] sm:text-[32px]">
              {result.god}
            </span>
          </div>
          <div className="flex items-start justify-end">
            {result.isEmptyVoid ? (
              <span
                className="text-[28px] leading-none text-[var(--color-ink)] sm:text-[32px]"
                aria-label="空無"
              >
                ○
              </span>
            ) : (
              <span className="invisible text-[28px]">○</span>
            )}
          </div>

          <div className="flex items-center justify-start">
            <span
              className={`text-[30px] font-semibold leading-none sm:text-[36px] ${mark(highlightHeaven)}`}
            >
              {stemText(result.heavenStem, result.needsHeavenChoice)}
            </span>
          </div>
          <div className="flex items-center justify-end text-right">
            <span className="text-[28px] font-medium leading-none text-[var(--color-ink)] sm:text-[32px]">
              {result.star}
            </span>
          </div>

          <div className="flex items-center justify-start">
            <span
              className={`text-[30px] font-semibold leading-none sm:text-[36px] ${mark(highlightEarth)}`}
            >
              {stemText(result.earthStem, result.needsEarthChoice)}
            </span>
          </div>
          <div className="flex items-center justify-end text-right">
            <span
              className={`text-[28px] font-medium leading-none sm:text-[32px] ${mark(highlightDoor)}`}
            >
              {result.door}
            </span>
          </div>

          <div className="col-span-2 flex items-end justify-center pt-2">
            <span className="text-[36px] font-bold leading-none tracking-wide text-[var(--color-ink)] sm:text-[42px]">
              {result.palaceInputDigit} {result.palaceName}
            </span>
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[16px] tracking-[0.28em] text-[var(--color-muted)]">
          {result.normalizedCode}
        </p>
      </div>
    </Card>
  )
}
