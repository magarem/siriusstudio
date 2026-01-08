import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const { fileName } = getQuery(event)

  if (!fileName) {
    throw createError({ statusCode: 400, statusMessage: 'Nome do arquivo é obrigatório' })
  }

  // Segurança: Impede que o usuário tente acessar arquivos fora da pasta content (ex: ../.env)
  const safeFileName = path.basename(String(fileName))
  const filePath = path.resolve(process.cwd(), 'content', safeFileName)

  try {
    if (!fs.existsSync(filePath)) {
      throw createError({ statusCode: 404, statusMessage: 'Arquivo não encontrado' })
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    return { content }
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao ler o arquivo' })
  }
})