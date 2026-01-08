import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // body.path: a subpasta atual (ex: "viagens" ou "")
  // body.name: o nome da nova pasta (ex: "europa")
  const { name, path: subPath } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'O nome da pasta é obrigatório.',
    })
  }

  // Define o caminho absoluto onde a pasta será criada
  // Resolve: [RAIZ DO PROJETO] / public / images / [SUBPASTA ATUAL] / [NOVA PASTA]
  const targetDir = path.resolve(process.cwd(), 'public/images', subPath || '', name)

  try {
    // Verifica se já existe algo com esse nome
    if (fs.existsSync(targetDir)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Uma pasta ou arquivo com este nome já existe.',
      })
    }

    // Cria a pasta (recursive: true garante que os pais sejam criados se necessário)
    fs.mkdirSync(targetDir, { recursive: true })

    return {
      success: true,
      message: 'Pasta criada com sucesso!',
      path: targetDir
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erro ao criar diretório no servidor.',
    })
  }
})