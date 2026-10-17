import { describe, expect, it } from 'vitest'
import {
  createChart,
  deleteChartForUser,
  getChartForUser,
  updateChartTitle,
} from '../services/chartService'
import {
  createNote,
  deleteNote,
  getNoteForUser,
  listNotes,
  updateNote,
} from '../services/noteService'
import { createTestDatabase, insertTestUser } from './sqliteTestDb'

const USER_A = 'user-a-test'
const USER_B = 'user-b-test'

function sampleSaveInput() {
  return {
    chartType: 'single_palace' as const,
    title: '測試盤',
    rawInput: { rawInput: '123456' },
    normalizedInput: { code: '123456' },
    calculationContext: { harmRulesVersion: '1.0.0' },
    chartSnapshot: { kind: 'single_palace', meta: {} },
    engineVersion: 'single-palace-1.0',
    ruleVersion: '1.0.0',
    schemaVersion: 1,
  }
}

describe('D1 chart repository 隔離（SQLite 本機）', () => {
  it('User B 無法讀取 User A 的盤面', async () => {
    const db = createTestDatabase()
    await insertTestUser(db, USER_A, 'a@test.local')
    await insertTestUser(db, USER_B, 'b@test.local')
    const created = await createChart(db, USER_A, sampleSaveInput())
    const leak = await getChartForUser(db, USER_B, created.id)
    expect(leak).toBeNull()
  })

  it('User B 無法修改或刪除 User A 的盤面', async () => {
    const db = createTestDatabase()
    await insertTestUser(db, USER_A, 'a@test.local')
    await insertTestUser(db, USER_B, 'b@test.local')
    const created = await createChart(db, USER_A, sampleSaveInput())
    const renamed = await updateChartTitle(db, USER_B, created.id, '入侵')
    expect(renamed).toBeNull()
    const deleted = await deleteChartForUser(db, USER_B, created.id)
    expect(deleted).toBe(false)
    const still = await getChartForUser(db, USER_A, created.id)
    expect(still?.title).toBe('測試盤')
  })

  it('User B 無法在 User A 的盤上新增或修改備註', async () => {
    const db = createTestDatabase()
    await insertTestUser(db, USER_A, 'a@test.local')
    await insertTestUser(db, USER_B, 'b@test.local')
    const chart = await createChart(db, USER_A, sampleSaveInput())
    const noteA = await createNote(db, USER_A, chart.id, {
      content: 'A 備註',
      palaceNumber: 1,
    })
    expect(noteA).not.toBeNull()
    const noteB = await createNote(db, USER_B, chart.id, { content: 'B 入侵' })
    expect(noteB).toBeNull()
    const notesForB = await listNotes(db, USER_B, chart.id)
    expect(notesForB).toBeNull()
    const hacked = await updateNote(db, USER_B, noteA!.id, '改寫')
    expect(hacked).toBeNull()
    const noteStill = await getNoteForUser(db, USER_A, noteA!.id)
    expect(noteStill?.content).toBe('A 備註')
    const deleted = await deleteNote(db, USER_B, noteA!.id)
    expect(deleted).toBe(false)
  })
})
