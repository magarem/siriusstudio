// apps/siriusstudio/server/api/test-storage.get.ts
import { readdirSync } from 'node:fs'

export default defineEventHandler((event) => {
  // Por enquanto, vamos fixar 'novagokula', depois pegaremos do login
  const siteId = 'novagokula'
  const paths = getSitePaths(siteId)

  try {
    // Tenta ler a lista de arquivos na pasta content do storage externo
    const files = readdirSync(paths.content)
    
    return {
      status: 'Conectado ao Storage!',
      site: siteId,
      caminhoFisico: paths.content,
      arquivosEncontrados: files
    }
  } catch (err: any) {
    return {
      status: 'Erro de conexão',
      mensagem: err.message,
      caminhoTentado: paths.content
    }
  }
})