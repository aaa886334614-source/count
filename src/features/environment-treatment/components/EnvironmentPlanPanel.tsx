import type { TreatmentPlan } from '@/domain/qimen/treatments/types'
import { formatRemedyAnimal } from '@/utils/formatRemedyAnimal'

export function EnvironmentPlanPanel({ plan }: { plan: TreatmentPlan }) {
  return (
    <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
      <h3 className="text-lg font-semibold">環境化解方案</h3>
      {plan.oppositeAnalysis.blockedReasons.length > 0 && (
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          對宮：{plan.oppositeAnalysis.blockedReasons.join('；')}
        </p>
      )}
      <ol className="mt-3 list-decimal space-y-3 pl-5">
        {plan.steps.map((s) => (
          <li key={s.id} className="text-[15px]">
            <div className="font-medium">
              {s.harmType} · {s.targetPalaceName}宮
              {s.branch && s.animal
                ? ` · ${formatRemedyAnimal(s.animal)}`
                : ''}
            </div>
            <p className="text-[var(--color-muted)]">{s.purpose}</p>
            {s.prerequisites.length > 0 && (
              <p className="text-xs text-[var(--color-muted)]">
                前置步驟：{s.prerequisites.join(', ')}
              </p>
            )}
            {s.talismanNote && (
              <p className="text-xs text-[var(--color-wine)]">{s.talismanNote}</p>
            )}
          </li>
        ))}
      </ol>
      {plan.unresolved.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-[var(--color-wine)]">
          {plan.unresolved.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
