import { RuleGuide } from '@/components/RuleGuide'
import { HarmResult } from '@/components/HarmResult'
import { calculatePalace } from '@/utils/calculatePalace'

const samples = ['358796', '602504', '811172', '611122']

export function HarmQuickPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">四害快速查詢</h1>
      <p className="text-[var(--color-muted)]">教材規則範例（自動計算四害，不含環境順序）。</p>
      {samples.map((code) => {
        const r = calculatePalace(code, code)
        return (
          <div key={code} className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
            <div className="font-mono font-semibold">{code}</div>
            <HarmResult harms={r.harms} />
          </div>
        )
      })}
      <RuleGuide />
    </section>
  )
}
