// server/api/components-list.get.ts
import { readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  // Ajuste o caminho conforme a estrutura do seu projeto
  const componentsDir = resolve(process.cwd(), 'app/components')

  try {
    const getFiles = (dir: string): string[] => {
      const files = readdirSync(dir)
      let componentFiles: string[] = []

      files.forEach(file => {
        const filePath = join(dir, file)
        if (statSync(filePath).isDirectory()) {
          // Busca recursiva se você tiver subpastas
          componentFiles = [...componentFiles, ...getFiles(filePath)]
        } else if (file.endsWith('.vue')) {
          // Remove o caminho absoluto e a extensão para retornar apenas o nome/caminho relativo
          const relativePath = filePath.replace(componentsDir + '/', '').replace('.vue', '')
          componentFiles.push(relativePath)
        }
      })
      return componentFiles
    }

    return getFiles(componentsDir)
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao ler pasta de componentes' })
  }
})