import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const { fileName } = getQuery(event) // Ex: 'acomodacoes/quarto-luxo.md'

  if (!fileName) {
    throw createError({ statusCode: 400, statusMessage: 'Nome do arquivo é obrigatório' })
  }

  // 1. Localiza a raiz do projeto de forma robusta
  const rootDir = process.cwd().includes('.output') 
    ? path.join(process.cwd(), '../../') 
    : process.cwd()

  // 2. Constrói o caminho completo até a pasta content
  // Usamos path.join para lidar corretamente com as barras (/) em subpastas
  const filePath = path.resolve(rootDir, 'content', String(fileName))

  // 3. Importante: Headers para evitar que o Nginx ou o Browser guardem cache do preview
  setHeaders(event, {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  })

  try {
    if (!fs.existsSync(filePath)) {
      throw createError({ statusCode: 404, statusMessage: `Ficheiro não encontrado: ${fileName}` })
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    return { content }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})