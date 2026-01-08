import { renameSync, existsSync } from 'node:fs'
import { resolve, dirname, join, extname } from 'node:path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { oldPath, newName } = body // oldPath ex: 'public/images/foto.jpg'

  const rootDir = process.cwd()
  const absoluteOldPath = resolve(rootDir, oldPath)
  const directory = dirname(absoluteOldPath)
  
  // Garante a extensão
  const oldExt = extname(absoluteOldPath)
  let finalName = newName.trim()
  if (oldExt && !finalName.toLowerCase().endsWith(oldExt.toLowerCase())) {
    finalName = `${finalName}${oldExt}`
  }

  const absoluteNewPath = join(directory, finalName)

  try {
    if (existsSync(absoluteOldPath)) {
      renameSync(absoluteOldPath, absoluteNewPath)
      return { success: true }
    }
    throw createError({ statusCode: 404, statusMessage: 'Arquivo original não encontrado' })
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})