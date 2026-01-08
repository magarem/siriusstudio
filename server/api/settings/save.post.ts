import matter from 'gray-matter'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const domain = getCookie(event, 'cms_site_context')
  const newData = await readBody(event) // Recebe o novo objeto de menu/settings
  
  const paths = getSitePaths(domain!)
  const filePath = resolve(paths.content, 'settings.md')

  // Transforma o objeto de volta em Markdown com Frontmatter
  const updatedFile = matter.stringify('Configurações do sistema gerenciadas pelo SiriusStudio.', newData)

  try {
    writeFileSync(filePath, updatedFile, 'utf-8')
    return { success: true }
  } catch (e) {
    throw createError({ statusCode: 500, message: 'Erro ao salvar settings.md' })
  }
})