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
    <section className="space-y-2">
      <label
        htmlFor="six-code"
        className="block text-sm font-medium text-neutral-800"
      >
        六位碼輸入
      </label>
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
          const text = e.clipboardData.getData('text')
          onChange(text)
        }}
        placeholder="例如 198902 或 AIHZAB"
        className="box-border w-full min-h-[44px] rounded border border-neutral-400 bg-white px-3 py-2 font-mono text-lg tracking-[0.18em] text-black outline-none focus:border-black"
      />
      <p className="text-xs text-neutral-500 break-all">
        正規化預覽：{normalizedPreview || '—'}
      </p>
      <p className="text-xs text-neutral-500 leading-relaxed">
        支援半形／全形數字與英文字母；空白會自動移除。第 1–6 位依序為：宮位、八神、九星、八門、天盤干、地盤干。
      </p>
    </section>
  )
}
