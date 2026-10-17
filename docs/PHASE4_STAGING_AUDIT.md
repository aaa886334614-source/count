# Phase 4 — Staging 設定稽核（2026-03-17）

## Wrangler

- 版本：**4.151.1**（≥ 4.36.0 ✅）
- 登入狀態：執行 Phase 4 時 **未登入**（需 `wrangler login`）

## D1

| 環境 | binding | database_name | migrations_dir |
|------|---------|---------------|----------------|
| 本機 default | `DB` | `qimen-db` | `drizzle/migrations` |
| staging | `DB` | `qimen-db-staging` | `drizzle/migrations` |
| production | `DB` | `qimen-db-production` | `drizzle/migrations` |

- Drizzle `out` = `drizzle/migrations` ✅ 與 Wrangler 一致
- Migration 檔：`0000_initial.sql` + `_journal.json` ✅
- **Production D1 尚未建立／未 migrate**（刻意不碰）

## Better Auth

- Staging 強制：`APP_ENV=staging` → Email 驗證 + Turnstile（見 `worker/auth/auth.ts`）
- `BETTER_AUTH_URL` / `TRUSTED_ORIGINS`：Staging **尚未設定**（部署前需 Secret，URL = Staging Worker 網域）
- `BETTER_AUTH_SECRET`：僅 Secret，勿寫進 repo

## Turnstile

- 後端：`TURNSTILE_SECRET_KEY`（Secret）、`TURNSTILE_REQUIRED=1`（staging vars）
- 前端：`VITE_TURNSTILE_SITE_KEY` 須在 **`npm run build` 前** 寫入 `.env`（Vite 建置時注入）

## Resend

- Worker Secret：`RESEND_API_KEY`、`EMAIL_FROM`（已驗證寄件網域）

## Rate Limit

- Staging `namespace_id`: **1001**
- Production `namespace_id`: **1002**（分離 ✅）

## 部署前檢查（Staging）

- [ ] `wrangler whoami` 成功
- [ ] `qimen-db-staging` 已建立 + `database_id` 已寫入 `wrangler.jsonc`（若 wrangler 要求）
- [ ] 僅執行 `npm run db:migrate:staging`（勿跑 production）
- [ ] Staging Secrets 已設定
- [ ] Build 前已設 `VITE_TURNSTILE_SITE_KEY`
- [ ] `BETTER_AUTH_URL` = `https://<staging-host>`（無尾斜線）
- [ ] `TRUSTED_ORIGINS` 含同一 Staging URL
