// apps/siriusstudio/server/api/test-write.post.ts
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { fileName, content } = body

  // Usamos nossa função mágica de caminhos
  const paths = getSitePaths('novagokula')
  const fullPath = resolve(paths.content, fileName)

  try {
    // Escreve o arquivo fisicamente no storage
    writeFileSync(fullPath, content, 'utf-8')
    
    return {
      status: 'Sucesso!',
      mensagem: `Arquivo ${fileName} criado com sucesso no storage.`,
      caminho: fullPath
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: `Erro ao escrever: ${err.message}`
    })
  }
})