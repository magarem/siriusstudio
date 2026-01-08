import { defineEventHandler, readBody } from 'h3'
import Database from 'better-sqlite3'
import { resolve } from 'path'

// Conexão com o banco (ajuste o caminho conforme seu projeto)
const dbPath = resolve(process.cwd(), 'database.db')
const db = new Database(dbPath)

// Garante que a tabela existe
db.exec(`
  CREATE TABLE IF NOT EXISTS inscricoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    whatsapp TEXT,
    nascimento TEXT,
    cpf TEXT,
    endereco TEXT,
    metodo_pagamento TEXT,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const stmt = db.prepare(`
      INSERT INTO inscricoes (nome, email, whatsapp, nascimento, cpf, endereco, metodo_pagamento)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const info = stmt.run(
      body.nome,
      body.email,
      body.whatsapp,
      body.nascimento,
      body.cpf,
      body.endereco,
      body.metodoPagamento
    )

    return { success: true, id: info.lastInsertRowid }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao salvar no banco de dados' }
  }
})