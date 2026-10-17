import { createMiddleware } from 'hono/factory'
import type { Env } from '../env'

const devBuckets = new Map<string, { count: number; resetAt: number }>()

function isDevEnv(env: Env): boolean {
  return !env.APP_ENV || env.APP_ENV === 'development'
}

/** 速率限制：Staging/Production 優先使用 Cloudflare Rate Limit binding；本機 dev 才用記憶體 fallback */
export function rateLimit(opts: {
  keyPrefix: string
  limit: number
  periodSeconds: 10 | 60
}) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const ip =
      c.req.header('CF-Connecting-IP') ??
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown'
    const key = `${opts.keyPrefix}:${ip}`

    const binding = c.env.AUTH_RATE_LIMITER
    if (binding) {
      const outcome = await binding.limit({ key })
      if (!outcome.success) {
        return c.json({ error: '請求過於頻繁，請稍後再試' }, 429)
      }
      await next()
      return
    }

    if (!isDevEnv(c.env)) {
      console.error(
        '[rateLimit] AUTH_RATE_LIMITER 未綁定，Staging/Production 無法提供可靠限速',
      )
      return c.json({ error: '伺服器限速設定未完成' }, 503)
    }

    const now = Date.now()
    const windowMs = opts.periodSeconds * 1000
    const cur = devBuckets.get(key)
    if (!cur || cur.resetAt < now) {
      devBuckets.set(key, { count: 1, resetAt: now + windowMs })
      await next()
      return
    }
    if (cur.count >= opts.limit) {
      return c.json({ error: '請求過於頻繁，請稍後再試' }, 429)
    }
    cur.count += 1
    await next()
  })
}
