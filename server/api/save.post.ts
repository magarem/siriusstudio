import { writeFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { filePath, content } = body

  // Isso garante que ele salve na raiz do projeto + o caminho que mandamos
  const absolutePath = resolve(process.cwd(), filePath)

  try {
    writeFileSync(absolutePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    console.error('Erro ao salvar:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao salvar o arquivo' })
  }
})