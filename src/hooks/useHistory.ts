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

  const addFromResult = useCallback((result: PalaceResult, note?: string) => {
    // createHistoryRecord 內會再跑一次最新 calculatePalace + detectHarms
    const record = createHistoryRecord(result, note)
    setRecords((prev) => prependHistory(prev, record))
    return record
  }, [])

  const updateRecord = useCallback(
    (id: string, patch: Partial<HistoryRecord>) => {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, ...patch, updatedAt: new Date().toISOString() }
            : r,
        ),
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

  const toggleFavorite = useCallback((id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              favorite: !r.favorite,
              updatedAt: new Date().toISOString(),
            }
          : r,
      ),
    )
  }, [])

  return {
    records,
    storageOk,
    addFromResult,
    updateRecord,
    removeRecord,
    clearAll,
    toggleFavorite,
  }
}
