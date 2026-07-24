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
import { SavePrompt } from './components/SavePrompt'

export default function App() {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PalaceResult | null>(null)
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

  const resetSavePrompt = () => {
    setSaveChecked(false)
    setSaveNote('')
    setJustSaved(false)
    setActiveId(null)
  }

  const handleSubmit = () => {
    const parsed = parseSixCode(input)
    if (!parsed.ok) {
      setError(parsed.error)
      setResult(null)
      resetSavePrompt()
      return
    }

    setHeavenChoice(undefined)
    setEarthChoice(undefined)
    resetSavePrompt()

    const next = rebuild(input.trim(), parsed.code)
    setResult(next)

    if (!next.needsHeavenChoice && !next.needsEarthChoice) {
      setError(null)
    } else {
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
    // 不自動寫入歷史；僅更新畫面上的結果
    setJustSaved(false)
    setActiveId(null)
  }

  const handleHeaven = (v: StemChoice) => {
    setHeavenChoice(v)
    applyChoice(v, earthChoice)
  }

  const handleEarth = (v: StemChoice) => {
    setEarthChoice(v)
    applyChoice(heavenChoice, v)
  }

  const handleSave = () => {
    if (!result || !saveChecked) return
    if (result.needsHeavenChoice || result.needsEarthChoice) return
    const record = addFromResult(result, saveNote)
    setActiveId(record.id)
    setJustSaved(true)
  }

  const handleLoad = (record: HistoryRecord) => {
    setInput(record.rawInput)
    setHeavenChoice(record.heavenStemChoice)
    setEarthChoice(record.earthStemChoice)
    setActiveId(record.id)
    setJustSaved(true)
    setSaveChecked(true)
    setSaveNote(record.note ?? '')
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
    <div className="min-h-screen bg-[#fafafa] text-[var(--color-ink)]">
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <header className="card-fade space-y-3 px-1">
          <h1 className="text-[40px] font-bold leading-tight tracking-tight text-[var(--color-ink)]">
            奇門遁甲六位數字單宮排盤
          </h1>
          <p className="text-[18px] leading-relaxed text-[var(--color-muted)]">
            輸入六位碼，解析單宮神、星、門、干與空亡補法。資料僅存於本機。
          </p>
          {!storageOk && (
            <p className="text-[18px] text-[var(--color-wine)]">
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

        {result &&
          (result.heavenStemDigit === '1' || result.earthStemDigit === '1') && (
            <div className="flex flex-col gap-6">
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
          className="btn-press h-[60px] w-full rounded-[16px] bg-[var(--color-wine)] text-[22px] font-semibold text-white"
        >
          開始排盤
        </button>

        {error && (
          <p className="card-fade break-words rounded-[20px] bg-[var(--color-wine-soft)] px-6 py-4 text-[18px] text-[var(--color-wine)]">
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

        <NinePalaceGrid
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
        />

        <RuleGuide />

        <footer className="px-1 pb-4 text-[16px] leading-relaxed text-[var(--color-muted)]">
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
