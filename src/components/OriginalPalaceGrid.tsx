import {
  ORIGINAL_PALACE_ORDER,
  ORIGINAL_PALACES,
  type OriginalPalace,
} from '../constants/originalPalaces'
import { Card } from './Card'

interface OriginalPalaceGridProps {
  /** 標準宮號（用於高亮定位） */
  activePalace?: number | null
}

function BranchMark({
  side,
  label,
}: {
  side: 'top' | 'left' | 'right' | 'bottom'
  label?: string
}) {
  if (!label) return null
  const pos =
    side === 'top'
      ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'
      : side === 'bottom'
        ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'
        : side === 'left'
          ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'
          : 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2'
  return (
    <span
      className={`pointer-events-none absolute z-10 rounded bg-white px-0.5 text-[10px] font-medium text-[var(--color-ink)] sm:text-[11px] ${pos}`}
    >
      {label}
    </span>
  )
}

function PalaceCell({
  palace,
  active,
  dimmed,
}: {
  palace: OriginalPalace
  active: boolean
  dimmed: boolean
}) {
  if (palace.isCenter) {
    return (
      <div
        className={`relative flex aspect-square flex-col items-center justify-center rounded-[10px] bg-[var(--color-surface)] p-1 text-center ring-1 ring-[var(--color-line)] ${
          dimmed ? 'opacity-45' : ''
        } ${active ? 'ring-2 ring-[var(--color-wine)]' : ''}`}
      >
        <p className="text-[11px] font-bold leading-tight text-[var(--color-ink)] sm:text-[13px]">
          意識奇門
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-[var(--color-muted)] sm:text-[12px]">
          原始宮位
        </p>
      </div>
    )
  }

  const cell =
    'flex items-center justify-center break-all px-0.5 text-center leading-tight'

  return (
    <div
      className={`relative aspect-square rounded-[10px] bg-white p-1 ring-1 ${
        active
          ? 'ring-2 ring-[var(--color-wine)] shadow-sm'
          : 'ring-[var(--color-line)]'
      } ${dimmed ? 'opacity-45' : ''}`}
    >
      <BranchMark side="top" label={palace.branches.top} />
      <BranchMark side="left" label={palace.branches.left} />
      <BranchMark side="right" label={palace.branches.right} />
      <BranchMark side="bottom" label={palace.branches.bottom} />

      <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-px overflow-hidden rounded-[6px] bg-[var(--color-line)]">
        <div className={`${cell} bg-white text-[9px] text-[var(--color-muted)] sm:text-[10px]`}>
          {palace.god}
        </div>
        <div className={`${cell} bg-white`}>
          <span className="text-[12px] font-bold text-[var(--color-ink)] sm:text-[14px]">
            {palace.number}
            {palace.name}
          </span>
        </div>
        <div className={`${cell} bg-white text-[9px] text-[var(--color-muted)] sm:text-[10px]`}>
          {palace.star}
        </div>
        <div className={`${cell} bg-white text-[9px] sm:text-[10px]`}>
          {palace.element}
        </div>
        <div className={`${cell} bg-white text-[9px] sm:text-[10px]`}>
          {palace.stems}
        </div>
        <div className={`${cell} bg-white text-[9px] sm:text-[10px]`}>
          {palace.door}
        </div>
        <div className={`${cell} bg-white text-[8px] text-[var(--color-muted)] sm:text-[9px]`}>
          {palace.body}
        </div>
        <div className={`${cell} bg-white text-[8px] text-[var(--color-muted)] sm:text-[9px]`}>
          {palace.time}
        </div>
        <div className={`${cell} bg-white text-[9px] sm:text-[10px]`}>
          {palace.person}
        </div>
      </div>
    </div>
  )
}

/** 教材固定參考圖：僅高亮宮位，不標紅此次排盤四害 */
export function OriginalPalaceGrid({
  activePalace = null,
}: OriginalPalaceGridProps) {
  const hasActive = activePalace != null

  return (
    <Card title="意識奇門原始宮位">
      <div className="mx-auto w-full max-w-[640px]">
        <div className="grid aspect-square w-full grid-cols-3 grid-rows-3 gap-1.5 sm:gap-2">
          {ORIGINAL_PALACE_ORDER.map((num) => {
            const palace = ORIGINAL_PALACES[num]
            const active = hasActive && activePalace === num
            const dimmed = hasActive && !active && !palace.isCenter
            return (
              <PalaceCell
                key={num}
                palace={palace}
                active={Boolean(active)}
                dimmed={Boolean(dimmed)}
              />
            )
          })}
        </div>
        <p className="mt-4 text-center text-[14px] text-[var(--color-muted)] sm:text-[16px]">
          巽｜離｜坤　／　震｜中｜兌　／　艮｜坎｜乾
        </p>
      </div>
    </Card>
  )
}
