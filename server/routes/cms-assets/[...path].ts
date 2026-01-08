// apps/siriusstudio/server/routes/cms-assets/[...path].ts
import { createReadStream, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler((event) => {
  const domain = getCookie(event, 'cms_site_context')
  if (!domain) throw createError({ statusCode: 401 })

  // Pega o caminho da imagem da URL
  const filePath = event.context.params?.path
  const paths = getSitePaths(domain)
  const fullPath = resolve(paths.images, filePath || '')

  if (!existsSync(fullPath)) {
    throw createError({ statusCode: 404, message: 'Imagem não encontrada' })
  }

  // Retorna o stream do arquivo para o navegador
  return sendStream(event, createReadStream(fullPath))
})