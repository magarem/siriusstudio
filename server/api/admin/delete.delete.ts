// server/api/admin/delete.delete.ts
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const filePath = body.file

  if (!filePath) throw createError({ statusCode: 400, message: 'File path required' })
  
  // Segurança básica: impedir sair da pasta content
  if (filePath.includes('..')) throw createError({ statusCode: 403, message: 'Invalid path' })

  const fullPath = path.resolve(process.cwd(), 'content', filePath)

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
    return { success: true }
  } else {
    throw createError({ statusCode: 404, message: 'File not found' })
  }
})