import { createMiddleware } from 'hono/factory'
import type { Env } from '../env'

export async function verifyTurnstile(
  secret: string,
  token: string | undefined,
  ip: string | undefined,
): Promise<boolean> {
  if (!token) return false
  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)
  if (ip) body.set('remoteip', ip)
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body },
  )
  const data = (await res.json()) as { success?: boolean }
  return Boolean(data.success)
}

export const optionalTurnstile = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const required = c.env.TURNSTILE_REQUIRED === '1'
    const secret = c.env.TURNSTILE_SECRET_KEY
    if (!required || !secret) {
      await next()
      return
    }
    const token = c.req.header('x-turnstile-token')
    const ip = c.req.header('CF-Connecting-IP')
    const ok = await verifyTurnstile(secret, token, ip)
    if (!ok) {
      return c.json({ error: 'Turnstile 驗證失敗' }, 400)
    }
    await next()
  },
)
