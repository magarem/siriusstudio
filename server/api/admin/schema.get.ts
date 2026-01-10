import fs from 'node:fs/promises'
import path from 'node:path'
import { resolve, join } from 'node:path';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { site, folder } = getQuery(event)
  
  // Validação básica de segurança
  if (!site || !folder) {
    return { types: {}, mapping: {} }
  }

  // 1. Constrói o caminho até o schema.json
  // Ex: /Users/seu-usuario/projeto/sites/novagokula/content/schema.json
  // Se o folder vier como "content/pousadas", ele busca lá dentro.
  
 const APPS_ROOT = config.storagePath ? resolve(config.storagePath) : process.cwd();
  console.log('APPS_ROOT definido como:', APPS_ROOT);

  const schemaPath = path.join(APPS_ROOT, 'storage', String(site), String(folder), 'schema.json')


  try {
    // 2. Tenta ler o arquivo
    const fileContent = await fs.readFile(schemaPath, 'utf-8')
    const schema = JSON.parse(fileContent)
    console.log('Schema carregado de:', schemaPath)
    console.log('Schema raw:', fileContent)
    console.log('Conteúdo do schema:', schema)  
    return schema

  } catch (error) {
    // Se o arquivo não existir, retorna um objeto vazio para não quebrar o frontend
    // Isso é normal para pastas que não têm schema definido
    return { 
      types: {}, 
      mapping: {},
      error: 'Schema not found' // Opcional, para debug
    }
  }
})