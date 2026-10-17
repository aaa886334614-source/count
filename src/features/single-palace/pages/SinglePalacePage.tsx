import { useEffect, useMemo, useState } from 'react'
import { SaveChartDialog } from '@/features/chart-history/components/SaveChartDialog'
import {
  buildSinglePalaceSaveInput,
  defaultSinglePalaceTitle,
} from '@/features/chart-history/services/buildSavePayload'
import { useResumePendingSave } from '@/features/chart-history/hooks/useResumePendingSave'
import type { HistoryRecord, PalaceResult, StemChoice } from '@/types/qimen'
import { normalizeInput } from '@/utils/normalizeInput'
import { parseSixCode } from '@/utils/parseCode'
import {
  calculatePalace,
  isReadyToCalculate,
  stemChoiceRequirements,
} from '@/utils/calculatePalace'
import { useHistory } from '@/hooks/useHistory'
import { CodeInput } from '@/components/CodeInput'
import { StemSelector } from '@/components/StemSelector'
import { SinglePalaceCard } from '@/components/SinglePalaceCard'
import { OriginalPalaceGrid } from '@/components/OriginalPalaceGrid'
import { EmptyVoidInfo } from '@/components/EmptyVoidInfo'
import { HarmResult } from '@/components/HarmResult'
import { HistoryList } from '@/components/HistoryList'
import { RuleGuide } from '@/components/RuleGuide'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { SavePrompt } from '@/components/SavePrompt'
import { recalculateHistoryRecord } from '@/utils/recalculateHistory'
import { EnvironmentPlanPanel } from '@/features/environment-treatment/components/EnvironmentPlanPanel'
import type { EmptyVoidFieldState } from '@/domain/qimen/treatments/types'
import { OppositePalaceInput } from '@/features/palace-analysis/components/OppositePalaceInput'
import {
  buildEnvironmentActions,
  palaceContextFromResult,
} from '@/domain/qimen/treatments/buildEnvironmentActions'
import { calculatePalace as calc } from '@/utils/calculatePalace'

type SingleWorkspace = {
  input: string
  result: PalaceResult
  heavenChoice?: StemChoice
  earthChoice?: StemChoice
  emptyVoidField: EmptyVoidFieldState
  oppositeCode: string
  oppositeResult: PalaceResult | null
}

