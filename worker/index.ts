import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createAuth } from './auth/auth'
import type { Env } from './env'
import { rateLimit } from './middleware/rateLimit'
import { optionalTurnstile } from './middleware/turnstile'
import { chartsRoutes } from './routes/charts'
import { notesRoutes } from './routes/notes'
import { profileRoutes } from './routes/profile'

const app = new Hono<{ Bindings: Env }>()

app.use(
  '/api/*',
  cors({
    origin: (origin, c) => {
      const allowed =
        c.env.TRUSTED_ORIGINS?.split(',').map((s: string) => s.trim()) ?? [
          c.env.BETTER_AUTH_URL,
        ]
      if (!origin) return c.env.BETTER_AUTH_URL
      return allowed.includes(origin) ? origin : ''
    },
    credentials: true,
  }),
)

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    backend: 'cloudflare-workers',
    auth: 'better-auth',
    database: 'd1',
  }),
)

app.all('/api/auth/*', optionalTurnstile, rateLimit({
  keyPrefix: 'auth',
  limit: 30,
  windowMs: 60_000,
}), async (c) => {
  const auth = createAuth(c.env)
  return auth.handler(c.req.raw)
})

app.route('/api/charts', chartsRoutes)
app.route('/api/charts', notesRoutes)
app.route('/api/profile', profileRoutes)

app.get('*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
