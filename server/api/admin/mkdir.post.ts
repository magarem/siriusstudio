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
  const targetPath = path.join(APPS_ROOT, 'storage', site, folder, safeName)

  console.log('Criando pasta em:', targetPath)
  try {
    // 3. Criar a pasta
    await fs.mkdir(targetPath, { recursive: true })
    
    return { success: true, folderName: safeName }
  } catch (error) {
    console.error('Erro ao criar pasta:', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível criar a pasta' })
  }
})