import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler((event) => {
  // Pega o id do site que o frontend está pedindo (ex: ?siteId=cafe2)
  const query = getQuery(event)
  const siteId = query.siteId

  if (!siteId) return { error: 'ID do site não informado' }

  try {
    // Caminho absoluto para o seu info.json
    // Ajuste o caminho de acordo com onde o Sirius roda em relação à pasta apps
    const infoPath = path.resolve(process.cwd(), '../sites/info.json') 
    
    const fileContent = fs.readFileSync(infoPath, 'utf-8')
    const info = JSON.parse(fileContent)

    // Procura o site específico na lista
    const siteData = info.sites.find(s => s.id === siteId)

    if (siteData) {
      // Retorna os dados do site, e já monta a URL local baseada na porta
      return {
        ...siteData,
        localUrl: `http://localhost:${siteData.port}`
      }
    } else {
      return { error: 'Site não encontrado no info.json' }
    }
  } catch (error) {
    return { error: 'Erro ao ler info.json' }
  }
})