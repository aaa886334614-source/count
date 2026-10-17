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

function isPublicEnv(env: Env): boolean {
  return env.APP_ENV === 'staging' || env.APP_ENV === 'production'
}

function turnstileRequired(env: Env): boolean {
  return env.TURNSTILE_REQUIRED === '1' || isPublicEnv(env)
}

/** 僅保護註冊／登入／重設密碼等 auth POST */
export const authTurnstile = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const path = new URL(c.req.url).pathname
    const method = c.req.method
    const authSensitive =
      method === 'POST' &&
      (path.endsWith('/sign-in/email') ||
        path.endsWith('/sign-up/email') ||
        path.endsWith('/request-password-reset'))

    if (!authSensitive) {
      await next()
      return
    }

    const required = turnstileRequired(c.env)
    const secret = c.env.TURNSTILE_SECRET_KEY

    if (required && !secret) {
      return c.json(
        { error: 'Turnstile 尚未設定，無法接受註冊／登入（請聯絡管理員）' },
        503,
      )
    }

    if (!required || !secret) {
      await next()
      return
    }

    const token = c.req.header('x-turnstile-token')
    const ip = c.req.header('CF-Connecting-IP')
    const ok = await verifyTurnstile(secret, token, ip)
    if (!ok) {
      return c.json({ error: 'Turnstile 驗證失敗，請重試' }, 400)
    }
    await next()
  },
)
