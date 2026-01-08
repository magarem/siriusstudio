// apps/siriusstudio/server/api/content/create.post.ts
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const domain = getCookie(event, 'cms_site_context')
  const { fileName } = await readBody(event)

  if (!domain || !fileName) throw createError({ statusCode: 400, message: 'Dados insuficientes' })

  const paths = getSitePaths(domain)
  // Garante que termina com .md
  const name = fileName.endsWith('.md') ? fileName : `${fileName}.md`
  const fullPath = resolve(paths.content, name)

  if (existsSync(fullPath)) {
    throw createError({ statusCode: 400, message: 'Este arquivo já existe!' })
  }

  // Conteúdo inicial padrão (Frontmatter)
  const initialContent = `---\ntitle: ${name.replace('.md', '')}\n---`

  try {
    writeFileSync(fullPath, initialContent, 'utf-8')
    return { success: true, fileName: name }
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message })
  }
})