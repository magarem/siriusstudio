import { rmSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { path: physicalPath } = body // Ex: 'public/images/foto.jpg'

  if (!physicalPath) {
    throw createError({ statusCode: 400, statusMessage: 'Caminho não fornecido' })
  }

  const rootDir = process.cwd()
  const absolutePath = resolve(rootDir, physicalPath)

  try {
    if (existsSync(absolutePath)) {
      rmSync(absolutePath, { recursive: true, force: true })
      return { success: true }
    }
    throw createError({ statusCode: 404, statusMessage: 'Arquivo não encontrado' })
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})