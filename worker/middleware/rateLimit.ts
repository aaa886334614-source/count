import { createMiddleware } from 'hono/factory'

const buckets = new Map<string, { count: number; resetAt: number }>()

/** 簡易速率限制（Worker 隔離內記憶體；正式環境可改 Durable Object / KV） */
export function rateLimit(opts: { keyPrefix: string; limit: number; windowMs: number }) {
  return createMiddleware(async (c, next) => {
    const ip =
      c.req.header('CF-Connecting-IP') ??
      c.req.header('x-forwarded-for') ??
      'unknown'
    const key = `${opts.keyPrefix}:${ip}`
    const now = Date.now()
    const cur = buckets.get(key)
    if (!cur || cur.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
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
