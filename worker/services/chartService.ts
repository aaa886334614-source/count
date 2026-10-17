import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import type { AppDatabase } from '../db/client'
import { charts } from '../db/schema'

const chartTypeSchema = z.enum(['time', 'ke', 'single_palace'])

export const saveChartSchema = z.object({
  chartType: chartTypeSchema,
  title: z.string().min(1).max(120),
  rawInput: z.unknown(),
  normalizedInput: z.unknown(),
  calculationContext: z.unknown(),
  chartSnapshot: z.unknown(),
  engineVersion: z.string().min(1),
  ruleVersion: z.string().min(1),
  schemaVersion: z.number().int().positive().optional(),
})

function jsonStringify(value: unknown): string {
  return JSON.stringify(value ?? null)
}

function parseJson<T>(raw: string): T {
  return JSON.parse(raw) as T
}

export async function listChartsForUser(db: AppDatabase, userId: string) {
  return db
    .select()
    .from(charts)
    .where(eq(charts.userId, userId))
    .orderBy(desc(charts.updatedAt))
}

export async function getChartForUser(
  db: AppDatabase,
  userId: string,
  chartId: string,
) {
  const rows = await db
    .select()
    .from(charts)
    .where(and(eq(charts.id, chartId), eq(charts.userId, userId)))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return mapChartRow(row)
}

export async function createChart(
  db: AppDatabase,
  userId: string,
  input: z.infer<typeof saveChartSchema>,
) {
  const parsed = saveChartSchema.parse(input)
  const id = crypto.randomUUID()
  const now = new Date()
  await db.insert(charts).values({
    id,
    userId,
    chartType: parsed.chartType,
    title: parsed.title,
    rawInput: jsonStringify(parsed.rawInput),
    normalizedInput: jsonStringify(parsed.normalizedInput),
    calculationContext: jsonStringify(parsed.calculationContext),
    chartSnapshot: jsonStringify(parsed.chartSnapshot),
    engineVersion: parsed.engineVersion,
    ruleVersion: parsed.ruleVersion,
    schemaVersion: parsed.schemaVersion ?? 1,
    createdAt: now,
    updatedAt: now,
  })
  const created = await getChartForUser(db, userId, id)
  if (!created) throw new Error('建立盤面失敗')
  return created
}

export async function updateChartTitle(
  db: AppDatabase,
  userId: string,
  chartId: string,
  title: string,
) {
  const existing = await getChartForUser(db, userId, chartId)
  if (!existing) return null
  await db
    .update(charts)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(charts.id, chartId), eq(charts.userId, userId)))
  return getChartForUser(db, userId, chartId)
}

export async function updateChartSnapshot(
  db: AppDatabase,
  userId: string,
  chartId: string,
  patch: {
    chartSnapshot: unknown
    calculationContext?: unknown
    engineVersion?: string
    ruleVersion?: string
  },
) {
  const rows = await db
    .select()
    .from(charts)
    .where(and(eq(charts.id, chartId), eq(charts.userId, userId)))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  await db
    .update(charts)
    .set({
      chartSnapshot: jsonStringify(patch.chartSnapshot),
      calculationContext: patch.calculationContext
        ? jsonStringify(patch.calculationContext)
        : row.calculationContext,
      engineVersion: patch.engineVersion ?? row.engineVersion,
      ruleVersion: patch.ruleVersion ?? row.ruleVersion,
      updatedAt: new Date(),
    })
    .where(and(eq(charts.id, chartId), eq(charts.userId, userId)))
  return getChartForUser(db, userId, chartId)
}

export async function deleteChartForUser(
  db: AppDatabase,
  userId: string,
  chartId: string,
) {
  const existing = await getChartForUser(db, userId, chartId)
  if (!existing) return false
  await db
    .delete(charts)
    .where(and(eq(charts.id, chartId), eq(charts.userId, userId)))
  return true
}

export function mapChartRow(row: typeof charts.$inferSelect) {
  return {
    id: row.id,
    user_id: row.userId,
    chart_type: row.chartType,
    title: row.title,
    raw_input: parseJson(row.rawInput),
    normalized_input: parseJson(row.normalizedInput),
    calculation_context: parseJson(row.calculationContext),
    chart_snapshot: parseJson(row.chartSnapshot),
    engine_version: row.engineVersion,
    rule_version: row.ruleVersion,
    schema_version: row.schemaVersion,
    created_at: new Date(row.createdAt).toISOString(),
    updated_at: new Date(row.updatedAt).toISOString(),
  }
}
