import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function RuleGuide() {
  const [open, setOpen] = useState(false)

  return (
    <section className="card-fade overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[56px] items-center justify-between px-5 py-4 text-left sm:px-6"
        aria-expanded={open}
      >
        <span className="text-[22px] font-extrabold text-[var(--color-ink)] sm:text-[24px]">
          規則說明
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[var(--color-muted)] transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div className="accordion-panel" data-open={open ? 'true' : 'false'}>
        <div>
          <div className="space-y-4 border-t border-[var(--color-line)] px-5 pb-5 pt-4 text-[15px] leading-relaxed text-[var(--color-muted)] sm:px-6 sm:pb-6">
            <div>
              <p className="mb-1 font-semibold text-[var(--color-ink)]">
                六位順序
              </p>
              <p>宮位 → 八神 → 九星 → 八門 → 天盤干 → 地盤干</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-[var(--color-ink)]">
                0 的位置意義
              </p>
              <p>
                宮位0／5→坤；八神0→沿用宮位數字；九星0→天芮；八門0→死門；僅天／地盤干0→空無。
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-[var(--color-ink)]">
                天干數字
              </p>
              <p>
                第5／6位為0時空無（干位留白並顯示 ○）；為1時需選甲／戊／癸後才排盤；2–9
                為乙至壬。
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-[var(--color-ink)]">
                對照與四害
              </p>
              <p className="break-all">
                mappings.ts／harmRules.ts — 門迫、擊刑、入墓、空無依教材表判定。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
