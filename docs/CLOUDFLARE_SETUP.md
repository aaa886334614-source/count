# Cloudflare 部署與本機開發

後端：**Workers + Hono + D1 + Drizzle + Better Auth**。前端：**Vite React**，以 Static Assets 與 Worker 同域部署。

## 1. 登入 Cloudflare

```bash
npx wrangler login
```

## 2. 建立 D1 資料庫

```bash
npx wrangler d1 create qimen-db
```

將輸出的 `database_id` 填入 `wrangler.jsonc` 的 `d1_databases[0].database_id`（本機 `--local` 可不填真實 ID）。

## 3. 本機秘密變數

```bash
cp .dev.vars.example .dev.vars
openssl rand -base64 32   # 填入 BETTER_AUTH_SECRET
```

編輯 `.dev.vars`：`BETTER_AUTH_URL`、`TRUSTED_ORIGINS` 與本機 dev URL 一致（預設 `http://localhost:5173`）。

## 4. Migration

```bash
npm run db:migrate:local
```

正式環境：

```bash
npx wrangler d1 migrations apply qimen-db --remote
```

## 5. 本機開發

```bash
npm install
npm run dev
```

使用 `@cloudflare/vite-plugin`，API 與 SPA 同一 origin。健康檢查：`GET /api/health`。

## 6. 正式 Secrets（勿提交 Git）

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put BETTER_AUTH_URL
npx wrangler secret put TRUSTED_ORIGINS
# 選用
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put RESEND_API_KEY
```

更新 `wrangler.jsonc` 中 `vars.BETTER_AUTH_URL` 為正式網域。

## 7. 部署

```bash
npm run build
npm run deploy
```

## 8. Turnstile（選用）

1. Cloudflare Dashboard 建立 Turnstile site key / secret。
2. 前端 `.env`：`VITE_TURNSTILE_SITE_KEY=...`
3. Worker secret：`TURNSTILE_SECRET_KEY`，並設 `TURNSTILE_REQUIRED=1`。

驗證在 Worker 執行（`x-turnstile-token` header）。

## 9. Email 驗證／重設密碼

未設定 `RESEND_API_KEY` 時，**不會**真正寄信；公開註冊前請完成 Resend（或替換 `worker/auth/email.ts`）並設 `REQUIRE_EMAIL_VERIFICATION=1`。

## 10. 驗證登入與存盤

1. 註冊／登入 `/account`
2. 時盤或單宮排盤 →「儲存」
3. `/charts` 應自 D1 列出紀錄
4. 開啟詳情 → 九宮／單宮快照還原、備註 CRUD

跨帳號隔離：`npm run test` 內 `worker/tests/chartIsolation.test.ts`。
