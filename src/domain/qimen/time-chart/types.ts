export type TimeChartMode = 'shi' | 'ke'

export interface TimeChartInput {
  /** 台灣本地時間 YYYY-MM-DDTHH:mm */
  localDateTime: string
  timezone: 'Asia/Taipei'
  mode: TimeChartMode
}

export interface ChartMetadata {
  season: string
  ju: number
  term: string
  pillars: string[]
  xun: string
  engineVersion: string
  note?: string
}

export interface YinpanPalaceCell {
  star: string
  door: string
  deity: string
  tian: string
  di: string
  flags: string[]
  harms?: { kind: string; layer: string; stem: string }[]
  extra?: string
}

export interface TimeChart {
  id: string
  input: TimeChartInput
  metadata: ChartMetadata
  palaces: Record<number, YinpanPalaceCell>
  raw: Record<string, unknown>
  engineVersion: string
}
