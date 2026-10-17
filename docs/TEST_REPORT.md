# 測試報告

執行環境：本機 `integrate-qimen-workspace` 分支（Cloudflare 架構）

| 指令 | 結果 |
|------|------|
| `npm run self-check` | **98** 通過 |
| `npm run test` (Vitest) | **18** 通過 |
| `npm run lint` | oxlint（僅既有 warnings） |
| `npm run typecheck` | 通過 |
| `npm run build` | 通過（Vite + Cloudflare plugin） |
| `npm run db:migrate:local` | `0000_initial.sql` 套用成功 |

## Vitest 涵蓋

- 四害／環境化解、v0.4 引擎（domain）
- ChartSnapshot、pending save
- API SaveChartInput 規格（含 `ruleVersion`）
- **worker/tests/chartIsolation.test.ts**：User A/B 盤面與備註隔離（SQLite 本機）

## 未在 CI 自動驗證

- 正式 Cloudflare D1 remote + Secrets 下的 Better Auth 全流程
- Resend 寄信、Turnstile 正式金鑰
- Playwright E2E

**SQLite 隔離測試通過 ≠ 正式 Workers 部署已驗證**（需依 `docs/CLOUDFLARE_SETUP.md` 部署後手動測登入／存盤）。
