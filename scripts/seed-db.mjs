import Database from 'better-sqlite3';
import { resolve, join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const domain = process.argv[2];

// Configuração: mude o domínio conforme necessário
const APPS_ROOT = resolve(process.cwd(), '..');
const storagePath = join(APPS_ROOT, 'storage', domain, 'data');

console.log(`🚀 storagePath: ${storagePath}...`);
// 1. Garante que a pasta 'data' existe dentro do storage do site
if (!existsSync(storagePath)) {
  mkdirSync(storagePath, { recursive: true });
  console.log(`✅ Pasta criada: ${storagePath}`);
}

const dbPath = join(storagePath, 'database.sqlite');
const db = new Database(dbPath);

// 2. Cria a tabela de usuários
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 3. Insere um usuário de teste (se não existir)
const insert = db.prepare(`
  INSERT OR IGNORE INTO users (username, password, role) 
  VALUES (?, ?, ?)
`);

insert.run('admin', '123456', 'superadmin');

console.log(`
🚀 Banco de dados configurado com sucesso!
📍 Local: ${dbPath}
👤 Usuário: admin
🔑 Senha: 123456
`);

db.close();