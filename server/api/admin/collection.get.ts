import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { getCookie } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const folder = query.folder as string
  const site = getCookie(event, "cms_site_context");

  if (!folder) throw createError({ statusCode: 400, message: 'Folder is required' })

  // Caminho absoluto
  const contentDir = path.resolve(process.cwd(), '..', 'storage', site, 'content', folder)

  if (!fs.existsSync(contentDir)) return []

  try {
    const files = fs.readdirSync(contentDir)

    const items = files
      .map(file => {
        // Ignora arquivos de sistema
        if (file.startsWith('.')) return null;

        const filePath = path.join(contentDir, file)
        const stats = fs.statSync(filePath)
        
        let fileContent = ""
        let isDirectory = false
        let finalExtension = ""

        // CENÁRIO 1: É UMA PASTA (Page Bundle)
        if (stats.isDirectory()) {
            isDirectory = true;
            // Procura por um arquivo index dentro da pasta
            const indexCandidates = ['index.md', '_index.md', 'index.json', '_index.json'];
            const foundIndex = indexCandidates.find(idx => fs.existsSync(path.join(filePath, idx)));
            
            if (foundIndex) {
                fileContent = fs.readFileSync(path.join(filePath, foundIndex), 'utf-8');
                finalExtension = foundIndex.split('.').pop();
            } else {
                // É uma pasta sem index (talvez apenas assets), ignorar ou listar como pasta vazia
                return null; 
            }
        } 
        // CENÁRIO 2: É UM ARQUIVO SOLTO
        else {
            if (!['.md', '.json', '.yml', '.yaml', '.toml'].some(ext => file.endsWith(ext))) return null;
            fileContent = fs.readFileSync(filePath, 'utf-8');
            finalExtension = file.split('.').pop();
        }

        // Parse do Conteúdo
        let parsedData: any = {}
        try {
          if (finalExtension === 'md') {
            const parsed = matter(fileContent)
            parsedData = parsed.data
          } else if (finalExtension === 'json') {
            parsedData = JSON.parse(fileContent)
          }
        } catch (e) {
          console.warn(`[API] Erro ao ler ${file}`)
        }

        return {
          // Se for diretório, o path é o nome da pasta. Se for arquivo, remove a extensão.
          _path: `/${folder}/${file.replace(/\.(md|json|yml|yaml|toml)$/, '')}`,
          _file: isDirectory ? `${folder}/${file}` : `${folder}/${file}`, // Mantém referência para abrir
          _extension: finalExtension,
          _isDir: isDirectory,
          created_at: stats.birthtime,
          updated_at: stats.mtime,
          title: parsedData.title || file,
          ...parsedData
        }
      })
      .filter(item => item !== null) // Remove nulos

    // Ordenação
    return items.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at).getTime()
      const dateB = new Date(b.date || b.created_at).getTime()
      return dateB - dateA
    })

  } catch (error) {
    console.error(`[API Collection] Erro:`, error)
    return []
  }
})