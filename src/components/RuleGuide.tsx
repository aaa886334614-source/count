import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function RuleGuide() {
  const [open, setOpen] = useState(false)

  return (
    <section className="rounded border border-neutral-300 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[44px] items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-sm font-medium text-neutral-800">規則說明</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-neutral-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-600" />
        )}
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-200 px-3 py-3 text-sm leading-relaxed text-neutral-700">
          <div>
            <p className="font-medium text-black">六位順序</p>
            <p>宮位 → 八神 → 九星 → 八門 → 天盤干 → 地盤干</p>
          </div>
          <div>
            <p className="font-medium text-black">字母轉數字</p>
            <p>
              AJS=1、BKT=2、CLU=3、DMV=4、ENW=5、FOX=6、GPY=7、HQZ=8、IR=9
            </p>
          </div>
          <div>
            <p className="font-medium text-black">天干數字</p>
            <p>
              0 為空亡（位置留白並顯示 ○）；1 需選甲／戊／癸；2–9 為乙至壬。
            </p>
          </div>
          <div>
            <p className="font-medium text-black">對照表檔案</p>
            <p className="break-all">src/constants/mappings.ts</p>
          </div>
          <div>
            <p className="font-medium text-black">四害規則檔案</p>
            <p className="break-all">src/constants/harmRules.ts</p>
            <p className="mt-1">
              門迫、擊刑、入墓僅在設定表有明確規則時判定；空亡依數字 0 判斷。
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
