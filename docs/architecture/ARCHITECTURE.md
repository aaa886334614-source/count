# 奇門遁甲整合工作台 — 架構

## 分層

| 層 | 路徑 | 職責 |
|----|------|------|
| Domain | `src/domain/qimen/` | 純函式：六位解析、四害、環境化解、v0.4 時盤（vendor 不修改） |
| Features | `src/features/` | 頁面、hooks、功能 UI |
| Infrastructure | `src/infrastructure/api/` | Workers REST 客戶端、Better Auth 前端 client |
| Worker | `worker/` | Hono API、D1、Session 授權、Turnstile（選用） |
| Shared | `src/shared/` | 版面、通用工具 |

## 資料流

1. **六位數**：`parseSixCode` → `calculatePalace` → `detectHarms` → `buildEnvironmentActions`
2. **時刻盤**：`yinpanBridgeBrowser.calculate` → `mapYinpanPalaceToResult` → 同上（對宮由九宮自動帶入）
3. **存盤**：`SaveChartDialog` →（未登入則 `pendingSaveStorage` + `/account`）→ `POST /api/charts` + 可選 `POST /api/charts/:id/notes`
4. **歷史**：`/charts` → `GET /api/charts` → `/charts/:id` 讀取 `chart_snapshot` 還原（預設快照，可選「最新規則重新計算」）
5. **Auth**：`AuthProvider` + Better Auth cookie session；`/api/auth/*` 由 Worker 處理

## 模組依賴

- UI 不得 import vendor 引擎除 `yinpanBridgeBrowser`
- `detectHarms` 不依賴 React / D1
- 四害偵測與 `buildEnvironmentActions` 分離
- **前端不得直連 D1**；所有私人資料經 Worker API

## 資料庫（Cloudflare D1 + Drizzle）

Schema：`worker/db/schema.ts`，migration：`drizzle/migrations/`。

- Better Auth：`user`、`session`、`account`、`verification`
- 應用：`profiles`、`charts`、`chart_notes`
- JSON 欄位以 TEXT 儲存，寫入前 Zod 驗證

授權：無 RLS；Worker 以 Session `user.id` 限制 `charts.user_id` / 備註須驗證所屬盤面。

部署見 `docs/CLOUDFLARE_SETUP.md`。
