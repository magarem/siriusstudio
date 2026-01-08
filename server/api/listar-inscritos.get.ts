import { defineEventHandler } from 'h3'
import Database from 'better-sqlite3'
import { resolve } from 'path'

const db = new Database(resolve(process.cwd(), 'database.db'))

export default defineEventHandler(async () => {
  try {
    const stmt = db.prepare('SELECT * FROM inscricoes ORDER BY data_registro DESC')
    const rows = stmt.all()
    return { success: true, data: rows }
  } catch (e) {
    return { success: false, error: e.message }
  }
})