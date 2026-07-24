import { useMemo, useState } from 'react'
import type { HistoryRecord, PalaceResult, StemChoice } from './types/qimen'
import { normalizeInput } from './utils/normalizeInput'
import { parseSixCode } from './utils/parseCode'
import { calculatePalace } from './utils/calculatePalace'
import { useHistory } from './hooks/useHistory'
import { CodeInput } from './components/CodeInput'
import { StemSelector } from './components/StemSelector'
import { SinglePalaceCard } from './components/SinglePalaceCard'
import { NinePalaceGrid } from './components/NinePalaceGrid'
import { EmptyVoidInfo } from './components/EmptyVoidInfo'
import { HarmResult } from './components/HarmResult'
import { HistoryList } from './components/HistoryList'
import { RuleGuide } from './components/RuleGuide'
import { ConfirmDialog } from './components/ConfirmDialog'

export default function App() {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PalaceResult | null>(null)
  const [heavenChoice, setHeavenChoice] = useState<StemChoice | undefined>()
  const [earthChoice, setEarthChoice] = useState<StemChoice | undefined>()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const {
    records,
    storageOk,
    addFromResult,
    updateRecord,
    removeRecord,
    clearAll,
  } = useHistory()

  const normalizedPreview = useMemo(() => {
    const n = normalizeInput(input)
    return n.ok ? n.value : ''
  }, [input])

  const rebuild = (
    raw: string,
    code: string,
    h?: StemChoice,
    e?: StemChoice,
  ) => calculatePalace(raw, code, { heavenStemChoice: h, earthStemChoice: e })

  const handleSubmit = () => {
    const parsed = parseSixCode(input)
    if (!parsed.ok) {
      setError(parsed.error)
      setResult(null)
      setActiveId(null)
      return
    }

    setHeavenChoice(undefined)
    setEarthChoice(undefined)

    const next = rebuild(input.trim(), parsed.code)
    setResult(next)
    setError(null)

    if (!next.needsHeavenChoice && !next.needsEarthChoice) {
      const record = addFromResult(next)
      setActiveId(record.id)
    } else {
      setActiveId(null)
      setError('請先完成甲／戊／癸選擇，再完成排盤。')
    }
  }

  const applyChoice = (h?: StemChoice, e?: StemChoice) => {
    if (!result) return
    const next = rebuild(result.rawInput, result.normalizedCode, h, e)
    setResult(next)

    if (next.needsHeavenChoice || next.needsEarthChoice) {
      setError('請先完成甲／戊／癸選擇，再完成排盤。')
      return
    }

    setError(null)
    if (activeId) {
      updateRecord(activeId, {
        heavenStem: next.heavenStem,
        earthStem: next.earthStem,
        heavenStemChoice: h,
        earthStemChoice: e,
        isEmptyVoid: next.isEmptyVoid,
        emptyVoidRemedy: next.emptyVoidRemedy,
        harms: next.harms,
      })
    } else {
      const record = addFromResult(next)
      setActiveId(record.id)
    }
  }

  const handleHeaven = (v: StemChoice) => {
    setHeavenChoice(v)
    applyChoice(v, earthChoice)
  }

  const handleEarth = (v: StemChoice) => {
    setEarthChoice(v)
    applyChoice(heavenChoice, v)
  }

  const handleLoad = (record: HistoryRecord) => {
    setInput(record.rawInput)
    setHeavenChoice(record.heavenStemChoice)
    setEarthChoice(record.earthStemChoice)
    setActiveId(record.id)
    setError(null)
    setResult(
      rebuild(
        record.rawInput,
        record.normalizedCode,
        record.heavenStemChoice,
        record.earthStemChoice,
      ),
    )
  }

  const showFullResult =
    result && !result.needsHeavenChoice && !result.needsEarthChoice

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto w-full max-w-[720px] px-4 py-6 sm:py-8">
        <header className="mb-6 border-b border-neutral-300 pb-4">
          <h1 className="text-2xl font-semibold tracking-wide sm:text-3xl">
            奇門遁甲六位數字單宮排盤
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            輸入六位碼，依教材規則解析單宮：八神、九星、八門、天地盤干，並顯示空亡補法與已設定之四害。資料僅存於本機瀏覽器。
          </p>
          {!storageOk && (
            <p className="mt-2 text-sm text-red-900">
              目前無法寫入 localStorage，歷史紀錄可能無法保存。
            </p>
          )}
        </header>

        <div className="space-y-5">
          <CodeInput
            value={input}
            onChange={(v) => {
              setInput(v)
              setError(null)
            }}
            normalizedPreview={normalizedPreview}
          />

          {result && (result.heavenStemDigit === '1' || result.earthStemDigit === '1') && (
            <div className="space-y-3">
              {result.heavenStemDigit === '1' && (
                <StemSelector
                  label="天盤干選擇"
                  value={heavenChoice}
                  onChange={handleHeaven}
                />
              )}
              {result.earthStemDigit === '1' && (
                <StemSelector
                  label="地盤干選擇"
                  value={earthChoice}
                  onChange={handleEarth}
                />
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full min-h-[44px] rounded border border-black bg-black text-base font-medium text-white hover:bg-neutral-800"
          >
            開始排盤
          </button>

          {error && (
            <p className="break-words rounded border border-red-800 bg-red-50 px-3 py-2 text-sm text-red-900">
              {error}
            </p>
          )}

          {showFullResult && result && (
            <>
              <SinglePalaceCard result={result} />
              <EmptyVoidInfo
                isEmptyVoid={result.isEmptyVoid}
                remedy={result.emptyVoidRemedy}
              />
              <HarmResult harms={result.harms} />
            </>
          )}

          <NinePalaceGrid
            activePalace={showFullResult ? result?.palaceNumber : null}
          />

          <HistoryList
            records={records}
            onSelect={handleLoad}
            onDelete={removeRecord}
            onClearAll={() => setConfirmClear(true)}
          />

          <RuleGuide />
        </div>

        <footer className="mt-8 border-t border-neutral-300 pt-4 text-xs leading-relaxed text-neutral-500">
          本工具僅依目前輸入之教材規則呈現，請以實際教材與老師說明為準。
        </footer>
      </main>

      <ConfirmDialog
        open={confirmClear}
        title="清除全部歷史紀錄"
        message="確定要清除全部歷史紀錄嗎？此操作無法復原。"
        confirmLabel="確定清除"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll()
          setConfirmClear(false)
        }}
      />
    </div>
  )
}
