import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAuth } from '../middleware/auth'
import type { Env } from '../env'

const getSession = vi.fn()

vi.mock('../auth/auth', () => ({
  createAuth: () => ({
    api: { getSession },
  }),
}))

describe('requireAuth middleware', () => {
  beforeEach(() => {
    getSession.mockReset()
  })

  it('未登入回傳 401', async () => {
    getSession.mockResolvedValue(null)
    const app = new Hono<{ Bindings: Env }>()
    app.use('*', requireAuth)
    app.get('/api/charts', (c) => c.json({ ok: true }))
    const res = await app.request('/api/charts', {}, {} as Env)
    expect(res.status).toBe(401)
  })

  it('有效 Session 可通過並取得 userId', async () => {
    getSession.mockResolvedValue({
      user: { id: 'u1', email: 'a@test.local' },
    })
    const app = new Hono<{ Bindings: Env; Variables: { userId: string } }>()
    app.use('*', requireAuth)
    app.get('/api/charts', (c) => c.json({ userId: c.get('userId') }))
    const res = await app.request('/api/charts', {}, {} as Env)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { userId: string }
    expect(body.userId).toBe('u1')
  })

  it('不得信任前端傳入的 user_id header', async () => {
    getSession.mockResolvedValue({
      user: { id: 'u1', email: 'a@test.local' },
    })
    const app = new Hono<{ Bindings: Env; Variables: { userId: string } }>()
    app.use('*', requireAuth)
    app.get('/api/charts', (c) => c.json({ userId: c.get('userId') }))
    const res = await app.request(
      '/api/charts',
      { headers: { 'x-user-id': 'attacker' } },
      {} as Env,
    )
    const body = (await res.json()) as { userId: string }
    expect(body.userId).toBe('u1')
  })
})
