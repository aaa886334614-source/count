import { Card } from './Card'

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  normalizedPreview: string
}

export function CodeInput({
  value,
  onChange,
  normalizedPreview,
}: CodeInputProps) {
  return (
    <Card title="六位碼輸入">
      <input
        id="six-code"
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          e.preventDefault()
          onChange(e.clipboardData.getData('text'))
        }}
        placeholder="例如 198902"
        className="box-border h-[60px] w-full rounded-[16px] border-0 bg-[var(--color-surface)] px-4 text-center font-mono text-[28px] tracking-[0.35em] text-[var(--color-ink)] outline-none ring-1 ring-[var(--color-line)] placeholder:tracking-normal placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-[var(--color-wine)]"
      />
      <p className="mt-4 break-all text-center text-[18px] text-[var(--color-muted)]">
        正規化：{normalizedPreview || '—'}
      </p>
      <p className="mt-3 text-[18px] leading-relaxed text-[var(--color-muted)]">
        支援半形／全形數字與英文字母。順序：宮位、八神、九星、八門、天盤干、地盤干。
      </p>
    </Card>
  )
}
