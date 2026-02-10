// apps/siriusstudio/server/api/content/list.get.ts
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler((event) => {
  // 1. Pegamos o domínio do cookie que acabamos de criar
  const domain = getCookie(event, 'cms_site_context')

  if (!domain) {
    throw createError({ statusCode: 401, message: 'Não autorizado. Faça login.' })
  }

  // 2. Usamos o siteManager para pegar o caminho da pasta content
  const paths = getSitePaths(domain)

  try {
    // 3. Lemos os arquivos físicos da pasta storage/dominio/content
    const files = readdirSync(paths.content)

    // 4. Formatamos para o front-end
    return files
      .filter(file => file.endsWith('.md')) // Apenas Markdowns por enquanto
      .map(file => {
        const stats = statSync(join(paths.content, file))
        return {
          name: file,
          path: file,
          size: stats.size,
          updatedAt: stats.mtime
        }
      })
  } catch (err: any) {
    throw createError({ statusCode: 500, message: 'Erro ao listar arquivos: ' + err.message })
  }
})