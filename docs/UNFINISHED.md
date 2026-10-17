# 未完成／待驗證

## 需 Cloudflare 正式環境驗證

- Email 全流程（Resend + `REQUIRE_EMAIL_VERIFICATION=1`）
- Turnstile 正式 site key + `TURNSTILE_REQUIRED=1`
- Workers 正式 D1 + Secrets 部署後 E2E 登入／存盤
- Playwright 主要流程 E2E

## 功能待補（不阻擋核心）

- 時刻盤：十二長生 UI（引擎 `longLife` 已有）
- Google OAuth（第二階段）
- 匯入 JSON 直接寫入雲端（目前僅驗證格式 + 舊版 localStorage 匯入）
- 完整逐欄位快照 diff UI（目前已有簡要比對 + 確認更新）

## 已在本分支完成（程式）

- Cloudflare Workers + Hono + D1 + Drizzle + Better Auth
- AuthProvider（cookie session）
- 雲端存盤／備註／我的排盤（Workers API）
- ChartSnapshot 版本化 + `rule_version`
- 跨帳號隔離：`worker/tests/chartIsolation.test.ts`（SQLite 本機）

## 已棄用

- Supabase client／migration 不再用於執行路徑（`supabase/migrations/` 僅作歷史參考）
