import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  // 1. LER O PARAMETRO 'FOLDER' DA URL (QUERY STRING)
  // O FileUpload manda ?folder=images/subpasta na URL
  const query = getQuery(event)
  const site = query.site
  const targetFolder = query.folder || 'images' // Fallback para raiz se vier vazio

  if (!site) {
    throw createError({ statusCode: 400, statusMessage: 'Site não especificado' })
  }

  // 2. LER O ARQUIVO (MULTIPART)
  const files = await readMultipartFormData(event)
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado' })
  }

  // 3. DEFINIR CAMINHO DE DESTINO
  // O path.resolve garante que ../ não saia da pasta permitida (segurança básica)
  // process.cwd() + sites + site + targetFolder
  const uploadDir = path.resolve(process.cwd(), '..', 'storage', String(site), String(targetFolder))


  console.log('Upload para pasta:', uploadDir)
  // Garante que a pasta existe (caso tenha sido apagada manualmente)
  try {
    await fs.mkdir(uploadDir, { recursive: true })
  } catch (e) {
    // Pasta já existe ou erro de permissão
  }

  const uploadedFiles = []

  // 4. SALVAR ARQUIVOS
  for (const file of files) {
    if (file.filename) {
      // Sanitiza o nome do arquivo (remove espaços e caracteres estranhos)
      const safeFilename = file.filename.replace(/[^a-zA-Z0-9.\-_]/g, '-').toLowerCase()
      const filePath = path.join(uploadDir, safeFilename)
      
      await fs.writeFile(filePath, file.data)
      uploadedFiles.push(safeFilename)
    }
  }

  return { success: true, files: uploadedFiles, folder: targetFolder }
})