import { useRef, useState } from 'react'
import { Trash2, Check, X } from 'lucide-react'
import type { HistoryRecord } from '../types/qimen'
import { Card } from './Card'

interface HistoryListProps {
  records: HistoryRecord[]
  onSelect: (record: HistoryRecord) => void
  onDelete: (id: string) => void
  onClearAll: () => void
  onUpdateNote: (id: string, note: string) => void
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

function HistoryItem({
  record,
  onSelect,
  onDelete,
  onUpdateNote,
}: {
  record: HistoryRecord
  onSelect: () => void
  onDelete: () => void
  onUpdateNote: (note: string) => void
}) {
  const [offset, setOffset] = useState(0)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(record.note ?? '')
  const startX = useRef(0)

  const harmsText =
    record.harms.length > 0
      ? record.harms.map((h) => h.type).join('、')
      : '無'

  return (
    <li className="relative overflow-hidden rounded-[16px]">
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-[var(--color-wine)]">
        <button
          type="button"
          onClick={onDelete}
          aria-label="刪除"
          className="flex h-full w-full items-center justify-center text-white"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative bg-[var(--color-surface)] p-4 transition-transform duration-200"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX
        }}
        onTouchMove={(e) => {
          const dx = e.touches[0].clientX - startX.current
          if (dx < 0) setOffset(Math.max(dx, -80))
          else setOffset(0)
        }}
        onTouchEnd={() => {
          setOffset((v) => (v < -40 ? -80 : 0))
        }}
      >
        <button type="button" onClick={onSelect} className="w-full text-left">
          <p className="break-all font-mono text-[22px] tracking-[0.2em] text-[var(--color-ink)]">
            {record.normalizedCode}
          </p>
          <p className="mt-2 text-[16px] text-[var(--color-muted)]">
            {formatTime(record.createdAt)}
          </p>
          <p className="mt-2 text-[18px] text-[var(--color-ink)]">
            宮位：{record.palaceNumber}
            {record.palaceName}
          </p>
          <p className="mt-1 text-[18px] text-[var(--color-ink)]">
            四害：{harmsText}
          </p>
          {!editing && record.note && (
            <p className="mt-2 break-words text-[18px] text-[var(--color-muted)]">
              備註：{record.note}
            </p>
          )}
        </button>

        {editing ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={draft}
              maxLength={100}
              rows={2}
              onChange={(e) => setDraft(e.target.value.slice(0, 100))}
              className="w-full resize-none rounded-[12px] bg-white px-3 py-2 text-[18px] outline-none ring-1 ring-[var(--color-line)]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateNote(draft.trim())
                  setEditing(false)
                }}
                className="btn-press inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-[12px] bg-[var(--color-wine)] text-white"
              >
                <Check className="h-4 w-4" />
                儲存備註
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(record.note ?? '')
                  setEditing(false)
                }}
                className="btn-press inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-white ring-1 ring-[var(--color-line)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft(record.note ?? '')
                setEditing(true)
              }}
              className="min-h-[44px] text-[16px] text-[var(--color-wine)]"
            >
              {record.note ? '修改備註' : '新增備註'}
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="刪除此筆"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-muted)]"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </li>
  )
}

export function HistoryList({
  records,
  onSelect,
  onDelete,
  onClearAll,
  onUpdateNote,
}: HistoryListProps) {
  return (
    <Card
      title="歷史紀錄"
      action={
        records.length > 0 ? (
          <button
            type="button"
            onClick={onClearAll}
            className="min-h-[44px] text-[16px] text-[var(--color-wine)]"
          >
            全部清除
          </button>
        ) : undefined
      }
    >
      {records.length === 0 ? (
        <p className="text-[18px] text-[var(--color-muted)]">
          尚無紀錄。排盤完成後可選擇儲存。
        </p>
      ) : (
        <ul className="space-y-3">
          {records.map((record) => (
            <HistoryItem
              key={record.id}
              record={record}
              onSelect={() => onSelect(record)}
              onDelete={() => onDelete(record.id)}
              onUpdateNote={(note) => onUpdateNote(record.id, note)}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
