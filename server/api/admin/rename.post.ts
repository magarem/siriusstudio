// server/api/admin/rename.post.ts
import fs from 'node:fs'
import path from 'node:path'
import { getCookie } from 'h3'

// Função auxiliar para limpar o nome do arquivo
const sanitizeFilename = (filename: string) => {
  return filename
    .normalize('NFD')                   // 1. Separa os acentos das letras (ex: 'ç' vira 'c' + '¸')
    .replace(/[\u0300-\u036f]/g, '')    // 2. Remove os caracteres de acento
    .toLowerCase()                      // 3. Tudo minúsculo
    .trim()                             // 4. Remove espaços nas pontas
    .replace(/\s+/g, '-')               // 5. Substitui espaços internos por hífens
    .replace(/[^\w\-\.]/g, '')          // 6. Remove tudo que não for letra, número, underline, hífen ou ponto
    .replace(/\-\-+/g, '-')             // 7. Remove hífens duplicados (ex: --)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const siteCookie = getCookie(event, 'cms_site_context')
  
  // Recebe os caminhos (ex: "content/sobre/Minha História.md")
  let { oldname, newname } = body

  if (!siteCookie) {
    throw createError({ statusCode: 401, message: 'Site não identificado.' })
  }

  if (!oldname || !newname) {
    throw createError({ statusCode: 400, message: 'Parâmetros oldname e newname são obrigatórios.' })
  }

  // --- 🪄 MÁGICA DE SANITIZAÇÃO AQUI ---
  // Separamos o diretório do nome do arquivo para não estragar as barras '/' do caminho
  const newDir = path.dirname(newname) 
  const newBase = path.basename(newname)
  
  // Limpa apenas o nome do arquivo (mantém a extensão e o path)
  const sanitizedBase = sanitizeFilename(newBase)
  
  // Reconstrói o newname sanitizado (ex: content/sobre/minha-historia.md)
  newname = path.join(newDir, sanitizedBase)
  // -------------------------------------

  // 1. Define a Raiz do Site (Storage)
  const storageRoot = path.resolve(process.cwd(), '..', 'storage', siteCookie)

  // 2. Resolve os caminhos absolutos no sistema operacional
  const oldPath = path.join(storageRoot, oldname)
  const newPath = path.join(storageRoot, newname)

  // 3. SEGURANÇA: Garante que o usuário não está tentando acessar arquivos fora da pasta do site
  if (!oldPath.startsWith(storageRoot) || !newPath.startsWith(storageRoot)) {
    throw createError({ statusCode: 403, message: 'Acesso negado: Caminho fora do diretório do site.' })
  }

  // 4. Verificações de existência
  if (!fs.existsSync(oldPath)) {
    throw createError({ statusCode: 404, message: 'Arquivo original não encontrado.' })
  }

  // Verifica se o arquivo destino já existe
  // (Importante checar o newPath que agora usa o nome sanitizado)
  if (fs.existsSync(newPath) && oldPath !== newPath) {
    throw createError({ 
      statusCode: 409, 
      message: `O arquivo destino já existe: ${sanitizedBase}` 
    })
  }

  console.log(`🔄 Renomeando:\nDE: ${oldname}\nPARA: ${newname}`)

  try {
    // 5. Garante que a pasta de destino exista
    const destDir = path.dirname(newPath)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    // 6. Executa a renomeação
    fs.renameSync(oldPath, newPath)

    return { 
      success: true, 
      oldname, 
      newname // Retorna o nome já sanitizado para o frontend atualizar a lista corretamente
    }
  } catch (error) {
    console.error('❌ ERRO AO RENOMEAR:', error);
    throw createError({ statusCode: 500, message: 'Erro de sistema ao renomear arquivo: ' + error.message })
  }
})