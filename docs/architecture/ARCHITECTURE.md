# 奇門遁甲整合工作台 — 架構

## 分層

| 層 | 路徑 | 職責 |
|----|------|------|
| Domain | `src/domain/qimen/` | 純函式：六位解析、四害、環境化解、v0.4 時盤（vendor 不修改） |
| Features | `src/features/` | 頁面、hooks、功能 UI |
| Infrastructure | `src/infrastructure/` | Supabase、localStorage 適配 |
| Shared | `src/shared/` | 版面、通用工具 |

## 資料流

1. **六位數**：`parseSixCode` → `calculatePalace` → `detectHarms` → `buildEnvironmentActions`
2. **時刻盤**：`yinpanBridgeBrowser.calculate` → `mapYinpanPalaceToResult` → 同上（對宮由九宮自動帶入）
3. **存盤**：使用者按「儲存」→（登入後）`chartRepository.saveChart` → PostgreSQL + RLS

## 模組依賴

- UI 不得 import vendor 引擎除 `yinpanBridgeBrowser`
- `detectHarms` 不依賴 React / Supabase
- 四害偵測與 `buildEnvironmentActions` 分離

## 資料庫

見 `supabase/migrations/`：`profiles`、`charts`、`chart_notes`，RLS 以 `auth.uid() = user_id` 為準。

刪除帳號：`auth.users` ON DELETE CASCADE 至 profiles / charts / chart_notes。
