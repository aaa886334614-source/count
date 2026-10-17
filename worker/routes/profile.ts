import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { createDb } from '../db/client'
import { profiles } from '../db/schema'
import type { Env } from '../env'
import { requireAuth, type AuthVariables } from '../middleware/auth'

export const profileRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()

profileRoutes.use('*', requireAuth)

profileRoutes.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const userId = c.get('userId')
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)
  const row = rows[0]
  return c.json({
    userId,
    email: c.get('userEmail'),
    displayName: row?.displayName ?? null,
  })
})

profileRoutes.patch('/', async (c) => {
  const db = createDb(c.env.DB)
  const userId = c.get('userId')
  const body = (await c.req.json()) as { displayName?: string }
  const now = new Date()
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)
  if (existing[0]) {
    await db
      .update(profiles)
      .set({ displayName: body.displayName ?? null, updatedAt: now })
      .where(eq(profiles.userId, userId))
  } else {
    await db.insert(profiles).values({
      userId,
      displayName: body.displayName ?? null,
      createdAt: now,
      updatedAt: now,
    })
  }
  return c.json({ ok: true })
})
