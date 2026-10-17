import { useState } from 'react'
import type { PalaceResult, StemChoice } from '@/types/qimen'
import { parseSixCode } from '@/utils/parseCode'
import { isReadyToCalculate, stemChoiceRequirements } from '@/utils/calculatePalace'
import { StemSelector } from '@/components/StemSelector'

type CalcFn = (
  raw: string,
  code: string,
  opts?: { heavenStemChoice?: StemChoice; earthStemChoice?: StemChoice },
) => PalaceResult

export function OppositePalaceInput({
  code,
  onCodeChange,
  onResolved,
  calculate,
}: {
  code: string
  onCodeChange: (v: string) => void
  onResolved: (r: PalaceResult | null) => void
  calculate: CalcFn
}) {
  const [h, setH] = useState<StemChoice | undefined>()
  const [e, setE] = useState<StemChoice | undefined>()
  const [err, setErr] = useState<string | null>(null)

  function tryParse(raw: string, heaven?: StemChoice, earth?: StemChoice) {
    const parsed = parseSixCode(raw)
    if (!parsed.ok) {
      setErr(parsed.error)
      onResolved(null)
      return
    }
    const req = stemChoiceRequirements(parsed.code)
    if (req.needsHeaven && !heaven) {
      onResolved(null)
      return
    }
    if (req.needsEarth && !earth) {
      onResolved(null)
      return
    }
    if (!isReadyToCalculate(parsed.code, heaven, earth)) {
      onResolved(null)
      return
    }
    try {
      onResolved(
        calculate(raw.trim(), parsed.code, {
          heavenStemChoice: heaven,
          earthStemChoice: earth,
        }),
      )
      setErr(null)
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : '解析失敗')
      onResolved(null)
    }
  }

  const parsed = code.trim() ? parseSixCode(code) : null
  const req =
    parsed && parsed.ok
      ? stemChoiceRequirements(parsed.code)
      : { needsHeaven: false, needsEarth: false }

  return (
    <section className="rounded-[16px] bg-white p-4 ring-1 ring-[var(--color-line)]">
      <h3 className="font-semibold">對宮資料（選填）</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        單宮模式涉及對宮時，請輸入對宮六位碼；留空則不推測對宮狀態。
      </p>
      <input
        className="mt-3 w-full rounded-lg border px-3 py-2 font-mono"
        value={code}
        placeholder="對宮六位碼"
        onChange={(ev) => {
          onCodeChange(ev.target.value)
          tryParse(ev.target.value, h, e)
        }}
      />
      {req.needsHeaven && (
        <StemSelector label="對宮天盤干" value={h} onChange={(v) => {
          setH(v)
          tryParse(code, v, e)
        }} />
      )}
      {req.needsEarth && (
        <StemSelector label="對宮地盤干" value={e} onChange={(v) => {
          setE(v)
          tryParse(code, h, v)
        }} />
      )}
      {err && <p className="mt-2 text-sm text-[var(--color-wine)]">{err}</p>}
    </section>
  )
}
