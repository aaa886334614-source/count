import { NINE_PALACE_ORDER, PALACE_MAP } from '../constants/mappings'

interface NinePalaceGridProps {
  activePalace?: number | null
}

export function NinePalaceGrid({ activePalace = null }: NinePalaceGridProps) {
  return (
    <section className="w-full">
      <h2 className="mb-2 text-sm font-medium text-neutral-800">完整九宮</h2>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {NINE_PALACE_ORDER.map((num) => {
          const name = PALACE_MAP[String(num)]
          const active = activePalace === num
          return (
            <div
              key={num}
              className={`flex min-h-[64px] flex-col items-center justify-center border px-1 py-2 text-center ${
                active
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-400 bg-white text-black'
              }`}
            >
              <span className="text-sm font-medium">
                {num} {name}
              </span>
              {active && (
                <span className="mt-0.5 text-[10px] tracking-wider opacity-80">
                  本盤
                </span>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        4 巽｜9 離｜2 坤　／　3 震｜5 中｜7 兌　／　8 艮｜1 坎｜6 乾
      </p>
    </section>
  )
}
