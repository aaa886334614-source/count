import { getSupabase } from './client'

export interface ChartNoteRow {
  id: string
  chart_id: string
  user_id: string
  palace_number: number | null
  content: string
  created_at: string
  updated_at: string
}

export async function listNotesForChart(chartId: string): Promise<ChartNoteRow[]> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('chart_notes')
    .select('*')
    .eq('chart_id', chartId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as ChartNoteRow[]
}

export async function createNote(
  chartId: string,
  content: string,
  palaceNumber?: number | null,
): Promise<ChartNoteRow> {
  const sb = getSupabase()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) throw new Error('請先登入')

  const { data, error } = await sb
    .from('chart_notes')
    .insert({
      chart_id: chartId,
      user_id: user.id,
      content,
      palace_number: palaceNumber ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as ChartNoteRow
}

export async function updateNote(
  noteId: string,
  content: string,
): Promise<ChartNoteRow> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('chart_notes')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select('*')
    .single()
  if (error) throw error
  return data as ChartNoteRow
}

export async function deleteNote(noteId: string): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('chart_notes').delete().eq('id', noteId)
  if (error) throw error
}
