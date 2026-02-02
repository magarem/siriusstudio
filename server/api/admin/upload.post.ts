import fs from 'node:fs/promises'
import path from 'node:path'
import { defineEventHandler, getQuery, readMultipartFormData, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // 1. LER PARAMETROS DA URL
  // O Editor envia ?site=demo&folder=content/posts/viagem
  const query = getQuery(event)
  const site = query.site
  const targetFolder = query.folder || 'images'

  if (!site) {
    throw createError({ statusCode: 400, statusMessage: 'Site não especificado' })
  }

  // 2. LER O ARQUIVO
  const files = await readMultipartFormData(event)
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado' })
  }

  // 3. DEFINIR CAMINHO DE DESTINO
  // Ajuste o '..' conforme a estrutura real das suas pastas. 
  // Se a pasta 'storage' estiver na raiz do projeto, use process.cwd() direto.
  const uploadDir = path.resolve(process.cwd(), '..', 'storage', String(site), String(targetFolder))

  console.log('uploadDir:', uploadDir)
  // Cria a pasta se não existir
  try {
    await fs.mkdir(uploadDir, { recursive: true })
  } catch (e) {
    // Ignora erro se pasta já existe
  }

  // 4. SALVAR O PRIMEIRO ARQUIVO
  // O Drag & Drop geralmente envia um por um, então pegamos o [0]
  const file = files[0]
  
  if (!file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo sem nome' })
  }

  // Sanitiza nome: 'Minha Foto.JPG' -> 'minha-foto.jpg'
  const ext = path.extname(file.filename).toLowerCase()
  const nameBody = path.basename(file.filename, ext).replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase()
  const safeFilename = `${nameBody}${ext}`

  const filePath = path.join(uploadDir, safeFilename)
  
  await fs.writeFile(filePath, file.data)

  // 5. RETORNO INTELIGENTE PARA O EDITOR
  // Se o upload foi para uma pasta de conteúdo (Page Bundle), o link é relativo (só o nome).
  // Se foi para a pasta 'images' genérica, o link é absoluto.
  let publicPath = safeFilename
  
  // Se NÃO for page bundle (ex: upload para pasta global de assets), precisamos do caminho completo
  // Logica simples: Se a pasta de destino começa com 'content', assumimos Page Bundle (link relativo)
  if (!String(targetFolder).startsWith('content')) {
      publicPath = `/${targetFolder}/${safeFilename}`
  }

  return { 
    success: true, 
    path: publicPath, // O Editor usa isso para criar o link ![](path)
    filename: safeFilename,
    folder: targetFolder 
  }
})