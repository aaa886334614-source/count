import { STEM_CHOICES } from '../constants/mappings'
import type { StemChoice } from '../types/qimen'
import { Card } from './Card'

interface StemSelectorProps {
  label: string
  value?: StemChoice
  onChange: (value: StemChoice) => void
}

export function StemSelector({ label, value, onChange }: StemSelectorProps) {
  return (
    <Card title={label}>
      <p className="mb-4 text-[18px] text-[var(--color-muted)]">
        數字為 1，請選擇甲、戊或癸後才能完成排盤。
      </p>
      <div className="grid grid-cols-3 gap-3">
        {STEM_CHOICES.map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`btn-press h-[60px] rounded-[16px] text-[22px] font-semibold ${
                active
                  ? 'bg-[var(--color-wine)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink)] ring-1 ring-[var(--color-line)]'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
