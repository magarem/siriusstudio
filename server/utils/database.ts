// apps/siriusstudio/server/utils/database.ts
import Database from 'better-sqlite3'

export const useDb = (siteId: string) => {
  const paths = getSitePaths(siteId)
  
  // Abre a conexão com o banco específico do site no storage
  const db = new Database(paths.db, { 
    verbose: console.log // Útil para vermos as queries no terminal durante o dev
  })
  
  // Otimizações de performance para SQLite
  db.pragma('journal_mode = WAL')
  
  return db
}