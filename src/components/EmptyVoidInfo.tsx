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
      {remedy.note && remedy.branches.length === 0 ? (
        <p className="text-[17px] leading-relaxed text-[var(--color-ink)]">
          {remedy.note}
        </p>
      ) : (
        <div>
          <p className="text-[14px] text-[var(--color-muted)]">補空</p>
          <p className="mt-1 text-[24px] font-bold leading-snug text-[var(--color-ink)]">
            {remedy.branches.join('、')}
            {remedy.animals.length > 0
              ? `（${remedy.animals.join('、')}）`
              : ''}
          </p>
        </div>
      )}
    </Card>
  )
}
