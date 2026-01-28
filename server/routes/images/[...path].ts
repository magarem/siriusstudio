import { createReadStream, existsSync } from 'node:fs'
import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const pathParam = event.context.params?.path
  if (!pathParam) throw createError({ statusCode: 400 })

  // --- LÓGICA DE IDENTIFICAÇÃO DO SITE ---
  
  // 1. Prioridade Máxima: Cookie (Para quando você está editando no CMS)
  let siteId = getCookie(event, 'cms_site_context')

  // 2. Prioridade Alta: Configuração do Ambiente (.env)
  // Se não tiver cookie, pegamos o ID fixo definido no servidor
  if (!siteId) {
    const config = useRuntimeConfig()
    if (config.siteId) {
      siteId = config.siteId
    }
  }

  // 3. Fallback: Domínio (Só se não tiver .env configurado)
  if (!siteId) {
    try {
      const host = getRequestHost(event)
      const sitesConfigPath = resolve(process.cwd(), 'sites.json')
      
      if (existsSync(sitesConfigPath)) {
        const sitesRaw = await fs.readFile(sitesConfigPath, 'utf-8')
        const sites = JSON.parse(sitesRaw)
        for (const [key, config] of Object.entries(sites)) {
          if (host.includes(config.domain || '')) {
            siteId = config.storage || key
            break
          }
        }
      }
    } catch (e) { console.error(e) }
  }

  // Se nada funcionou, 404
  if (!siteId) {
    throw createError({ statusCode: 404, message: "Site ID not configured" })
  }

  // --- LÓGICA DE ENTREGA DA IMAGEM ---
  
  // Caminho: /app/storage/[siteId]/images/[arquivo]
  const filePath = resolve(process.cwd(), '..', '..', 'storage', siteId, 'images', pathParam)
  console.log('Serving image from:', filePath)
  if (existsSync(filePath)) {
    const ext = pathParam.split('.').pop()?.toLowerCase()
    const mimeTypes: any = { 
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 
      'png': 'image/png', 'webp': 'image/webp', 'svg': 'image/svg+xml',
      'gif': 'image/gif'
    }
    
    if (ext && mimeTypes[ext]) setResponseHeader(event, 'Content-Type', mimeTypes[ext])
    
    // Cache agressivo (1 ano) já que a imagem tem nome único ou hash
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

    return sendStream(event, createReadStream(filePath))
  }

  throw createError({ statusCode: 404 })
})