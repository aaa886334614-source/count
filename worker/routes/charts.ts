import { Hono } from 'hono'
import { createDb } from '../db/client'
import type { Env } from '../env'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import {
  createChart,
  deleteChartForUser,
  getChartForUser,
  listChartsForUser,
  mapChartRow,
  saveChartSchema,
  updateChartSnapshot,
  updateChartTitle,
} from '../services/chartService'

export const chartsRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()

chartsRoutes.use('*', requireAuth)

chartsRoutes.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const rows = await listChartsForUser(db, c.get('userId'))
  return c.json(rows.map(mapChartRow))
})

chartsRoutes.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const chart = await getChartForUser(db, c.get('userId'), c.req.param('id'))
  if (!chart) return c.json({ error: '找不到盤面' }, 404)
  return c.json(chart)
})

chartsRoutes.post('/', async (c) => {
  const db = createDb(c.env.DB)
  const body = await c.req.json()
  try {
    const chart = await createChart(db, c.get('userId'), body)
    return c.json(chart, 201)
  } catch (e) {
    if (e instanceof Error && e.name === 'ZodError') {
      return c.json({ error: '輸入格式無效' }, 400)
    }
    return c.json({ error: e instanceof Error ? e.message : '儲存失敗' }, 400)
  }
})

chartsRoutes.patch('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const body = (await c.req.json()) as {
    title?: string
    chartSnapshot?: unknown
    calculationContext?: unknown
    engineVersion?: string
    ruleVersion?: string
  }
  if (body.title) {
    const updated = await updateChartTitle(
      db,
      c.get('userId'),
      c.req.param('id'),
      body.title,
    )
    if (!updated) return c.json({ error: '找不到盤面' }, 404)
    return c.json(updated)
  }
  if (body.chartSnapshot) {
    const updated = await updateChartSnapshot(db, c.get('userId'), c.req.param('id'), {
      chartSnapshot: body.chartSnapshot,
      calculationContext: body.calculationContext,
      engineVersion: body.engineVersion,
      ruleVersion: body.ruleVersion,
    })
    if (!updated) return c.json({ error: '找不到盤面' }, 404)
    return c.json(updated)
  }
  return c.json({ error: '無效的更新內容' }, 400)
})

chartsRoutes.delete('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const ok = await deleteChartForUser(db, c.get('userId'), c.req.param('id'))
  if (!ok) return c.json({ error: '找不到盤面' }, 404)
  return c.json({ ok: true })
})

export { saveChartSchema }
