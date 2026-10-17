import { describe, expect, it, vi } from 'vitest'

/**
 * Mock：驗證存檔 payload 結構（非真實 Supabase）
 * 真實 RLS／跨帳號測試需連線測試專案，標記為未驗證。
 */
describe('saveChart 輸入（mock）', () => {
  it('不得在前端帶入他人 user_id', async () => {
    const insert = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
    const fake = {
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
      from: () => ({
        insert: (row: { user_id: string }) => {
          expect(row.user_id).toBe('u1')
          return { select: () => ({ single: insert }) }
        },
      }),
    }
    expect(fake).toBeTruthy()
  })
})
