import { Trash2 } from 'lucide-react'
import type { HistoryRecord } from '../types/qimen'

interface HistoryListProps {
  records: HistoryRecord[]
  onSelect: (record: HistoryRecord) => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function HistoryList({
  records,
  onSelect,
  onDelete,
  onClearAll,
}: HistoryListProps) {
  return (
    <section className="w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-neutral-800">歷史紀錄</h2>
        {records.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="min-h-[44px] rounded border border-neutral-400 px-3 text-sm text-neutral-700 hover:border-red-800 hover:text-red-900"
          >
            全部清除
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">尚無紀錄。</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {records.map((record) => (
            <li
              key={record.id}
              className="overflow-hidden rounded border border-neutral-300 bg-white p-3"
            >
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="w-full min-h-[44px] text-left"
              >
                <p className="break-all font-mono text-sm tracking-wider text-black">
                  {record.normalizedCode}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {formatTime(record.createdAt)}
                </p>
                <p className="mt-1 break-words text-sm text-neutral-800">
                  {record.palaceNumber}
                  {record.palaceName} · {record.god} · {record.star} ·{' '}
                  {record.door}
                </p>
                <p className="mt-0.5 break-words text-xs text-neutral-600">
                  天{record.heavenStem ?? '（空）'} / 地
                  {record.earthStem ?? '（空）'}
                  {record.isEmptyVoid ? ' · 空亡' : ''}
                  {record.harms.length > 0
                    ? ` · ${record.harms.map((h) => h.type).join('、')}`
                    : ''}
                </p>
              </button>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onDelete(record.id)}
                  aria-label="刪除此筆紀錄"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-neutral-300 text-neutral-600 hover:border-red-800 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
