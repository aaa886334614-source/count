# Cloudflare Agent 開發環境（Cursor）

依 Cloudflare 官方指引設定（可於瀏覽器自行核對原文）：

https://developers.cloudflare.com/agent-setup/prompt.md

## 已在 repo 完成的項目

1. **`.cursor/mcp.json`** — 註冊 Cloudflare MCP（帳號 API、文件、Bindings、Builds、Observability）。
2. **`wrangler.jsonc`** — `observability.enabled: true`（Workers 官方建議）。
3. **本專案** — 已使用 `wrangler.jsonc`、D1、`@cloudflare/vite-plugin`（見 `docs/CLOUDFLARE_SETUP.md`）。

## 你需要在 Cursor 裡做的一次性步驟

### A. 重新載入 MCP

1. 開啟 **Cursor Settings** → **MCP**（或 **Features → MCP**）。
2. 確認專案根目錄的 `.cursor/mcp.json` 已被讀取（必要時 **Reload** / 重開 Cursor）。
3. 第一次使用 **cloudflare** MCP 工具時，瀏覽器會跳出 **Cloudflare OAuth** → 選帳號 → **Allow**。

`cloudflare-docs` 為公開文件 MCP，通常不需登入。

### B. Wrangler CLI 登入（Staging 部署必備）

在終端（專案根目錄）：

```bash
npx wrangler login
npx wrangler whoami
```

這與 MCP OAuth **分開**；兩者都需要才能「Agent 查資源 + 你本機 deploy」。

## 與 Phase 4 Staging 的順序

1. `wrangler login` + `whoami` ✅  
2. 建立 `qimen-db-staging`（見 `docs/STAGING.md`）  
3. Secrets / Turnstile / Resend  
4. `npm run db:migrate:staging` → `npm run deploy:staging`  

**不要**在未確認前部署 Production 或 migrate Production D1。

## 驗證 MCP 是否可用

在 Cursor Agent 對話中請 Agent 使用 **cloudflare-docs** 查詢「D1 migrations apply remote env staging」等關鍵字；若 OAuth 未完成，依提示在瀏覽器授權 **cloudflare** MCP。
