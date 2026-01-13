// server/api/admin/rename.post.ts
import fs from 'node:fs'
import path from 'node:path'
import { getCookie, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const siteCookie = getCookie(event, 'cms_site_context')
  // Espera receber: { folder: 'content/eventos', oldFile: 'festa.md', newName: 'festival' }
  
  console.log("siteCookie:", siteCookie)
  const { folder, oldFile, newName } = body

  if (!folder || !oldFile || !newName) {
    throw createError({ statusCode: 400, message: 'Dados incompletos.' })
  }

  // Define o diretório base (ajuste conforme a estrutura do seu projeto)
  // Geralmente é process.cwd() ou algo configurado no runtimeConfig
  const baseDir = path.resolve(process.cwd(), '..', 'storage', siteCookie, folder) 
  console.log('baseDir:', baseDir)
  const oldPath = path.join(baseDir, oldFile)
  
  // Tratamento da extensão: Garante que o novo nome mantenha a extensão original (ex: .md)
  const ext = path.extname(oldFile)
  let finalNewName = newName.trim()
  if (!finalNewName.endsWith(ext)) {
    finalNewName += ext
  }
  
  // Sanitização básica do nome (remove caracteres perigosos)
  // finalNewName = finalNewName.replace(/[^a-z0-9\._-]/gi, '-')

  const newPath = path.join(baseDir, finalNewName)

  // Verificações de segurança
  if (!fs.existsSync(oldPath)) {
    throw createError({ statusCode: 404, message: 'Arquivo original não encontrado.' })
  }
  if (fs.existsSync(newPath)) {
    throw createError({ statusCode: 409, message: 'Já existe um arquivo com este nome.' })
  }

  console.log("oldPath, newPath:", oldPath, newPath)
  try {
    fs.renameSync(oldPath, newPath)
    return { success: true, oldFile, newFile: finalNewName }
  } catch (error) {
    console.error('❌ ERRO AO RENOMEAR:', error);
    throw createError({ statusCode: 500, message: 'Erro ao renomear arquivo: ' + error.message })
  }
})