export function SinglePalacePage() {
  const { pending, shouldOpenSave, consumeWorkspace, clearResume } =
    useResumePendingSave('/single-palace')
  const [saveOpen, setSaveOpen] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PalaceResult | null>(null)
  const [pendingRaw, setPendingRaw] = useState('')
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const [heavenChoice, setHeavenChoice] = useState<StemChoice | undefined>()
  const [earthChoice, setEarthChoice] = useState<StemChoice | undefined>()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [emptyVoidField, setEmptyVoidField] =
    useState<EmptyVoidFieldState>('unknown')
  const [oppositeCode, setOppositeCode] = useState('')
  const [oppositeResult, setOppositeResult] = useState<PalaceResult | null>(
    null,
  )

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

  useEffect(() => {
    const ws = consumeWorkspace<SingleWorkspace>()
    if (ws?.result) {
      setInput(ws.input)
      setResult(ws.result)
      setHeavenChoice(ws.heavenChoice)
      setEarthChoice(ws.earthChoice)
      setEmptyVoidField(ws.emptyVoidField)
      setOppositeCode(ws.oppositeCode)
      setOppositeResult(ws.oppositeResult)
      clearResume()
    }
  }, [pending])

  useEffect(() => {
    if (shouldOpenSave) setSaveOpen(true)
  }, [shouldOpenSave])

  const treatmentPlan = useMemo(() => {
    if (!result) return null
    return buildEnvironmentActions({
      self: palaceContextFromResult(result),
      opposite: oppositeResult
        ? palaceContextFromResult(oppositeResult)
        : null,
      emptyVoidField,
    })
  }, [result, oppositeResult, emptyVoidField])

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
    setEmptyVoidField('unknown')
    setOppositeCode('')
    setOppositeResult(null)
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
    setEmptyVoidField('unknown')

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
    const fresh = recalculateHistoryRecord(record)
    setInput(fresh.rawInput)
    setHeavenChoice(fresh.heavenStemChoice)
    setEarthChoice(fresh.earthStemChoice)
    setPendingCode(null)
    setPendingRaw('')
    setActiveId(fresh.id)
    setJustSaved(true)
    setSaveChecked(true)
    setSaveNote(fresh.note ?? '')
    setError(
      fresh.dataIncomplete
        ? '此筆歷史缺甲／戊／癸選擇，無法完整重算。'
        : null,
    )
    const next = runCalculate(
      fresh.rawInput,
      fresh.normalizedCode,
      fresh.heavenStemChoice,
      fresh.earthStemChoice,
    )
    if (next) setResult(next)
  }

  const showFullResult = Boolean(result)
  const showStemPickers =
    Boolean(pendingCode) &&
    (pendingReqs.needsHeaven || pendingReqs.needsEarth) &&
    !showFullResult

  return (
    <>
      <header className="card-fade space-y-2 px-0.5">
        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight sm:text-[36px]">
          六位數單宮斷
        </h1>
        <p className="text-[15px] leading-relaxed text-[var(--color-muted)] sm:text-[16px]">
          輸入六位碼解析單宮與四害；可補對宮資料以產生環境處理順序。
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

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-press h-[52px] w-full rounded-[16px] bg-[var(--color-wine)] text-[18px] font-semibold text-white sm:h-[56px] sm:text-[20px]"
        >
          開始排盤
        </button>
        {(result || pendingCode) && (
          <button
            type="button"
            onClick={handleReset}
            className="btn-press h-[48px] w-full rounded-[16px] bg-white text-[16px] font-medium ring-1 ring-[var(--color-line)]"
          >
            重新排盤
          </button>
        )}
      </div>

      {error && (
        <p className="card-fade break-words rounded-[16px] bg-[var(--color-wine-soft)] px-4 py-3.5 text-[15px] text-[var(--color-wine)]">
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
          {result.isEmptyVoid && (
            <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
              <h3 className="font-semibold">空無現場確認</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ['unknown', '尚未確認'],
                    ['falseEmpty', '假空（雜物多）'],
                    ['trueEmpty', '真空'],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    className={`rounded-lg px-3 py-1.5 text-sm ${emptyVoidField === v ? 'bg-[var(--color-wine)] text-white' : 'border'}`}
                    onClick={() => setEmptyVoidField(v)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          )}
          <OppositePalaceInput
            code={oppositeCode}
            onCodeChange={setOppositeCode}
            onResolved={setOppositeResult}
            calculate={calc}
          />
          <HarmResult harms={result.harms} />
          {treatmentPlan && <EnvironmentPlanPanel plan={treatmentPlan} />}
          <button
            type="button"
            className="btn-press h-12 w-full rounded-[16px] border font-medium"
            onClick={() => setSaveOpen(true)}
          >
            儲存盤面（雲端）
          </button>
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

      <SaveChartDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        defaultTitle={
          result
            ? defaultSinglePalaceTitle(result.normalizedCode)
            : '六位數單宮'
        }
        returnPath="/single-palace"
        workspaceState={
          result
            ? ({
                input,
                result,
                heavenChoice,
                earthChoice,
                emptyVoidField,
                oppositeCode,
                oppositeResult,
              } satisfies SingleWorkspace)
            : undefined
        }
        buildSaveInput={() => {
          if (!result) return null
          return buildSinglePalaceSaveInput({
            title: defaultSinglePalaceTitle(result.normalizedCode),
            rawInput: result.rawInput,
            normalizedCode: result.normalizedCode,
            heavenStemChoice: result.heavenStemChoice,
            earthStemChoice: result.earthStemChoice,
            palaceResult: result,
            emptyVoidField,
            oppositePalaceResult: oppositeResult,
            oppositeInputCode: oppositeCode,
            treatmentPlan: treatmentPlan ?? null,
          })
        }}
      />
    </>
  )
}
