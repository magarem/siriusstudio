import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'Sem ficheiros' })

  let currentPath = '' // Subpasta dentro de uploads/images/
  const files: any[] = []

  for (const item of formData) {
    if (item.name === 'currentPath') {
      currentPath = item.data.toString().trim()
    } else if (item.name === 'files' && item.filename) {
      files.push(item)
    }
  }

  const rootDir = process.cwd()
  // Caminho físico: raiz/uploads/images/subpasta
  const targetDir = resolve(rootDir, 'uploads/images', currentPath)

  try {
    if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true })

    for (const file of files) {
      const filePath = join(targetDir, file.filename)
      writeFileSync(filePath, file.data)
    }

    return { success: true }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})