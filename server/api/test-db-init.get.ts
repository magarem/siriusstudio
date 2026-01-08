// apps/siriusstudio/server/api/test-db-init.get.ts
export default defineEventHandler((event) => {
  const siteId = 'novagokula'
  const db = useDb(siteId)

  try {
    // Criamos uma tabela simples de configurações do site como teste
   db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );
`)

// Inserir um usuário administrador de teste (senha em texto puro por enquanto para facilitar)
const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)')
insertUser.run('admin', '123456', 'superadmin')

    return {
      status: 'Banco de dados inicializado!',
      site: siteId,
      dbPath: getSitePaths(siteId).db
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: `Erro no SQLite: ${err.message}`
    })
  } finally {
    db.close() // Importante fechar para não travar o arquivo no Windows
  }
})