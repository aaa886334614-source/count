# 測試報告（整合分支）

執行時間：2026-03-17（本機）

| 指令 | 結果 |
|------|------|
| `npm run self-check` | 98 通過，0 失敗 |
| `npm run test` (Vitest) | 12 通過（含 v0.4 核心、環境化解、RLS 規格） |
| `npm run lint` (oxlint) | 通過（無 error） |
| `npm run build` | 成功 |

## 未在本 CI 執行

- Downloads v0.4 完整套件：`verify-original.js`、`verify-expanded.js`、`verify-browser-records.js`（原目錄 `npm test` 因缺 jsdom 路徑中斷；核心 `test_engine.js` 已由 Vitest 覆蓋）
- Supabase 真實登入／RLS 跨帳號（需專案 URL + anon key）
- Playwright E2E
