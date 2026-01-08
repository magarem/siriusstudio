import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
 const items = await readMultipartFormData(event)
  // Pega o targetPath enviado pelo frontend
  const targetPathField = items?.find(i => i.name === 'targetPath')
  const subPath = targetPathField?.data.toString() || ''
  
  const uploadDir = path.resolve(process.cwd(), 'public/images', subPath)

  if (!items) throw createError({ statusCode: 400, message: 'Nenhum ficheiro enviado' })

  for (const item of items) {
    if (item.filename && item.data) {
      // Limpa o nome do arquivo para evitar problemas de URL
      const safeName = item.filename.replace(/\s+/g, '-').toLowerCase()
      const filePath = path.join(uploadDir, safeName)
      
      fs.writeFileSync(filePath, item.data)
    }
  }

  return { success: true }
})