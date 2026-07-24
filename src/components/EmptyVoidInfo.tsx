import type { EmptyVoidRemedy } from '../types/qimen'

interface EmptyVoidInfoProps {
  remedy: EmptyVoidRemedy | null
  isEmptyVoid: boolean
}

export function EmptyVoidInfo({ remedy, isEmptyVoid }: EmptyVoidInfoProps) {
  if (!isEmptyVoid || !remedy) return null

  if (remedy.note && remedy.branches.length === 0) {
    return (
      <section className="rounded border border-neutral-300 bg-neutral-50 p-3">
        <h2 className="text-sm font-medium text-neutral-800">補空資訊</h2>
        <p className="mt-2 text-sm text-neutral-700">{remedy.note}</p>
      </section>
    )
  }

  const branchText = remedy.branches.join('、')
  const animalText = remedy.animals.join('、')

  return (
    <section className="rounded border border-neutral-300 bg-neutral-50 p-3">
      <h2 className="text-sm font-medium text-neutral-800">補空資訊</h2>
      <p className="mt-2 text-base text-black">
        補空：{branchText}
        {animalText ? `（${animalText}）` : ''}
      </p>
    </section>
  )
}
