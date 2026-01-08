import { readdirSync, statSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

export default defineEventHandler(async (event) => {
  const { base, sub } = getQuery(event) // base pode ser 'content', 'components' ou 'uploads/images'
  const rootDir = process.cwd()

  // Resolvemos o caminho base que o front-end pediu
  // Se base for 'images', apontamos para 'uploads/images', senão usamos o que veio (content, components, etc)
  const realBase = base === 'images' ? 'uploads/images' : String(base || '')
  const targetDir = resolve(rootDir, realBase, String(sub || ''))

  if (!existsSync(targetDir)) return []

  try {
    const items = readdirSync(targetDir)
    return items.map(name => {
      const fullPath = join(targetDir, name)
      const stats = statSync(fullPath)
      const subPath = sub ? `${sub}/` : ''

      // Caminho físico para o Rename/Delete (ex: 'content/home.md')
      const physicalPath = join(realBase, subPath, name)

      // Caminho virtual (apenas para exibição/preview)
      let virtualPath = physicalPath
      if (realBase === 'uploads/images') {
        virtualPath = `/images/${subPath}${name}`
      }

      return {
        name,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        path: virtualPath,
        physicalPath: physicalPath, 
        modified: stats.mtime
      }
    })
  } catch (e) {
    return []
  }
})