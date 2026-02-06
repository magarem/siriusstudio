import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import yaml from 'js-yaml'
import toml from '@ltd/j-toml'
import { parse as csvParse } from 'csv-parse/sync'
import { XMLParser } from 'fast-xml-parser'
import Database from 'better-sqlite3' // <--- Importante: Certifique-se que está instalado

const getNestedValue = (obj: any, path: string) => {
  if (!path) return obj
  return path.split('.').reduce((acc, part) => {
    return (acc && acc[part] !== undefined) ? acc[part] : null
  }, obj)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetPath = query.path as string
  const targetNode = query.node as string
  const mode = query.mode as string 

  if (!targetPath) {
    throw createError({ statusCode: 400, message: 'Caminho do arquivo obrigatório' })
  }

  const rootDir = process.cwd()
  const absolutePath = path.resolve(rootDir, targetPath.startsWith('/') ? targetPath.slice(1) : targetPath)

  if (!absolutePath.startsWith(rootDir)) {
    throw createError({ statusCode: 403, message: 'Acesso negado.' })
  }

  if (!fs.existsSync(absolutePath)) {
    throw createError({ statusCode: 404, message: 'Arquivo não encontrado' })
  }

  const ext = path.extname(absolutePath).toLowerCase()

  // --- MODO RAW (Se não for SQLite) ---
  // SQLite é binário, então não faz sentido ler como texto puro no modo raw, 
  // a menos que queira baixar o arquivo (stream), mas aqui vamos pular.
  if (mode === 'raw' && !['.db', '.sqlite', '.sqlite3'].includes(ext)) {
    const rawContent = fs.readFileSync(absolutePath, 'utf-8')
    setResponseHeader(event, 'Content-Type', 'text/plain')
    return rawContent
  }

  let parsedData: any = null

  try {
    switch (ext) {
      // --- BANCO DE DADOS (SQLite) ---
      case '.db':
      case '.sqlite':
      case '.sqlite3':
        // Abre o banco apenas para leitura
        const db = new Database(absolutePath, { readonly: true })
        
        // 1. Pega todas as tabelas (ignorando as internas do sqlite)
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]
        
        parsedData = {}
        
        // 2. Para cada tabela, busca todos os dados
        // OBS: Se o banco for GIGANTE, isso pode ser pesado. Para CMS é tranquilo.
        for (const table of tables) {
          const rows = db.prepare(`SELECT * FROM ${table.name}`).all()
          parsedData[table.name] = rows
        }
        
        db.close()
        break

      // --- TEXTO / CONFIG ---
      case '.json':
        parsedData = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'))
        break

      case '.yaml':
      case '.yml':
        parsedData = yaml.load(fs.readFileSync(absolutePath, 'utf-8'))
        break

      case '.toml':
        parsedData = Object.assign({}, toml.parse(fs.readFileSync(absolutePath, 'utf-8')))
        break

      case '.csv':
        parsedData = csvParse(fs.readFileSync(absolutePath, 'utf-8'), { 
          columns: true, 
          skip_empty_lines: true,
          trim: true 
        })
        break

      case '.xml':
        const parser = new XMLParser()
        parsedData = parser.parse(fs.readFileSync(absolutePath, 'utf-8'))
        break

      case '.md':
      case '.markdown':
        const { data, content } = matter(fs.readFileSync(absolutePath, 'utf-8'))
        parsedData = { data, body: content }
        break
        
      case '.html':
         parsedData = { content: fs.readFileSync(absolutePath, 'utf-8') }
         break

      default:
        parsedData = { content: fs.readFileSync(absolutePath, 'utf-8') }
    }

    // Filtragem por nó (Funciona para SQLite também!)
    if (targetNode) {
      return getNestedValue(parsedData, targetNode)
    }

    return parsedData

  } catch (err: any) {
    throw createError({ 
      statusCode: 500, 
      message: `Erro ao processar arquivo ${ext}: ${err.message}` 
    })
  }
})