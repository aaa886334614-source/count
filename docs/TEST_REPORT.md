# 測試報告

## 基準（Cloudflare 整合）

見 `docs/BASELINE.md` — commit **`51ec34d`**：self-check 98、Vitest 18。

## 最新（Phase 3 上線準備）

| 層級 | 指令 | 結果 |
|------|------|------|
| 單元／整合（本機） | `npm run self-check` | **98** 通過 |
| 單元／整合（本機） | `npm run test` | **22** 通過 |
| 靜態 | `npm run lint` | oxlint warnings（非阻擋） |
| 型別 | `npm run typecheck` | 通過 |
| 建置 | `npm run build` | 通過 |
| Staging E2E | `npm run test:e2e` | 需 `E2E_BASE_URL`，否則 skip |

### Vitest 新增重點

- `worker/tests/requireAuth.test.ts` — 401／Session userId
- `worker/tests/chartIsolation.test.ts` — A/B 盤面與備註（含刪除）
- `src/tests/chart-history/snapshotRestoreFields.test.ts` — 快照欄位

### 尚未自動驗證

- Staging 真實：註冊→驗證信→登入→存盤→還原（需 Resend + Turnstile + D1 remote）
- Production 部署

**22 項 Vitest 通過 ≠ Staging 真實環境通過。**
