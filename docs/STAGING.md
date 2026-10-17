# Staging 部署（與 Production 分離）

## 原則

| 項目 | Staging | Production |
|------|---------|------------|
| Worker 名稱 | `qimen-staging` | `qimen` |
| D1 | `qimen-db-staging` | `qimen-db-production` |
| `APP_ENV` | `staging` | `production` |
| Secrets | 獨立設定 | 獨立設定 |
| `BETTER_AUTH_URL` | Staging 網域 | 正式網域 |

Migration 目錄相同：`drizzle/migrations/`（Wrangler 以 D1 內建 migration 表追蹤，不會重複套用同一版本）。

## 你需要執行的指令（需 Cloudflare 登入）

```bash
npx wrangler login

# 建立 Staging D1（僅建立資源，不動 Production）
npx wrangler d1 create qimen-db-staging

# 將回傳的 database_id 填入 wrangler.jsonc → env.staging.d1_databases[0].database_id

# Staging Secrets（勿貼到聊天）
npx wrangler secret put BETTER_AUTH_SECRET --env staging
npx wrangler secret put BETTER_AUTH_URL --env staging
npx wrangler secret put TRUSTED_ORIGINS --env staging
npx wrangler secret put TURNSTILE_SECRET_KEY --env staging
npx wrangler secret put RESEND_API_KEY --env staging
npx wrangler secret put EMAIL_FROM --env staging

# 更新 env.staging.vars 中的公開 URL（或改用 secret 覆寫）

# 僅對 Staging remote D1 套用 migration（確認 database 名稱後執行）
npm run db:migrate:staging

# 建置並部署 Staging（非 Production）
npm run build
npm run deploy:staging
```

## Rate Limit namespace

`wrangler.jsonc` 中 `ratelimits[].namespace_id` 為占位。部署前請依 [Cloudflare Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) 建立 namespace 並更新 ID；否則 Staging 可能無法通過 auth 限速檢查（503）。

## 驗證

1. `GET https://<staging>/api/health` → `appEnv: staging`
2. 註冊 → 收驗證信 → 驗證 → 登入 → 存盤 → `/charts` 還原
3. `npm run test:e2e`（設定 `E2E_BASE_URL`）

**未經你確認前，請勿執行 `npm run deploy:production` 或 Production migration。**
