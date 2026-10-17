import type { SaveChartInput } from '@/infrastructure/supabase/chartRepository'

const KEY = 'qimen-pending-save-v1'

export interface PendingSaveBundle {
  returnPath: string
  title: string
  note: string
  saveInput: SaveChartInput
  workspace?: unknown
  openSaveDialog: boolean
}

export function writePendingSave(bundle: PendingSaveBundle): void {
  sessionStorage.setItem(KEY, JSON.stringify(bundle))
}

export function readPendingSave(): PendingSaveBundle | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as PendingSaveBundle
  } catch {
    return null
  }
}

export function clearPendingSave(): void {
  sessionStorage.removeItem(KEY)
}
