import { useCallback, useEffect, useState } from 'react'
import type { HistoryRecord, PalaceResult } from '../types/qimen'
import {
  createHistoryRecord,
  loadHistory,
  prependHistory,
  saveHistory,
} from '../utils/storage'

export function useHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>(() => loadHistory())
  const [storageOk, setStorageOk] = useState(true)

  useEffect(() => {
    const ok = saveHistory(records)
    setStorageOk(ok)
  }, [records])

  const addFromResult = useCallback((result: PalaceResult) => {
    const record = createHistoryRecord(result)
    setRecords((prev) => prependHistory(prev, record))
    return record
  }, [])

  const updateRecord = useCallback(
    (id: string, patch: Partial<HistoryRecord>) => {
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      )
    },
    [],
  )

  const removeRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setRecords([])
  }, [])

  return {
    records,
    storageOk,
    addFromResult,
    updateRecord,
    removeRecord,
    clearAll,
  }
}
