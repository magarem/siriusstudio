// apps/siriusstudio/server/api/media/list.get.ts
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler((event) => {
  const domain = getCookie(event, 'cms_site_context')
  if (!domain) throw createError({ statusCode: 401, message: 'Não autorizado' })

  const paths = getSitePaths(domain)

  try {
    const files = readdirSync(paths.images)
    
    // Lista de extensões de imagem permitidas
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

    return files
      .filter(file => validExtensions.some(ext => file.toLowerCase().endsWith(ext)))
      .map(file => {
        const stats = statSync(join(paths.images, file))
        return {
          name: file,
          url: `/cms-assets/${file}`, // Esta é a rota que criamos no Passo 12
          size: stats.size,
          updatedAt: stats.mtime
        }
      })
  } catch (err) {
    return [] // Retorna vazio se a pasta não existir ou estiver vazia
  }
})