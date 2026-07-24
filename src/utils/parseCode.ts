import type { ParseResult } from '../types/qimen'
import { normalizeInput } from './normalizeInput'

/**
 * 解析六位碼。必須逐位處理，不可當成整數。
 */
export function parseSixCode(raw: string): ParseResult {
  const normalized = normalizeInput(raw)
  if (!normalized.ok) {
    return { ok: false, error: normalized.error ?? '輸入無效。' }
  }

  const code = normalized.value

  if (code.length < 6) {
    return {
      ok: false,
      error: `目前僅 ${code.length} 位，請補足至 6 位後再排盤。`,
    }
  }

  if (code.length > 6) {
    return {
      ok: false,
      error: `目前為 ${code.length} 位，超過 6 位。請刪減至剛好 6 位。`,
    }
  }

  if (code[0] === '0') {
    return {
      ok: false,
      error: '第 1 位宮位不可為 0。請輸入 1–9 的宮位數字。',
    }
  }

  const digits = code.split('') as [
    string,
    string,
    string,
    string,
    string,
    string,
  ]

  return { ok: true, code, digits }
}
