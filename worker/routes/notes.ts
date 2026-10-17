import { Hono } from 'hono'
import { createDb } from '../db/client'
import type { Env } from '../env'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import {
  createNote,
  deleteNote,
  getNoteForUser,
  listNotes,
  updateNote,
} from '../services/noteService'

export const notesRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()

notesRoutes.use('*', requireAuth)

notesRoutes.get('/:chartId/notes', async (c) => {
  const db = createDb(c.env.DB)
  const notes = await listNotes(db, c.get('userId'), c.req.param('chartId'))
  if (notes === null) return c.json({ error: '找不到盤面' }, 404)
  return c.json(notes)
})

notesRoutes.post('/:chartId/notes', async (c) => {
  const db = createDb(c.env.DB)
  const body = await c.req.json()
  const note = await createNote(db, c.get('userId'), c.req.param('chartId'), body)
  if (!note) return c.json({ error: '找不到盤面' }, 404)
  return c.json(note, 201)
})

notesRoutes.patch('/:chartId/notes/:noteId', async (c) => {
  const db = createDb(c.env.DB)
  const body = (await c.req.json()) as { content: string }
  const existing = await getNoteForUser(
    db,
    c.get('userId'),
    c.req.param('noteId'),
  )
  if (!existing || existing.chart_id !== c.req.param('chartId')) {
    return c.json({ error: '找不到備註' }, 404)
  }
  const note = await updateNote(
    db,
    c.get('userId'),
    c.req.param('noteId'),
    body.content,
  )
  if (!note) return c.json({ error: '找不到備註' }, 404)
  return c.json(note)
})

notesRoutes.delete('/:chartId/notes/:noteId', async (c) => {
  const db = createDb(c.env.DB)
  const existing = await getNoteForUser(
    db,
    c.get('userId'),
    c.req.param('noteId'),
  )
  if (!existing || existing.chart_id !== c.req.param('chartId')) {
    return c.json({ error: '找不到備註' }, 404)
  }
  const ok = await deleteNote(db, c.get('userId'), c.req.param('noteId'))
  if (!ok) return c.json({ error: '找不到備註' }, 404)
  return c.json({ ok: true })
})
