export interface Env {
  DB: D1Database
  ASSETS: Fetcher
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  TRUSTED_ORIGINS?: string
  TURNSTILE_SECRET_KEY?: string
  /** 設為 1 表示要求 Turnstile（正式環境） */
  TURNSTILE_REQUIRED?: string
  RESEND_API_KEY?: string
  EMAIL_FROM?: string
  /** 設為 1 時註冊需完成 Email 驗證（需寄信服務） */
  REQUIRE_EMAIL_VERIFICATION?: string
}
