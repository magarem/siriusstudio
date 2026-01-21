// server/api/admin/rename.post.ts
import fs from 'node:fs'
import path from 'node:path'
import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const siteCookie = getCookie(event, 'cms_site_context')
  
  // Recebe os caminhos completos relativos à raiz do site
  // Ex: oldname: "content/sobre/about.md"
  // Ex: newname: "content/sobre/about-v2.md" (ou "content/nova-pasta/about.md")
  const { oldname, newname } = body

  if (!siteCookie) {
    throw createError({ statusCode: 401, message: 'Site não identificado.' })
  }

  if (!oldname || !newname) {
    throw createError({ statusCode: 400, message: 'Parâmetros oldname e newname são obrigatórios.' })
  }

  // 1. Define a Raiz do Site (Storage)
  const storageRoot = path.resolve(process.cwd(), '..', 'storage', siteCookie)

  // 2. Resolve os caminhos absolutos no sistema operacional
  const oldPath = path.join(storageRoot, oldname)
  const newPath = path.join(storageRoot, newname)

  // 3. SEGURANÇA: Garante que o usuário não está tentando acessar arquivos fora da pasta do site
  // Isso previne ataques do tipo "../../etc/passwd"
  if (!oldPath.startsWith(storageRoot) || !newPath.startsWith(storageRoot)) {
    throw createError({ statusCode: 403, message: 'Acesso negado: Caminho fora do diretório do site.' })
  }

  // 4. Verificações de existência
  if (!fs.existsSync(oldPath)) {
    throw createError({ statusCode: 404, message: 'Arquivo original não encontrado.' })
  }

  if (fs.existsSync(newPath)) {
    throw createError({ statusCode: 409, message: 'Já existe um arquivo ou pasta com o nome de destino.' })
  }

  console.log(`🔄 Renomeando/Movendo:\nDE: ${oldPath}\nPARA: ${newPath}`)

  try {
    // 5. Garante que a pasta de destino exista (caso seja uma operação de Mover para pasta nova)
    const newDir = path.dirname(newPath)
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true })
    }

    // 6. Executa a renomeação
    fs.renameSync(oldPath, newPath)

    return { 
      success: true, 
      oldname, 
      newname 
    }
  } catch (error) {
    console.error('❌ ERRO AO RENOMEAR:', error);
    throw createError({ statusCode: 500, message: 'Erro de sistema ao renomear arquivo: ' + error.message })
  }
})