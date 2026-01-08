import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const { folder } = getQuery(event)
  const rootDir = process.cwd().includes('.output') ? path.join(process.cwd(), '../../') : process.cwd()
  const targetDir = path.resolve(rootDir, 'content', String(folder))

  // Função auxiliar de limpeza de aspas dentro da API
  const cleanValue = (val: string) => {
    if (typeof val !== 'string') return val
    return val.trim().replace(/^["'](.+)["']$/, '$1')
  }

  try {
    if (!fs.existsSync(targetDir)) return []

    const files = fs.readdirSync(targetDir)
    
    const contentList = files
      .filter(file => file.endsWith('.md') && file !== '_index.md')
      .map(file => {
        const filePath = path.join(targetDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf-8')

        const frontmatter: any = {}
        const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---/)
        
        if (match) {
          match[1].split('\n').forEach(line => {
            const [key, ...valParts] = line.split(':')
            if (key && valParts.length) {
              // Limpamos o valor IMEDIATAMENTE na extração
              frontmatter[key.trim()] = cleanValue(valParts.join(':'))
            }
          })
        }

        return {
          title: frontmatter.title || file.replace('.md', ''),
          path: `/${folder}/${file.replace('.md', '')}`,
          ...frontmatter,
          // Garante a estrutura .meta para o frontend não quebrar
          meta: { image: frontmatter.image || '' },
          body: fileContent.replace(/^---[\s\S]+?---/, '').trim()
        }
      })

    return contentList.sort((a, b) => (Number(a.layout_order) || 99) - (Number(b.layout_order) || 99))

  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})