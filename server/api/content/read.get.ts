// apps/siriusstudio/server/api/content/read.get.ts
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler((event) => {
  const { fileName } = getQuery(event)
  const domain = getCookie(event, 'cms_site_context')

  if (!domain || !fileName) {
    throw createError({ statusCode: 400, message: 'Parâmetros inválidos' })
  }

  const paths = getSitePaths(domain)
  const fullPath = resolve(paths.content, String(fileName))

  if (!existsSync(fullPath)) {
    throw createError({ statusCode: 404, message: 'Arquivo não encontrado' })
  }

  const content = readFileSync(fullPath, 'utf-8')
  
  return {
    fileName,
    content // O texto bruto do Markdown
  }
})