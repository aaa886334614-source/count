import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  ORIGINAL_PALACE_ORDER,
  ORIGINAL_PALACES,
  type OriginalPalace,
} from '../constants/originalPalaces'
import { Card } from './Card'

interface OriginalPalaceGridProps {
  activePalace?: number | null
}

function branchesText(p: OriginalPalace): string {
  const parts: string[] = []
  if (p.branches.top) parts.push(`上${p.branches.top}`)
  if (p.branches.left) parts.push(`左${p.branches.left}`)
  if (p.branches.right) parts.push(`右${p.branches.right}`)
  if (p.branches.bottom) parts.push(`下${p.branches.bottom}`)
  return parts.join('　') || '—'
}

function PalaceDetailSheet({
  palace,
  onClose,
}: {
  palace: OriginalPalace
  onClose: () => void
}) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const rows: Array<{ label: string; value: string }> = palace.isCenter
    ? [
        { label: '說明', value: '意識奇門原始宮位中心標記' },
      ]
    : [
        { label: '宮位', value: `${palace.number} ${palace.name}` },
        { label: '八神', value: palace.god },
        { label: '九星', value: palace.star },
        { label: '八門', value: palace.door },
        { label: '天干', value: palace.stems },
        { label: '五行', value: palace.element },
        { label: '身體', value: palace.body },
        { label: '時間', value: palace.time },
        { label: '人物', value: palace.person },
        { label: '外圍地支', value: branchesText(palace) },
      ]

  return (
    <div
      className="sheet-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/35 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="palace-detail-title"
      onClick={onClose}
    >
      <div
        className="sheet-panel max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-[24px] bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 shadow-lg sm:rounded-[24px] sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300 sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-[var(--color-muted)]">
              宮位詳情
            </p>
            <h3
              id="palace-detail-title"
              className="mt-0.5 text-[28px] font-extrabold text-[var(--color-ink)]"
            >
              {palace.isCenter
                ? '中宮'
                : `${palace.number} ${palace.name}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-ink)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="mt-4 space-y-0 divide-y divide-[var(--color-line)] rounded-[16px] bg-[var(--color-surface)] px-4">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-3 py-3"
            >
              <dt className="shrink-0 text-[14px] text-[var(--color-muted)]">
                {row.label}
              </dt>
              <dd className="text-right text-[16px] font-medium leading-snug text-[var(--color-ink)]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

function CompactCell({
  palace,
  active,
  dimmed,
  onClick,
}: {
  palace: OriginalPalace
  active: boolean
  dimmed: boolean
  onClick: () => void
}) {
  if (palace.isCenter) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex min-h-[96px] flex-col items-center justify-center rounded-[14px] bg-[var(--color-surface)] px-1.5 py-2 text-center ring-1 ring-[var(--color-line)] ${
          dimmed ? 'opacity-50' : ''
        }`}
      >
        <span className="text-[13px] font-extrabold leading-tight text-[var(--color-ink)]">
          意識奇門
        </span>
        <span className="mt-1 text-[12px] text-[var(--color-muted)]">
          原始宮位
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[96px] flex-col items-center justify-center rounded-[14px] px-1.5 py-2 text-center transition ${
        active
          ? 'bg-[var(--color-wine-soft)] ring-2 ring-[var(--color-wine)]'
          : 'bg-white ring-1 ring-[var(--color-line)]'
      } ${dimmed ? 'opacity-45' : ''}`}
    >
      <span className="text-[11px] leading-none text-[var(--color-muted)]">
        {palace.god}
      </span>
      <span className="mt-1.5 text-[22px] font-extrabold leading-none tracking-tight text-[var(--color-ink)]">
        {palace.number} {palace.name}
      </span>
      <span className="mt-1.5 text-[12px] leading-tight text-[var(--color-muted)]">
        {palace.star}
      </span>
      <span className="mt-0.5 text-[12px] leading-tight text-[var(--color-ink)]">
        {palace.door}
      </span>
    </button>
  )
}

/** 簡潔九宮＋點擊詳情 sheet；不標紅四害 */
export function OriginalPalaceGrid({
  activePalace = null,
}: OriginalPalaceGridProps) {
  const [detailNum, setDetailNum] = useState<number | null>(null)
  const hasActive = activePalace != null
  const detail = detailNum != null ? ORIGINAL_PALACES[detailNum] : null

  return (
    <>
      <Card
        title="意識奇門原始宮位"
        subtitle="先看九宮位置，點選宮位可查看詳細資訊"
      >
        <div className="grid grid-cols-3 gap-2.5">
          {ORIGINAL_PALACE_ORDER.map((num) => {
            const palace = ORIGINAL_PALACES[num]
            const active = hasActive && activePalace === num
            const dimmed = hasActive && !active && !palace.isCenter
            return (
              <CompactCell
                key={num}
                palace={palace}
                active={Boolean(active)}
                dimmed={Boolean(dimmed)}
                onClick={() => setDetailNum(num)}
              />
            )
          })}
        </div>
      </Card>

      {detail && (
        <PalaceDetailSheet
          palace={detail}
          onClose={() => setDetailNum(null)}
        />
      )}
    </>
  )
}
