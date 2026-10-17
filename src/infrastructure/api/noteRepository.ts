import { apiFetch } from './http'
import type { ChartNoteRow } from './types'

export type { ChartNoteRow } from './types'

export async function listNotesForChart(chartId: string): Promise<ChartNoteRow[]> {
  return apiFetch<ChartNoteRow[]>(`/api/charts/${chartId}/notes`)
}

export async function createNote(
  chartId: string,
  content: string,
  palaceNumber?: number | null,
): Promise<ChartNoteRow> {
  return apiFetch<ChartNoteRow>(`/api/charts/${chartId}/notes`, {
    method: 'POST',
    body: JSON.stringify({
      content,
      palaceNumber: palaceNumber ?? null,
    }),
  })
}

export async function updateNote(
  chartId: string,
  noteId: string,
  content: string,
): Promise<ChartNoteRow> {
  return apiFetch<ChartNoteRow>(`/api/charts/${chartId}/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  })
}

export async function deleteNote(chartId: string, noteId: string): Promise<void> {
  await apiFetch(`/api/charts/${chartId}/notes/${noteId}`, { method: 'DELETE' })
}
