import { useRef, useState } from 'react'
import { Trash2, Check, X, Star } from 'lucide-react'
import type { HistoryRecord } from '../types/qimen'
import { formatRemedyAnimal } from '../utils/formatRemedyAnimal'
import { Card } from './Card'

interface HistoryListProps {
  records: HistoryRecord[]
  onSelect: (record: HistoryRecord) => void
  onDelete: (id: string) => void
  onClearAll: () => void
  onUpdateNote: (id: string, note: string) => void
  onToggleFavorite: (id: string) => void
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

function harmSummary(record: HistoryRecord): string {
  if (record.harms.length === 0) return '無四害'
  return record.harms
    .map((h) => `${h.type}${h.targetValue ? `：${h.targetValue}` : ''}`)
    .join('、')
}

function remedySummary(record: HistoryRecord): string {
  const labels = record.harms
    .map((h) => h.remedyAnimal)
    .filter((a): a is string => Boolean(a))
    .map((a) => formatRemedyAnimal(a))
  return labels.length > 0 ? labels.join('、') : '—'
}

function HistoryItem({
  record,
  onSelect,
  onDelete,
  onUpdateNote,
  onToggleFavorite,
}: {
  record: HistoryRecord
  onSelect: () => void
  onDelete: () => void
  onUpdateNote: (note: string) => void
  onToggleFavorite: () => void
}) {
  const [offset, setOffset] = useState(0)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(record.note ?? '')
  const startX = useRef(0)

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
          <div className="flex items-start justify-between gap-2">
            <p className="break-all font-mono text-[20px] tracking-[0.2em] text-[var(--color-ink)]">
              {record.normalizedCode}
            </p>
            {record.favorite && (
              <Star className="h-4 w-4 shrink-0 fill-[var(--color-wine)] text-[var(--color-wine)]" />
            )}
          </div>
          <p className="mt-2 text-[16px] text-[var(--color-ink)]">
            {record.palaceInputDigit} {record.palaceName}宮
          </p>
          <p className="mt-1 break-words text-[16px] text-[var(--color-ink)]">
            {harmSummary(record)}
          </p>
          <p className="mt-1 text-[16px] text-[var(--color-muted)]">
            化解：{remedySummary(record)}
          </p>
          {record.note && (
            <p className="mt-1 break-words text-[16px] text-[var(--color-muted)]">
              備註：{record.note}
            </p>
          )}
          <p className="mt-2 text-[14px] text-[var(--color-muted)]">
            {formatTime(record.createdAt)}
          </p>
        </button>

        {editing ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={draft}
              maxLength={100}
              rows={2}
              onChange={(e) => setDraft(e.target.value.slice(0, 100))}
              className="w-full resize-none rounded-[12px] bg-white px-3 py-2 text-[16px] outline-none ring-1 ring-[var(--color-line)]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateNote(draft.trim())
                  setEditing(false)
                }}
                className="btn-press inline-flex h-14 flex-1 items-center justify-center gap-1 rounded-[14px] bg-[var(--color-wine)] text-white"
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
                className="btn-press inline-flex h-14 w-14 items-center justify-center rounded-[14px] bg-white ring-1 ring-[var(--color-line)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-3">
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
                onClick={onToggleFavorite}
                className="inline-flex min-h-[44px] items-center gap-1 text-[16px] text-[var(--color-wine)]"
              >
                <Star
                  className={`h-4 w-4 ${record.favorite ? 'fill-[var(--color-wine)]' : ''}`}
                />
                {record.favorite ? '已收藏' : '收藏'}
              </button>
            </div>
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
  onToggleFavorite,
}: HistoryListProps) {
  const sorted = [...records].sort((a, b) => {
    if (Boolean(a.favorite) !== Boolean(b.favorite)) {
      return a.favorite ? -1 : 1
    }
    return b.createdAt.localeCompare(a.createdAt)
  })

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
          尚未儲存任何排盤紀錄
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((record) => (
            <HistoryItem
              key={record.id}
              record={record}
              onSelect={() => onSelect(record)}
              onDelete={() => onDelete(record.id)}
              onUpdateNote={(note) => onUpdateNote(record.id, note)}
              onToggleFavorite={() => onToggleFavorite(record.id)}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
