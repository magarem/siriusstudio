import { createReadStream, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path
  if (!path) throw createError({ statusCode: 400 })

  const rootDir = process.cwd()
  // Busca na pasta uploads/images que criamos acima
  const filePath = resolve(rootDir, 'public/images', path)

  if (existsSync(filePath)) {
    const ext = path.split('.').pop()?.toLowerCase()
    const mimeTypes: any = { 
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 
      'png': 'image/png', 'webp': 'image/webp', 'svg': 'image/svg+xml' 
    }
    
    if (ext && mimeTypes[ext]) setResponseHeader(event, 'Content-Type', mimeTypes[ext])
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

    return sendStream(event, createReadStream(filePath))
  }

  throw createError({ statusCode: 404 })
})