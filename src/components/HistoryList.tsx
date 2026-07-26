import { useRef, useState } from 'react'
import { Trash2, Check, X, Star, ChevronDown } from 'lucide-react'
import type { HistoryRecord } from '../types/qimen'
import { formatRemedyAnimal } from '../utils/formatRemedyAnimal'
import {
  formatHistoryHarmSummary,
  formatHistoryRemedySummary,
} from '../utils/recalculateHistory'
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

function notePreview(note: string, max = 40): string {
  const t = note.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
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
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(record.note ?? '')
  const startX = useRef(0)

  const harms = record.harms ?? []
  const harmTags = harms.slice(0, 4)
  const harmSummary = formatHistoryHarmSummary(harms)
  const remedySummary = formatHistoryRemedySummary(harms)
  const remedies = harms
    .map((h) => h.remedyAnimal)
    .filter((a): a is string => Boolean(a))
    .map((a) => formatRemedyAnimal(a))

  return (
    <li className="relative overflow-hidden rounded-[18px] ring-1 ring-[var(--color-line)]">
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
        className="relative bg-white px-4 py-4 transition-transform duration-200"
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
            <p className="break-all font-mono text-[22px] font-bold tracking-[0.18em] text-[var(--color-ink)]">
              {record.normalizedCode}
            </p>
            {record.favorite && (
              <Star className="mt-1 h-4 w-4 shrink-0 fill-[var(--color-wine)] text-[var(--color-wine)]" />
            )}
          </div>

          <p className="mt-2 text-[20px] font-extrabold text-[var(--color-ink)]">
            {record.palaceInputDigit} {record.palaceName}
          </p>

          <p className="mt-1.5 text-[15px] leading-snug text-[var(--color-muted)]">
            {record.god}　{record.star}　{record.door}
          </p>

          <p className="mt-2 text-[15px] font-medium leading-snug text-[var(--color-ink)]">
            {harmSummary}
          </p>
          <p className="mt-1 text-[14px] leading-snug text-[var(--color-muted)]">
            化解：{remedySummary}
          </p>

          {harmTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {harmTags.map((h) => (
                <span
                  key={h.id}
                  className="inline-flex rounded-full bg-[var(--color-wine-soft)] px-2.5 py-0.5 text-[12px] font-semibold text-[var(--color-wine)]"
                >
                  {h.type}
                  {h.targetValue ? `·${h.targetValue}` : ''}
                </span>
              ))}
              {harms.length > 4 && (
                <span className="inline-flex items-center text-[12px] text-[var(--color-muted)]">
                  +{harms.length - 4}
                </span>
              )}
            </div>
          )}

          {record.dataIncomplete && (
            <p className="mt-2 text-[13px] text-[var(--color-wine)]">
              資料不完整（缺甲／戊／癸選擇），無法依最新規則重算
            </p>
          )}

          {record.note && (
            <p className="mt-2 break-words text-[14px] leading-snug text-[var(--color-muted)]">
              {notePreview(record.note)}
            </p>
          )}

          <p className="mt-2.5 text-[12px] text-[var(--color-muted)]">
            {formatTime(record.createdAt)}
          </p>
        </button>

        <div className="mt-3 flex items-center gap-2 border-t border-[var(--color-line)] pt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-[12px] bg-[var(--color-surface)] text-[14px] font-medium text-[var(--color-ink)]"
          >
            {expanded ? '收起' : '展開詳情'}
            <ChevronDown
              className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={record.favorite ? '取消收藏' : '收藏'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--color-surface)] text-[var(--color-wine)]"
          >
            <Star
              className={`h-4 w-4 ${record.favorite ? 'fill-[var(--color-wine)]' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="刪除此筆"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--color-surface)] text-[var(--color-muted)]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="accordion-panel" data-open={expanded ? 'true' : 'false'}>
          <div>
            <div className="space-y-3 pb-1 pt-3">
              <div className="rounded-[14px] bg-[var(--color-surface)] px-3.5 py-3 text-[14px] leading-relaxed">
                <p>
                  <span className="text-[var(--color-muted)]">八神／星／門</span>
                  <br />
                  <span className="font-medium text-[var(--color-ink)]">
                    {record.god}　{record.star}　{record.door}
                  </span>
                </p>
                {(record.heavenStem || record.earthStem) && (
                  <p className="mt-2">
                    <span className="text-[var(--color-muted)]">天盤／地盤</span>
                    <br />
                    <span className="font-medium text-[var(--color-ink)]">
                      {record.heavenStem ?? '—'}　{record.earthStem ?? '—'}
                    </span>
                  </p>
                )}
                {record.isEmptyVoid && (
                  <p className="mt-2 font-medium text-[var(--color-wine)]">
                    空無
                  </p>
                )}
                {harms.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {harms.map((h) => (
                      <li key={h.id} className="text-[var(--color-ink)]">
                        <span className="font-semibold text-[var(--color-wine)]">
                          {h.type}
                        </span>
                        {h.targetValue ? ` ${h.targetValue}` : ''}
                        {h.reason ? (
                          <span className="text-[var(--color-muted)]">
                            {' '}
                            · {h.reason}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[var(--color-muted)]">無四害</p>
                )}
                {remedies.length > 0 && (
                  <p className="mt-2">
                    <span className="text-[var(--color-muted)]">化解</span>
                    <br />
                    <span className="font-medium text-[var(--color-wine)]">
                      {remedySummary}
                    </span>
                  </p>
                )}
              </div>

              {editing ? (
                <div className="space-y-2">
                  <textarea
                    value={draft}
                    maxLength={100}
                    rows={2}
                    onChange={(e) => setDraft(e.target.value.slice(0, 100))}
                    className="w-full resize-none rounded-[12px] bg-[var(--color-surface)] px-3 py-2.5 text-[16px] outline-none ring-1 ring-[var(--color-line)] focus:ring-2 focus:ring-[var(--color-wine)]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateNote(draft.trim())
                        setEditing(false)
                      }}
                      className="btn-press inline-flex h-12 flex-1 items-center justify-center gap-1 rounded-[14px] bg-[var(--color-wine)] text-[15px] font-medium text-white"
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
                      className="btn-press inline-flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--color-surface)] ring-1 ring-[var(--color-line)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(record.note ?? '')
                    setEditing(true)
                  }}
                  className="min-h-[44px] w-full rounded-[12px] text-left text-[15px] font-medium text-[var(--color-wine)]"
                >
                  {record.note ? '修改備註' : '新增備註'}
                </button>
              )}
            </div>
          </div>
        </div>
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
            className="min-h-[44px] shrink-0 text-[15px] font-medium text-[var(--color-wine)]"
          >
            全部清除
          </button>
        ) : undefined
      }
    >
      {records.length === 0 ? (
        <p className="text-[16px] text-[var(--color-muted)]">
          尚未儲存任何排盤紀錄
        </p>
      ) : (
        <ul className="space-y-4">
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
