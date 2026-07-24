import type { PalaceResult } from '../types/qimen'

interface SinglePalaceCardProps {
  result: PalaceResult
}

/**
 * 教材式單宮方格：
 * 左上八神、右上空亡○、左中天盤、右中九星、左下地盤、右下八門、下方中央宮位
 */
export function SinglePalaceCard({ result }: SinglePalaceCardProps) {
  const stemText = (v: string | null, needs: boolean) => {
    if (needs) return '待選'
    return v ?? ''
  }

  return (
    <section className="w-full">
      <h2 className="mb-2 text-sm font-medium text-neutral-800">單宮結果</h2>
      <div className="mx-auto w-full max-w-[320px]">
        <div
          className="relative aspect-square w-full border-2 border-black bg-white"
          style={{ minHeight: 260 }}
        >
          {/* 右上角空亡 ○ */}
          {result.isEmptyVoid && (
            <span
              className="absolute right-3 top-3 text-2xl leading-none text-black"
              aria-label="空亡"
            >
              ○
            </span>
          )}

          {/* 左上：八神 */}
          <div className="absolute left-3 top-3 max-w-[45%] break-words text-base font-medium text-black">
            {result.god}
          </div>

          {/* 左中：天盤干 */}
          <div className="absolute left-3 top-[32%] max-w-[40%] break-words text-xl font-semibold text-black">
            {stemText(result.heavenStem, result.needsHeavenChoice)}
          </div>

          {/* 右中：九星 */}
          <div className="absolute right-3 top-[32%] max-w-[45%] text-right break-words text-base text-black">
            {result.star}
          </div>

          {/* 左下：地盤干 */}
          <div className="absolute bottom-[28%] left-3 max-w-[40%] break-words text-xl font-semibold text-black">
            {stemText(result.earthStem, result.needsEarthChoice)}
          </div>

          {/* 右下：八門 */}
          <div className="absolute bottom-[28%] right-3 max-w-[45%] text-right break-words text-base text-black">
            {result.door}
          </div>

          {/* 下方中央：宮位 */}
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className="text-lg font-semibold tracking-wide text-black">
              {result.palaceNumber} {result.palaceName}
            </span>
          </div>
        </div>
        <p className="mt-2 text-center font-mono text-xs tracking-widest text-neutral-500">
          {result.normalizedCode}
        </p>
      </div>
    </section>
  )
}
