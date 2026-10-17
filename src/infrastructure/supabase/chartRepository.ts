import { getSupabase } from './client'
import { createNote } from './noteRepository'

export type ChartType = 'time' | 'ke' | 'single_palace'

export interface SaveChartInput {
  chartType: ChartType
  title: string
  rawInput: unknown
  normalizedInput: unknown
  calculationContext: unknown
  chartSnapshot: unknown
  engineVersion: string
  schemaVersion?: number
}

export interface ChartRow {
  id: string
  user_id: string
  chart_type: ChartType
  title: string
  raw_input: unknown
  normalized_input: unknown
  calculation_context: unknown
  chart_snapshot: unknown
  engine_version: string
  schema_version: number
  created_at: string
  updated_at: string
}

export async function saveChart(input: SaveChartInput, initialNote?: string) {
  const sb = getSupabase()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) throw new Error('請先登入')

  const { data, error } = await sb
    .from('charts')
    .insert({
      user_id: user.id,
      chart_type: input.chartType,
      title: input.title,
      raw_input: input.rawInput,
      normalized_input: input.normalizedInput,
      calculation_context: input.calculationContext,
      chart_snapshot: input.chartSnapshot,
      engine_version: input.engineVersion,
      schema_version: input.schemaVersion ?? 1,
    })
    .select('*')
    .single()

  if (error) throw error
  const row = data as ChartRow
  if (initialNote?.trim()) {
    await createNote(row.id, initialNote.trim())
  }
  return row
}

export async function listCharts(): Promise<ChartRow[]> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('charts')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ChartRow[]
}

export async function getChartById(id: string): Promise<ChartRow | null> {
  const sb = getSupabase()
  const { data, error } = await sb.from('charts').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as ChartRow | null) ?? null
}

export async function updateChartTitle(id: string, title: string): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb
    .from('charts')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updateChartSnapshot(
  id: string,
  patch: {
    chart_snapshot: unknown
    calculation_context?: unknown
    engine_version?: string
  },
): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb
    .from('charts')
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteChart(id: string): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('charts').delete().eq('id', id)
  if (error) throw error
}

/** @deprecated 請改用 noteRepository.createNote */
export async function addChartNote(
  chartId: string,
  content: string,
  palaceNumber?: number,
) {
  return createNote(chartId, content, palaceNumber)
}
