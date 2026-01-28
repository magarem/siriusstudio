import fs from 'node:fs'
import path from 'node:path'
import * as tar from 'tar' // npm install tar
import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const siteCookie = getCookie(event, 'cms_site_context')
  
  if (!siteCookie || !body.name) {
    throw createError({ statusCode: 400, message: 'Dados inválidos' })
  }

  // --- CONFIGURAÇÃO DE CAMINHOS (DOCKER AWARE) ---
  // Usa a variável de ambiente do Dockerfile ou fallback para desenvolvimento local
  const appRoot = process.env.APPS_ROOT || path.resolve(process.cwd(), '..')
  
  // Caminhos Absolutos
  const storageRoot = path.join(appRoot, 'storage') // /app/storage
  const backupsRoot = path.join(appRoot, 'backups') // /app/backups
  
  const sourceDir = path.join(storageRoot, siteCookie)
  const destDir = path.join(backupsRoot, siteCookie)

  // 1. Validação
  if (!fs.existsSync(sourceDir)) {
    throw createError({ statusCode: 404, message: 'Site não encontrado.' })
  }

  // 2. Criação da pasta de backups (Node tem permissão pois é dono de /app)
  if (!fs.existsSync(destDir)) {
    try {
      fs.mkdirSync(destDir, { recursive: true })
    } catch (e: any) {
      console.error('Erro MKDIR:', e)
      throw createError({ statusCode: 500, message: 'Erro ao criar pasta de backups.' })
    }
  }

  // Sanitização do nome
  const safeName = body.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `${dateStr}_${safeName}.tar.gz`
  const destPath = path.join(destDir, fileName)

  try {
    // 3. Compactação Nativa (Sem depender do shell do Linux)
    await tar.create(
      {
        gzip: true,
        file: destPath,
        cwd: storageRoot, // Define a raiz para o tar (para não incluir o caminho completo)
        portable: true    // Garante compatibilidade entre Windows/Linux se precisar
      },
      [siteCookie] // A pasta que será compactada
    )
    
    return { success: true, file: fileName }
  } catch (error: any) {
    console.error('Erro TAR:', error)
    throw createError({ statusCode: 500, message: 'Falha na compactação: ' + error.message })
  }
})