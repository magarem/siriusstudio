import { createReadStream, existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  // 1. Pega o caminho da URL (ex: sobre/visitacao/foto.jpg)
  const pathParam = event.context.params?.path
  if (!pathParam) {
    throw createError({ statusCode: 400, message: "Caminho inválido" })
  }

  

  // 2. Decodifica caracteres especiais (espaços, acentos)
  const decodedPath = decodeURIComponent(pathParam)

  let siteId = getCookie(event, 'cms_site_context')
  // 3. Monta o caminho absoluto baseando-se na pasta 'content' da raiz do projeto
  // Como 'content' é um symlink, o Node.js vai seguir automaticamente.
  
  let filePath = ""
  if (siteId) {
     filePath = resolve(process.cwd(), '..', 'storage', siteId, 'content', decodedPath)
  }else{
     filePath = resolve(process.cwd(), 'content', decodedPath)
  }
 
  // Debug: Veja no terminal qual caminho exato ele está tentando ler
  console.log(`📂 Request Asset: ${decodedPath}`)
  console.log(`📍 Caminho Físico Resolvido: ${filePath}`)

  // 4. Verifica se o arquivo existe E se é um arquivo mesmo (não pasta)
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`)
    throw createError({ statusCode: 404, message: "Arquivo não encontrado" })
  }

  // 5. Define o tipo do arquivo (MIME Type)
  const ext = filePath.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = { 
    'jpg': 'image/jpeg', 
    'jpeg': 'image/jpeg', 
    'png': 'image/png', 
    'gif': 'image/gif', 
    'webp': 'image/webp', 
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf'
  }
  
  if (ext && mimeTypes[ext]) {
    setHeader(event, 'Content-Type', mimeTypes[ext])
  }
  
  // Cache (Importante para performance)
  setHeader(event, 'Cache-Control', 'public, max-age=86400')

  // 6. Entrega o arquivo via Stream (eficiente para memória)
  return sendStream(event, createReadStream(filePath))
})