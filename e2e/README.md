# Playwright E2E（Staging 真實環境）

本目錄測試**不會**在一般 `npm run test` 執行。

## 前置

1. 已部署 **Staging** Worker（見 `docs/STAGING.md`）
2. 已設定 Turnstile 測試金鑰、Resend、D1 migration
3. 環境變數：

```bash
export E2E_BASE_URL=https://your-staging.workers.dev
export E2E_USER_A_EMAIL=...
export E2E_USER_A_PASSWORD=...
export E2E_TURNSTILE_TOKEN=...   # 測試用 token 或略過需 Turnstile 的 case
```

## 執行

```bash
npm run test:e2e
```

未設定 `E2E_BASE_URL` 時，測試會自動 skip。
