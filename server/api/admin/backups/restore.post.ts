import fs from 'node:fs'
import path from 'node:path'
import * as tar from 'tar' // npm install tar
import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) // { filename: '...' }
  const siteCookie = getCookie(event, 'cms_site_context')

  if (!siteCookie || !body.filename) {
    throw createError({ statusCode: 400, message: 'Dados inválidos' })
  }

  // --- DEFINIÇÃO DE CAMINHOS (DOCKER AWARE) ---
  const appRoot = process.env.APPS_ROOT || path.resolve(process.cwd(), '..')
  
  const backupsRoot = path.join(appRoot, 'backups')
  const storageRoot = path.join(appRoot, 'storage')
  
  // Caminho exato do arquivo de backup (.tar.gz)
  const backupFile = path.join(backupsRoot, siteCookie, body.filename)
  
  // A pasta do site que será DELETADA e RECRIADA
  const siteStorageDir = path.join(storageRoot, siteCookie)

  // Segurança: Evita Path Traversal
  if (!backupFile.startsWith(path.join(backupsRoot, siteCookie))) {
     throw createError({ statusCode: 403, message: 'Acesso negado ao arquivo.' })
  }

  if (!fs.existsSync(backupFile)) {
    throw createError({ statusCode: 404, message: 'Arquivo de backup não encontrado no disco.' })
  }

  try {
    // 1. LIMPEZA: Remove a pasta atual do site
    if (fs.existsSync(siteStorageDir)) {
      try {
        fs.rmSync(siteStorageDir, { recursive: true, force: true })
      } catch (e) {
        throw createError({ statusCode: 500, message: 'Erro de permissão ao apagar site atual.' })
      }
    }

    // 2. RESTAURAÇÃO: Extrai o backup
    // ALTERAÇÕES AQUI:
    await tar.extract({
      file: backupFile,
      cwd: storageRoot,
      strict: false,        // [IMPORTANTE] Desativa checagem rígida de symlinks que causa o erro no Docker
      preserveOwner: false, // [IMPORTANTE] Evita erros de permissão se o UID mudar
      unlink: true          // [IMPORTANTE] Força a remoção de arquivos conflitantes antes de extrair
    })

    return { success: true }
  } catch (error: any) {
    console.error('Erro Restore:', error)
    throw createError({ statusCode: 500, message: 'Falha crítica ao restaurar: ' + error.message })
  }
})