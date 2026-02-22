import fs from 'node:fs/promises';
import path from 'node:path';
import { defineEventHandler, getRouterParam, createError } from 'h3';

const DATA_DIR = path.resolve(process.cwd(), 'data');

export default defineEventHandler(async (event) => {
  let slug = getRouterParam(event, 'slug') || 'index';
  
  if (Array.isArray(slug)) slug = slug.join('/');
  slug = slug.replace(/\/+$/, '');
  if (slug === '') slug = 'index';

  const possiblePaths = [
    path.join(DATA_DIR, `${slug}.json`),
    path.join(DATA_DIR, slug, 'index.json'),
    path.join(DATA_DIR, slug, '_index.json')
  ];

  for (const p of possiblePaths) {
    try {
      if (!p.startsWith(DATA_DIR)) continue;

      const content = await fs.readFile(p, 'utf-8');
      const jsonContent = JSON.parse(content);

      // =====================================================================
      // PADRONIZAÇÃO DE RESPOSTA PARA O @nuxtjs/mdc
      // =====================================================================
      
      // Se o JSON tiver metadados (veio de um Markdown compilado)
      if (jsonContent.data) {
          // Pegamos o texto puro. 
          // (Suportando 'markdownString', 'content' ou o antigo 'body' caso haja legado)
          const rawText = jsonContent.markdownString || jsonContent.content || jsonContent.body || '';
          
          return {
        data: jsonContent.data,
        body: jsonContent.body, // <-- Devolve a AST
        _path: slug === 'index' ? '/' : `/${slug}`,
        _source: 'cms-compiled'
    };
      }

      // Se for um JSON de dados brutos (ex: configurações sem texto)
      return {
        data: jsonContent,   
        markdownString: null, 
        _path: slug === 'index' ? '/' : `/${slug}`,
        _source: 'json-raw'
      };

    } catch (e) {
      continue;
    }
  }

  throw createError({ statusCode: 404, message: 'Página não encontrada' });
});