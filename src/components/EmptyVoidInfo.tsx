import type { EmptyVoidRemedy } from '../types/qimen'
import { Card } from './Card'

interface EmptyVoidInfoProps {
  remedy: EmptyVoidRemedy | null
  isEmptyVoid: boolean
}

export function EmptyVoidInfo({ remedy, isEmptyVoid }: EmptyVoidInfoProps) {
  if (!isEmptyVoid || !remedy) return null

  return (
    <Card title="補空資訊">
      <div className="border-t border-[var(--color-line)] pt-5">
        {remedy.note && remedy.branches.length === 0 ? (
          <p className="text-[22px] leading-relaxed text-[var(--color-ink)]">
            {remedy.note}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-[18px] text-[var(--color-muted)]">補空：</p>
            <p className="text-[28px] font-semibold leading-snug text-[var(--color-ink)]">
              {remedy.branches.join('、')}
              {remedy.animals.length > 0
                ? `（${remedy.animals.join('、')}）`
                : ''}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
