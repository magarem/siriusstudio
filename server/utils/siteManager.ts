// apps/siriusstudio/server/utils/siteManager.ts
import { resolve } from 'node:path'

export const getSitePaths = (siteId: string) => {
  // Caminho base: partindo de apps/siriusstudio, sobe um nível e entra em storage/siteId
  const base = resolve(process.cwd(), '../storage', siteId)

  return {
    root: base,
    content: resolve(base, 'content'),
    images: resolve(base, 'images'),
    pages: resolve(base, 'pages'),
    components: resolve(base, 'components'),
    layouts: resolve(base, 'layouts'),
    db: resolve(base, 'data/cms.db')
  }
}