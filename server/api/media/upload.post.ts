// apps/siriusstudio/server/api/media/upload.post.ts
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const domain = getCookie(event, 'cms_site_context')
  const paths = getSitePaths(domain!)
  
  // Lendo o arquivo enviado (multipart/form-data)
  const files = await readMultipartFormData(event)
  
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado' })
  }

  const file = files[0] // Pegamos o primeiro arquivo
  const fileName = file.filename || 'upload-' + Date.now()
  const fullPath = resolve(paths.images, fileName)

  try {
    writeFileSync(fullPath, file.data)
    return {
      success: true,
      url: `/cms-assets/${fileName}`, // URL para o Admin usar no preview
      name: fileName
    }
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message })
  }
})