import { ApiError, apiFetch } from './http'
import type { ChartRow, SaveChartInput } from './types'
import { createNote } from './noteRepository'

export type { ChartType, ChartRow, SaveChartInput } from './types'

export async function saveChart(input: SaveChartInput, initialNote?: string) {
  const row = await apiFetch<ChartRow>('/api/charts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (initialNote?.trim()) {
    await createNote(row.id, initialNote.trim())
  }
  return row
}

export async function listCharts(): Promise<ChartRow[]> {
  return apiFetch<ChartRow[]>('/api/charts')
}

export async function getChartById(id: string): Promise<ChartRow | null> {
  try {
    return await apiFetch<ChartRow>(`/api/charts/${id}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export async function updateChartTitle(id: string, title: string): Promise<void> {
  await apiFetch(`/api/charts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  })
}

export async function updateChartSnapshot(
  id: string,
  patch: {
    chart_snapshot: unknown
    calculation_context?: unknown
    engine_version?: string
    rule_version?: string
  },
): Promise<void> {
  await apiFetch(`/api/charts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      chartSnapshot: patch.chart_snapshot,
      calculationContext: patch.calculation_context,
      engineVersion: patch.engine_version,
      ruleVersion: patch.rule_version,
    }),
  })
}

export async function deleteChart(id: string): Promise<void> {
  await apiFetch(`/api/charts/${id}`, { method: 'DELETE' })
}

/** @deprecated 請改用 noteRepository.createNote */
export async function addChartNote(
  chartId: string,
  content: string,
  palaceNumber?: number,
) {
  return createNote(chartId, content, palaceNumber)
}
