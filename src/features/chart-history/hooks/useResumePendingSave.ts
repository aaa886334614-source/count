import { useEffect, useState } from 'react'
import {
  clearPendingSave,
  readPendingSave,
  type PendingSaveBundle,
} from '@/features/chart-history/services/pendingSaveStorage'

export function useResumePendingSave(returnPath: string) {
  const [pending, setPending] = useState<PendingSaveBundle | null>(null)

  useEffect(() => {
    const p = readPendingSave()
    if (p && p.returnPath === returnPath) {
      setPending(p)
    }
  }, [returnPath])

  function consumeWorkspace<T>(): T | undefined {
    if (!pending?.workspace) return undefined
    return pending.workspace as T
  }

  function clearResume() {
    clearPendingSave()
    setPending(null)
  }

  return {
    pending,
    shouldOpenSave: Boolean(pending?.openSaveDialog),
    consumeWorkspace,
    clearResume,
  }
}
