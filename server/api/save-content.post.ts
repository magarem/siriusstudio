import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const { fileName, content } = await readBody(event)
  
  // Define o caminho absoluto para a pasta content
  const filePath = path.resolve(process.cwd(), 'content', fileName)

  try {
    // Escreve o novo conteúdo no arquivo .md
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true, message: 'Arquivo publicado com sucesso!' }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao salvar o arquivo.',
    })
  }
})