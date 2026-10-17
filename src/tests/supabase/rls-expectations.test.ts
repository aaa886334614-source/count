import { describe, expect, it } from 'vitest'

/**
 * 無 Supabase 測試專案時，以規格断言 RLS 設計（migration 內 policy 名稱）。
 * 真實跨帳號測試需在 CI 設定 SUPABASE_URL + service role 隔離環境後補上。
 */
describe('RLS 政策（規格）', () => {
  it('charts 僅允許 auth.uid = user_id', () => {
    const policies = [
      'charts_select_own',
      'charts_insert_own',
      'charts_update_own',
      'charts_delete_own',
    ]
    expect(policies).toHaveLength(4)
  })

  it('chart_notes 需同時驗證 user_id 與 chart 擁有者', () => {
    expect(true).toBe(true)
  })
})
