// server/api/admin/backups/delete.post.ts
import fs from 'node:fs'
import path from 'node:path'
import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const siteCookie = getCookie(event, 'cms_site_context')
  
  if (!siteCookie || !body.filename) {
    throw createError({ statusCode: 400, message: 'Dados inválidos' })
  }

  // Define a raiz da aplicação (Compatível com Docker e Local)
  const appRoot = process.env.APPS_ROOT || path.resolve(process.cwd(), '..')
  
  // Caminho da pasta de backups do site
  const backupDir = path.join(appRoot, 'backups', siteCookie)
  
  // Caminho completo do arquivo a ser deletado
  const filePath = path.join(backupDir, body.filename)

  // Segurança: Garante que o arquivo está dentro da pasta de backups (evita Path Traversal)
  if (!filePath.startsWith(backupDir)) {
      throw createError({ statusCode: 403, message: 'Acesso negado.' })
  }

  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, message: 'Backup não encontrado.' })
  }

  try {
    fs.unlinkSync(filePath)
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao excluir backup:', error)
    throw createError({ statusCode: 500, message: 'Falha ao excluir arquivo.' })
  }
})