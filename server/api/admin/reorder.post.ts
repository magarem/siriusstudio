import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml' // <--- Importante
import { getCookie, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const siteCookie = getCookie(event, 'cms_site_context')
  const { folder, files } = body 
  // Esperamos: files = ['about.md', 'home.md', 'contact.md']

  if (!folder || !files || !Array.isArray(files)) {
    throw createError({ statusCode: 400, message: 'Dados inválidos.' })
  }

//   const baseDir = path.resolve(process.cwd(), folder)
  const baseDir = path.resolve(process.cwd(), '..', 'storage', siteCookie, folder) 
  
  const orderFilePath = path.join(baseDir, '_order.yml') // Usando .yml

  try {
    // Converte o Array JS para formato YAML
    // - indent: 2 espaços
    // - lineWidth: -1 evita quebras de linha estranhas
    const yamlContent = yaml.dump(files, { indent: 2, lineWidth: -1 })
    
    // Grava o arquivo
    fs.writeFileSync(orderFilePath, yamlContent, 'utf-8')

    return { success: true }
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro ao salvar _order.yml' })
  }
})