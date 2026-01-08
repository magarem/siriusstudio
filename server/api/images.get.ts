import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  // Pega o subpath da query (ex: /viagens/india) ou vazio para a raiz
  const query = getQuery(event)
  const subPath = (query.path as string) || ''
  
  // Caminho absoluto no servidor
  const imagesDir = path.resolve(process.cwd(), 'public/images', subPath)
  
  try {
    if (!fs.existsSync(imagesDir)) return []
    
    const entries = fs.readdirSync(imagesDir, { withFileTypes: true })
    
    return entries.map(entry => {
      const isDirectory = entry.isDirectory()
      // O caminho relativo para o frontend usar (ex: /images/viagens/foto.jpg)
      const webPath = path.join('/images', subPath, entry.name).replace(/\\/g, '/')
      
      return {
        name: entry.name,
        path: webPath,
        isDirectory: isDirectory,
        // Guardamos o subPath relativo para navegação posterior
        relativeSubPath: path.join(subPath, entry.name).replace(/\\/g, '/')
      }
    }).filter(item => {
      if (item.isDirectory) return true
      return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(item.name)
    })
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Erro ao ler pasta' })
  }
})