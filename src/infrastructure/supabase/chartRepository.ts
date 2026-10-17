import { getSupabase } from './client'

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

export async function saveChart(input: SaveChartInput) {
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
  return data
}

export async function listCharts() {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('charts')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function deleteChart(id: string) {
  const sb = getSupabase()
  const { error } = await sb.from('charts').delete().eq('id', id)
  if (error) throw error
}

export async function addChartNote(chartId: string, content: string, palaceNumber?: number) {
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
  return data
}
