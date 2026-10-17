import type { ChartRow } from '@/infrastructure/supabase/chartRepository'

export function exportChartsAsJson(rows: ChartRow[], filename?: string): void {
  const blob = new Blob([JSON.stringify(rows, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `qimen-charts-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseImportedChartsJson(text: string): ChartRow[] {
  const data = JSON.parse(text) as unknown
  if (!Array.isArray(data)) throw new Error('匯入檔必須為陣列')
  return data as ChartRow[]
}
