import { FULLWIDTH_DIGIT_MAP, LETTER_TO_NUMBER } from '../constants/mappings'

/**
 * 將單一英文字母轉為數字字元。
 * 規則：A/J/S→1 … I/R→9
 */
export function letterToNumber(ch: string): string | null {
  if (ch.length !== 1) return null
  const key = ch.toUpperCase()
  return LETTER_TO_NUMBER[key] ?? null
}

/**
 * 正規化輸入：
 * - 去除前後與中間空白
 * - 全形數字 → 半形
 * - 英文字母 → 對應數字
 * - 保留半形數字
 */
export function normalizeInput(raw: string): {
  ok: boolean
  value: string
  error?: string
} {
  const noSpace = raw.replace(/\s+/g, '')
  if (!noSpace) {
    return { ok: false, value: '', error: '請輸入六位碼。' }
  }

  let value = ''
  for (const ch of noSpace) {
    if (/[0-9]/.test(ch)) {
      value += ch
      continue
    }
    if (FULLWIDTH_DIGIT_MAP[ch]) {
      value += FULLWIDTH_DIGIT_MAP[ch]
      continue
    }
    if (/[a-zA-Z]/.test(ch)) {
      const n = letterToNumber(ch)
      if (!n) {
        return {
          ok: false,
          value: '',
          error: `英文字母「${ch}」無法轉換，請檢查輸入。`,
        }
      }
      value += n
      continue
    }
    return {
      ok: false,
      value: '',
      error: `含有無法辨識的字元「${ch}」。請只輸入數字或英文字母 A–Z。`,
    }
  }

  return { ok: true, value }
}
