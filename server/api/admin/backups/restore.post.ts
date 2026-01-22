import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { getCookie } from 'h3'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  const body = await readBody(event) // { filename: '...' }
  const siteCookie = getCookie(event, 'cms_site_context')

  if (!siteCookie || !body.filename) {
    throw createError({ statusCode: 400, message: 'Dados inválidos' })
  }

  const rootDir = path.resolve(process.cwd(), '..')
  const backupFile = path.join(rootDir, 'backups', siteCookie, body.filename)
  const storageRoot = path.join(rootDir, 'storage') // Onde vamos extrair
  const siteStorage = path.join(storageRoot, siteCookie) // A pasta que será substituída

  if (!fs.existsSync(backupFile)) {
    throw createError({ statusCode: 404, message: 'Backup não encontrado' })
  }

  try {
    // 1. Remove a pasta atual do site (PERIGO: Ponto sem retorno)
    // Usamos rm -rf via comando para ser rápido
    if (fs.existsSync(siteStorage)) {
        await execAsync(`rm -rf "${siteStorage}"`)
    }

    // 2. Extrai o backup
    // -x: extract, -z: gzip, -f: file
    // -C: diretório de destino
    await execAsync(`tar -xzf "${backupFile}" -C "${storageRoot}"`)

    return { success: true }
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Falha crítica ao restaurar: ' + error.message })
  }
})