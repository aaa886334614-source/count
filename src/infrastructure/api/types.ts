export type ChartType = 'time' | 'ke' | 'single_palace'

export interface SaveChartInput {
  chartType: ChartType
  title: string
  rawInput: unknown
  normalizedInput: unknown
  calculationContext: unknown
  chartSnapshot: unknown
  engineVersion: string
  ruleVersion: string
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
  rule_version: string
  schema_version: number
  created_at: string
  updated_at: string
}

export interface ChartNoteRow {
  id: string
  chart_id: string
  user_id: string
  palace_number: number | null
  content: string
  created_at: string
  updated_at: string
}
