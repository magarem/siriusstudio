import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // O body.path vem do frontend como "/images/pasta/foto.jpg"
  // Removemos a barra inicial para processar o caminho relativo ao 'public'
  const relativePath = body.path.replace(/^\//, '')
  const fullPath = path.resolve(process.cwd(), 'public', relativePath)

  try {
    if (!fs.existsSync(fullPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Item não encontrado no servidor.'
      })
    }

    // fs.rmSync é a forma moderna de remover ficheiros ou pastas
    // recursive: true permite apagar pastas com conteúdo
    // force: true evita erros caso o ficheiro não exista no exato momento
    fs.rmSync(fullPath, { recursive: true, force: true })

    return { 
      success: true, 
      message: body.isDirectory ? 'Pasta eliminada' : 'Ficheiro eliminado' 
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao eliminar: ' + error.message
    })
  }
})