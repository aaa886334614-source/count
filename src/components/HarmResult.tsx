import type { DetectedHarm } from '../types/qimen'

interface HarmResultProps {
  harms: DetectedHarm[]
}

export function HarmResult({ harms }: HarmResultProps) {
  if (harms.length === 0) {
    return (
      <section className="rounded border border-neutral-300 bg-white p-3">
        <h2 className="text-sm font-medium text-neutral-800">四害判定</h2>
        <p className="mt-2 text-sm text-neutral-600">
          未發現已設定規則中的四害
        </p>
      </section>
    )
  }

  const maxSeverity = Math.max(...harms.map((h) => h.severity))

  return (
    <section className="rounded border border-neutral-300 bg-white p-3">
      <h2 className="text-sm font-medium text-neutral-800">四害判定</h2>
      <ul className="mt-3 space-y-2">
        {harms.map((harm, index) => {
          const highlight = harm.severity === maxSeverity
          return (
            <li
              key={`${harm.type}-${harm.affectedItem}-${index}`}
              className={`rounded border px-3 py-2.5 ${
                highlight
                  ? 'border-red-800 bg-red-50 text-red-900'
                  : 'border-red-200 bg-red-50/60 text-red-800'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-red-900">
                  {harm.type}
                </span>
                <span className="rounded border border-red-800/30 px-1.5 py-0.5 text-[10px] text-red-800">
                  四害
                </span>
              </div>
              <p className="mt-1 text-sm">
                影響項目：{harm.affectedItem}
              </p>
              {harm.remedyBranches.length > 0 && (
                <p className="mt-0.5 text-sm">
                  化解地支：{harm.remedyBranches.join('、')}
                </p>
              )}
              {harm.remedyAnimals.length > 0 && (
                <p className="mt-0.5 text-sm">
                  動物提示：{harm.remedyAnimals.join('、')}
                </p>
              )}
              {harm.description && (
                <p className="mt-1 text-xs opacity-80">{harm.description}</p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
