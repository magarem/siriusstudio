import fs from 'node:fs/promises'
import path from 'node:path'
import { resolve, join } from 'node:path';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event)
  const { site, folder, name } = body


  console.log('Parâmetros recebidos:', { site, folder, name })
  if (!site || !name) {
    throw createError({ statusCode: 400, statusMessage: 'Parâmetros inválidos' })
  }

  // 1. Sanitizar o nome da pasta (Slugify simples)
  // Ex: "Minha Pasta Nova" -> "minha-pasta-nova"
  const safeName = name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Espaços viram hífens
    .replace(/[^\w\-]+/g, '') // Remove caracteres especiais
    .replace(/\-\-+/g, '-')   // Remove hífens duplicados

  if (!safeName) {
    throw createError({ statusCode: 400, statusMessage: 'Nome de pasta inválido' })
  }

  // 2. Construir o caminho
  const APPS_ROOT = config.storagePath ? resolve(config.storagePath) : process.cwd();
  
  // Caminho da pasta PAI (onde estamos agora, antes de criar a nova)
  const parentPath = path.join(APPS_ROOT, 'storage', site, folder);
  
  // Caminho da NOVA pasta
  const targetPath = path.join(parentPath, safeName);

  console.log('Criando pasta em:', targetPath)
  try {
    // 3. Criar a pasta
    await fs.mkdir(targetPath, { recursive: true })
    
    // --- NOVO: LÓGICA DE COPIAR O SCHEMA ---
    try {
      const sourceSchema = path.join(parentPath, 'schema.json');
      const destSchema = path.join(targetPath, 'schema.json');

      // Tenta copiar. Se o arquivo origem não existir, o fs lança erro e cai no catch abaixo.
      console.log("tentando copiar::", sourceSchema, destSchema);
      await fs.copyFile(sourceSchema, destSchema);
      console.log(`✅ Schema copiado com sucesso para: ${destSchema}`);
    } catch (copyError) {
      // Ignora erro se o schema não existir na pasta pai. 
      // A criação da pasta é mais importante que a cópia do schema.
      // console.log('ℹ️ Nenhum schema.json encontrado na pasta pai para copiar.');
    }
    // ----------------------------------------

    return { success: true, folderName: safeName }
  } catch (error) {
    console.error('Erro ao criar pasta:', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível criar a pasta' })
  }
})