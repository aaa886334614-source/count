import { createMiddleware } from 'hono/factory'
import { createAuth } from '../auth/auth'
import type { Env } from '../env'

export type AuthVariables = {
  userId: string
  userEmail: string
}

export const requireAuth = createMiddleware<{
  Bindings: Env
  Variables: AuthVariables
}>(async (c, next) => {
  const auth = createAuth(c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session?.user?.id) {
    return c.json({ error: '未登入或 Session 已失效' }, 401)
  }
  c.set('userId', session.user.id)
  c.set('userEmail', session.user.email)
  await next()
})
