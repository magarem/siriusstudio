import matter from 'gray-matter'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler((event) => {
  const domain = getCookie(event, 'cms_site_context')
  const paths = getSitePaths(domain!)
  const filePath = resolve(paths.content, 'settings.md')

  if (!existsSync(filePath)) {
    return { siteName: domain, menu: [] }
  }

  const fileContent = readFileSync(filePath, 'utf-8')
  const { data } = matter(fileContent) // Aqui o gray-matter extrai o YAML como objeto JS
  
  return data
})