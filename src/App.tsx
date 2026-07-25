import { useMemo, useState } from 'react'
import type { HistoryRecord, PalaceResult, StemChoice } from './types/qimen'
import { normalizeInput } from './utils/normalizeInput'
import { parseSixCode } from './utils/parseCode'
import {
  calculatePalace,
  isReadyToCalculate,
  stemChoiceRequirements,
} from './utils/calculatePalace'
import { useHistory } from './hooks/useHistory'
import { CodeInput } from './components/CodeInput'
import { StemSelector } from './components/StemSelector'
import { SinglePalaceCard } from './components/SinglePalaceCard'
import { OriginalPalaceGrid } from './components/OriginalPalaceGrid'
import { EmptyVoidInfo } from './components/EmptyVoidInfo'
import { HarmResult } from './components/HarmResult'
import { HistoryList } from './components/HistoryList'
import { RuleGuide } from './components/RuleGuide'
import { ConfirmDialog } from './components/ConfirmDialog'
import { SavePrompt } from './components/SavePrompt'

export default function App() {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PalaceResult | null>(null)
  const [pendingRaw, setPendingRaw] = useState('')
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const [heavenChoice, setHeavenChoice] = useState<StemChoice | undefined>()
  const [earthChoice, setEarthChoice] = useState<StemChoice | undefined>()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const [saveChecked, setSaveChecked] = useState(false)
  const [saveNote, setSaveNote] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  const {
    records,
    storageOk,
    addFromResult,
    updateRecord,
    removeRecord,
    clearAll,
    toggleFavorite,
  } = useHistory()

  const normalizedPreview = useMemo(() => {
    const n = normalizeInput(input)
    return n.ok ? n.value : ''
  }, [input])

  const pendingReqs = pendingCode
    ? stemChoiceRequirements(pendingCode)
    : { needsHeaven: false, needsEarth: false }

  const resetSavePrompt = () => {
    setSaveChecked(false)
    setSaveNote('')
    setJustSaved(false)
    setActiveId(null)
  }

  const clearPending = () => {
    setPendingCode(null)
    setPendingRaw('')
    setHeavenChoice(undefined)
    setEarthChoice(undefined)
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    clearPending()
    resetSavePrompt()
  }

  const runCalculate = (
    raw: string,
    code: string,
    h?: StemChoice,
    e?: StemChoice,
  ) => {
    if (!isReadyToCalculate(code, h, e)) return null
    return calculatePalace(raw, code, {
      heavenStemChoice: h,
      earthStemChoice: e,
    })
  }

  const handleSubmit = () => {
    const parsed = parseSixCode(input)
    if (!parsed.ok) {
      setError(parsed.error)
      setResult(null)
      clearPending()
      resetSavePrompt()
      return
    }

    resetSavePrompt()
    setHeavenChoice(undefined)
    setEarthChoice(undefined)

    const { needsHeaven, needsEarth } = stemChoiceRequirements(parsed.code)
    if (needsHeaven || needsEarth) {
      setPendingRaw(input.trim())
      setPendingCode(parsed.code)
      setResult(null)
      setError('請先完成甲／戊／癸選擇，再完成排盤。')
      return
    }

    clearPending()
    const next = runCalculate(input.trim(), parsed.code)
    if (!next) return
    setResult(next)
    setError(null)
  }

  const tryFinishWithChoices = (h?: StemChoice, e?: StemChoice) => {
    if (!pendingCode) return
    if (!isReadyToCalculate(pendingCode, h, e)) {
      setResult(null)
      setError('請先完成甲／戊／癸選擇，再完成排盤。')
      return
    }
    const next = runCalculate(pendingRaw || pendingCode, pendingCode, h, e)
    if (!next) return
    setResult(next)
    setError(null)
    setJustSaved(false)
    setActiveId(null)
  }

  const handleHeaven = (v: StemChoice) => {
    setHeavenChoice(v)
    tryFinishWithChoices(v, earthChoice)
  }

  const handleEarth = (v: StemChoice) => {
    setEarthChoice(v)
    tryFinishWithChoices(heavenChoice, v)
  }

  const handleSave = () => {
    if (!result || !saveChecked || justSaved || activeId) return
    const record = addFromResult(result, saveNote)
    setActiveId(record.id)
    setJustSaved(true)
  }

  const handleLoad = (record: HistoryRecord) => {
    setInput(record.rawInput)
    setHeavenChoice(record.heavenStemChoice)
    setEarthChoice(record.earthStemChoice)
    setPendingCode(null)
    setPendingRaw('')
    setActiveId(record.id)
    setJustSaved(true)
    setSaveChecked(true)
    setSaveNote(record.note ?? '')
    setError(null)
    const next = runCalculate(
      record.rawInput,
      record.normalizedCode,
      record.heavenStemChoice,
      record.earthStemChoice,
    )
    if (next) setResult(next)
  }

  const showFullResult = Boolean(result)
  const showStemPickers =
    Boolean(pendingCode) &&
    (pendingReqs.needsHeaven || pendingReqs.needsEarth) &&
    !showFullResult

  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] sm:gap-7 sm:px-6 sm:pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:pt-[calc(2.5rem+env(safe-area-inset-top))]">
        <header className="card-fade space-y-3 px-1">
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[var(--color-ink)] sm:text-[36px]">
            奇門遁甲六位數字單宮排盤
          </h1>
          <p className="text-[16px] leading-relaxed text-[var(--color-muted)] sm:text-[18px]">
            輸入六位碼，解析單宮神、星、門、干與四害。資料僅存於本機。
          </p>
          {!storageOk && (
            <p className="text-[16px] text-[var(--color-wine)]">
              目前無法寫入 localStorage，歷史紀錄可能無法保存。
            </p>
          )}
        </header>

        <CodeInput
          value={input}
          onChange={(v) => {
            setInput(v)
            setError(null)
          }}
          normalizedPreview={normalizedPreview}
        />

        {showStemPickers && pendingCode && (
          <div className="flex flex-col gap-6">
            {pendingReqs.needsHeaven && (
              <StemSelector
                label="天盤干選擇"
                value={heavenChoice}
                onChange={handleHeaven}
              />
            )}
            {pendingReqs.needsEarth && (
              <StemSelector
                label="地盤干選擇"
                value={earthChoice}
                onChange={handleEarth}
              />
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-press h-[56px] w-full rounded-[16px] bg-[var(--color-wine)] text-[20px] font-semibold text-white sm:h-[60px] sm:text-[22px]"
          >
            開始排盤
          </button>
          {(result || pendingCode) && (
            <button
              type="button"
              onClick={handleReset}
              className="btn-press h-[56px] w-full rounded-[16px] bg-[var(--color-surface)] text-[18px] font-medium text-[var(--color-ink)] ring-1 ring-[var(--color-line)]"
            >
              重新排盤
            </button>
          )}
        </div>

        {error && (
          <p className="card-fade break-words rounded-[20px] bg-[var(--color-wine-soft)] px-6 py-4 text-[16px] text-[var(--color-wine)] sm:text-[18px]">
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
            <SavePrompt
              checked={saveChecked}
              note={saveNote}
              saved={justSaved || Boolean(activeId)}
              onCheckedChange={setSaveChecked}
              onNoteChange={setSaveNote}
              onSave={handleSave}
            />
          </>
        )}

        <OriginalPalaceGrid
          activePalace={showFullResult ? result?.palaceNumber : null}
        />

        <HistoryList
          records={records}
          onSelect={handleLoad}
          onDelete={removeRecord}
          onClearAll={() => setConfirmClear(true)}
          onUpdateNote={(id, note) =>
            updateRecord(id, { note: note || undefined })
          }
          onToggleFavorite={toggleFavorite}
        />

        <RuleGuide />

        <footer className="px-1 pb-2 text-[14px] leading-relaxed text-[var(--color-muted)] sm:text-[16px]">
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
