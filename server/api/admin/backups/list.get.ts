import fs from 'node:fs'
import path from 'node:path'
import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const siteCookie = getCookie(event, 'cms_site_context')

  console.log('siteCookie:', siteCookie)
  if (!siteCookie) return []

  // --- CORREÇÃO DO CAMINHO (Mesma lógica do create) ---
  // Se estiver no Docker, usa /app. Se local, tenta subir um nível.
  const appRoot = process.env.APPS_ROOT || path.resolve(process.cwd(), '..')
  
  // Caminho absoluto correto: /app/backups/nome_do_site
  const backupDir = path.join(appRoot, 'backups', siteCookie)

  // Debug: Se quiser ver no log do container onde ele está procurando
  // console.log('Procurando backups em:', backupDir) 

  if (!fs.existsSync(backupDir)) {
    return []
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.tar.gz'))
    .map(file => {
      const filePath = path.join(backupDir, file)
      
      try {
        const stats = fs.statSync(filePath)
        
        // --- Sua lógica de Formatação de Nome (Mantida) ---
        let displayName = file;
        const firstUnderscoreIndex = file.indexOf('_');
        
        if (firstUnderscoreIndex !== -1) {
            const rawName = file.substring(firstUnderscoreIndex + 1);
            let cleanName = rawName.replace('.tar.gz', '');
            cleanName = cleanName.replace(/-/g, ' ');
            displayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }

        return {
          filename: file, 
          name: displayName,
          size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
          created: stats.birthtime,
          timestamp: stats.birthtime.getTime()
        }
      } catch (err) {
        console.error(`Erro ao ler stats de ${file}:`, err)
        return null
      }
    })
    // Remove nulos caso algum arquivo tenha falhado na leitura
    .filter(Boolean) 
    .sort((a, b) => b.timestamp - a.timestamp)

  return files
})