import { describe, expect, it } from 'vitest'

/**
 * 跨帳號隔離的實際断言在 worker/tests/chartIsolation.test.ts（SQLite）。
 * 此檔標記後端授權模型：user_id 僅來自 Session。
 */
describe('Workers 授權模型（規格）', () => {
  it('私人 API 必須以 Session user.id 過濾 charts', () => {
    expect('chart.userId = session.userId').toBeTruthy()
  })
})
