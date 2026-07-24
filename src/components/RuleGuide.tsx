import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function RuleGuide() {
  const [open, setOpen] = useState(false)

  return (
    <section className="card-fade overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[60px] items-center justify-between px-6 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-[28px] font-bold text-[var(--color-ink)]">
          規則說明
        </span>
        <ChevronDown
          className={`h-6 w-6 text-[var(--color-muted)] transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div className="accordion-panel" data-open={open ? 'true' : 'false'}>
        <div>
          <div className="space-y-5 border-t border-[var(--color-line)] px-6 pb-6 pt-5 text-[18px] leading-relaxed text-[var(--color-muted)]">
            <div>
              <p className="mb-1 font-semibold text-[var(--color-ink)]">
                六位順序
              </p>
              <p>宮位 → 八神 → 九星 → 八門 → 天盤干 → 地盤干</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-[var(--color-ink)]">
                字母轉數字
              </p>
              <p>
                AJS=1、BKT=2、CLU=3、DMV=4、ENW=5、FOX=6、GPY=7、HQZ=8、IR=9
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-[var(--color-ink)]">
                天干數字
              </p>
              <p>
                0 為空亡（位置留白並顯示 ○）；1 需選甲／戊／癸；2–9 為乙至壬。
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-[var(--color-ink)]">
                對照與四害
              </p>
              <p className="break-all">
                mappings.ts / harmRules.ts — 僅在設定表有明確規則時判定門迫、擊刑、入墓。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
