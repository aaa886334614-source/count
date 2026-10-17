import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type TestDatabase = ReturnType<typeof createTestDatabase>

export function createTestDatabase() {
  const sqlite = new Database(':memory:')
  const migrationPath = path.join(
    __dirname,
    '../../drizzle/migrations/0000_initial.sql',
  )
  const sql = fs.readFileSync(migrationPath, 'utf8')
  for (const chunk of sql.split('--> statement-breakpoint')) {
    const stmt = chunk.trim()
    if (stmt) sqlite.exec(stmt)
  }
  return drizzle(sqlite, { schema })
}

export async function insertTestUser(
  db: TestDatabase,
  id: string,
  email: string,
) {
  const now = new Date()
  await db.insert(schema.user).values({
    id,
    name: email.split('@')[0] ?? 'test',
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  })
}
