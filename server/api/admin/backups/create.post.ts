import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { getCookie } from 'h3'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  const body = await readBody(event) // { name: 'Antes da mudança X' }
  const siteCookie = getCookie(event, 'cms_site_context')
  
  if (!siteCookie || !body.name) {
    throw createError({ statusCode: 400, message: 'Dados inválidos' })
  }

  // Definição de caminhos
  const rootDir = path.resolve(process.cwd(), '../..')
  const sourceDir = path.join(rootDir, 'storage', siteCookie)
  const destDir = path.join(rootDir, 'backups', siteCookie)

  // Garante que a pasta de destino existe
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  // Sanitiza o nome do arquivo
  const safeName = body.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `${dateStr}_${safeName}.tar.gz`
  const destPath = path.join(destDir, fileName)

  // Comando TAR:
  // -c: create, -z: gzip, -f: file
  // -C: change directory (para não incluir o caminho absoluto 'apps/...' dentro do zip)
  try {
    // Entra na pasta 'storage' e compacta a pasta do site específico
    await execAsync(`tar -czf "${destPath}" -C "${path.join(rootDir, 'storage')}" "${siteCookie}"`)
    
    return { success: true, file: fileName }
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Falha ao criar backup: ' + error.message })
  }
})