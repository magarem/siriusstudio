import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export default defineEventHandler(async (event) => {
  const { file } = getQuery(event)

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Parâmetro "file" é obrigatório.' })
  }

  // Define o caminho absoluto. 
  // Nota: Em produção (build), a pasta /content original pode não existir.
  // No seu caso de VPS, garantimos que ele aponte para a pasta de origem.
  const filePath = path.resolve(process.cwd(), 'content', `${file}.md`)

  try {
    if (!fs.existsSync(filePath)) {
      throw createError({ statusCode: 404, statusMessage: `Arquivo ${file}.md não encontrado.` })
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    // O gray-matter extrai o YAML do topo e coloca em 'data'
    // E o restante do texto coloca em 'content'
    const { data, content } = matter(fileContent)

    return {
      data,    // Ex: { title: "...", youtubeId: "..." }
      content  // Ex: "## O texto do markdown..."
    }
  } catch (error: any) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || 'Erro ao ler arquivo no disco.' 
    })
  }
})