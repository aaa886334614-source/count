import { STEM_CHOICES } from '../constants/mappings'
import type { StemChoice } from '../types/qimen'

interface StemSelectorProps {
  label: string
  value?: StemChoice
  onChange: (value: StemChoice) => void
}

export function StemSelector({ label, value, onChange }: StemSelectorProps) {
  return (
    <section className="space-y-2 rounded border border-neutral-300 bg-neutral-50 p-3">
      <h3 className="text-sm font-medium text-neutral-900">{label}</h3>
      <p className="text-xs text-neutral-500">
        數字為 1，請選擇甲、戊或癸後才能完成排盤。
      </p>
      <div className="grid grid-cols-3 gap-2">
        {STEM_CHOICES.map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`min-h-[44px] rounded border text-base font-medium transition-colors ${
                active
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-400 bg-white text-black hover:border-black'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </section>
  )
}
