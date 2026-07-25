import type { ParseResult } from '../types/qimen'
import { normalizeInput } from './normalizeInput'

/**
 * 解析六位碼。必須逐位處理，不可當成整數。
 * 第1位可為 0（坤宮）；第2位為 0 時沿用第1位轉換八神。
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

  // 八神為 0 時沿用宮位數字；若宮位亦為 0，不可遞迴
  if (code[1] === '0' && code[0] === '0') {
    return {
      ok: false,
      error:
        '八神為0時需沿用宮位數字，但宮位原始數字同樣為0，無法取得八神。',
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
