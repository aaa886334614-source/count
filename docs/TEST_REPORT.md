# 測試報告

執行環境：本機 `integrate-qimen-workspace` 分支

| 指令 | 結果 |
|------|------|
| `npm run self-check` | 98 通過 |
| `npm run test` (Vitest) | **16** 通過（含原有 12 + 新增 4） |
| `npm run lint` | oxlint |
| `npm run build` | tsc + vite |

## Vitest 涵蓋（mock／domain）

- 四害／環境化解（原有）
- v0.4 引擎回歸（原有）
- RLS 政策名稱規格
- ChartSnapshot 建構／重算 diff
- pending save sessionStorage
- saveChart user_id mock 形狀

## 未驗證（需 Supabase 專案）

- 真實 Email 登入／驗證／重設密碼
- RLS 跨帳號讀寫
- 雲端備註 CRUD 連線

**Mock 通過 ≠ 真實資料庫通過**
