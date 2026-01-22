import fs from 'node:fs'
import path from 'node:path'
import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const siteCookie = getCookie(event, 'cms_site_context')
  if (!siteCookie) return []

  const backupDir = path.resolve(process.cwd(), '..', 'backups', siteCookie)

  if (!fs.existsSync(backupDir)) {
    return []
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.tar.gz'))
    .map(file => {
      const stats = fs.statSync(path.join(backupDir, file))
      
      // Lógica para extrair o nome legível
      // Formato esperado: YYYY-MM-DDTHH-mm-ss_nome-do-backup.tar.gz
      let displayName = file;
      
      // 1. Encontra o primeiro underscore (separador entre data e nome)
      const firstUnderscoreIndex = file.indexOf('_');
      
      if (firstUnderscoreIndex !== -1) {
          // Pega tudo depois do primeiro _
          const rawName = file.substring(firstUnderscoreIndex + 1);
          
          // Remove a extensão .tar.gz
          let cleanName = rawName.replace('.tar.gz', '');
          
          // Opcional: Transforma hifens de volta em espaços para ficar bonito na tabela
          // Ex: "versao-final-1" vira "versao final 1"
          cleanName = cleanName.replace(/-/g, ' ');
          
          // Capitaliza a primeira letra (Cosmético)
          displayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      }

      return {
        filename: file, // Nome real do arquivo (importante para o Restore)
        name: displayName, // Nome bonito para exibir na tabela
        size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
        created: stats.birthtime,
        timestamp: stats.birthtime.getTime()
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp)

  return files
})