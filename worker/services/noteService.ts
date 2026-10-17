import { and, asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import type { AppDatabase } from '../db/client'
import { chartNotes } from '../db/schema'
import { getChartForUser } from './chartService'

export const noteSchema = z.object({
  content: z.string().min(1).max(5000),
  palaceNumber: z.number().int().min(1).max(9).nullable().optional(),
})

async function assertChartOwner(
  db: AppDatabase,
  userId: string,
  chartId: string,
) {
  const chart = await getChartForUser(db, userId, chartId)
  if (!chart) return false
  return true
}

export async function listNotes(
  db: AppDatabase,
  userId: string,
  chartId: string,
) {
  if (!(await assertChartOwner(db, userId, chartId))) return null
  const rows = await db
    .select()
    .from(chartNotes)
    .where(and(eq(chartNotes.chartId, chartId), eq(chartNotes.userId, userId)))
    .orderBy(asc(chartNotes.createdAt))
  return rows.map(mapNote)
}

export async function createNote(
  db: AppDatabase,
  userId: string,
  chartId: string,
  input: z.infer<typeof noteSchema>,
) {
  if (!(await assertChartOwner(db, userId, chartId))) return null
  const parsed = noteSchema.parse(input)
  const id = crypto.randomUUID()
  const now = new Date()
  await db.insert(chartNotes).values({
    id,
    chartId,
    userId,
    palaceNumber: parsed.palaceNumber ?? null,
    content: parsed.content,
    createdAt: now,
    updatedAt: now,
  })
  return getNoteForUser(db, userId, id)
}

export async function getNoteForUser(
  db: AppDatabase,
  userId: string,
  noteId: string,
) {
  const rows = await db
    .select()
    .from(chartNotes)
    .where(and(eq(chartNotes.id, noteId), eq(chartNotes.userId, userId)))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  const chart = await getChartForUser(db, userId, row.chartId)
  if (!chart) return null
  return mapNote(row)
}

export async function updateNote(
  db: AppDatabase,
  userId: string,
  noteId: string,
  content: string,
) {
  const existing = await getNoteForUser(db, userId, noteId)
  if (!existing) return null
  await db
    .update(chartNotes)
    .set({ content, updatedAt: new Date() })
    .where(and(eq(chartNotes.id, noteId), eq(chartNotes.userId, userId)))
  return getNoteForUser(db, userId, noteId)
}

export async function deleteNote(
  db: AppDatabase,
  userId: string,
  noteId: string,
) {
  const existing = await getNoteForUser(db, userId, noteId)
  if (!existing) return false
  await db
    .delete(chartNotes)
    .where(and(eq(chartNotes.id, noteId), eq(chartNotes.userId, userId)))
  return true
}

function mapNote(row: typeof chartNotes.$inferSelect) {
  return {
    id: row.id,
    chart_id: row.chartId,
    user_id: row.userId,
    palace_number: row.palaceNumber,
    content: row.content,
    created_at: new Date(row.createdAt).toISOString(),
    updated_at: new Date(row.updatedAt).toISOString(),
  }
}
