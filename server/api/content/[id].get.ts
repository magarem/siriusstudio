import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  // Pega o id da URL (ex: /api/content/slideshow)
  const id = getRouterParam(event, 'id')
  
  // Caminho absoluto para a pasta content na raiz do projeto
  const filePath = path.resolve(process.cwd(), 'content', `${id}.md`)

  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Arquivo não encontrado: ${filePath}`)
      throw createError({ statusCode: 404, message: 'Arquivo não existe no disco' })
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    return { rawContent: raw } // O frontend espera esta chave exata
  } catch (error: any) {
    return createError({ statusCode: 500, message: error.message })
  }
})