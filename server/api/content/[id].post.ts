import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  // 1. Captura o ID do arquivo pela URL (ex: /api/content/slideshow)
  const id = getRouterParam(event, 'id')
  
  // 2. Lê o corpo da requisição enviado pelo Admin
  const body = await readBody(event)

  if (!body || !body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conteúdo vazio ou inválido.'
    })
  }

  // 3. Define o caminho do arquivo no disco
  const filePath = path.resolve(process.cwd(), 'content', `${id}.md`)

  try {
    // 4. Verifica se o arquivo existe antes de tentar salvar (segurança)
    if (!fs.existsSync(filePath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'O arquivo original não foi encontrado para sobrescrita.'
      })
    }

    // 5. Salva o conteúdo bruto (sobrescrevendo o arquivo anterior)
    fs.writeFileSync(filePath, body.content, 'utf-8')

    // DICA OPCIONAL: Como você trabalha com better-sqlite3, 
    // você poderia inserir uma linha de log aqui se quiser histórico.
    
    return { 
      success: true, 
      message: `Arquivo ${id}.md atualizado com sucesso!` 
    }
    
  } catch (error: any) {
    return createError({
      statusCode: 500,
      statusMessage: error.message || 'Erro ao gravar arquivo no disco.'
    })
  }
})