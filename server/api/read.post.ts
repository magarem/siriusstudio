// server/api/read.post.ts
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { filePath } = body

  if (!filePath) return { content: '' }

  // Resolve o caminho a partir da raiz do projeto (onde está o nuxt.config)
  const absolutePath = resolve(process.cwd(), filePath)

  if (existsSync(absolutePath)) {
    try {
      const content = readFileSync(absolutePath, 'utf-8')
      return { content }
    } catch (e) {
      throw createError({ statusCode: 500, message: 'Erro ao ler o arquivo físico' })
    }
  } else {
    // Retornamos o path no erro para você debugar no console do navegador
    throw createError({ statusCode: 404, message: `Arquivo não localizado em: ${absolutePath}` })
  }
})