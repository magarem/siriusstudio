// server/api/page/[...slug].ts
import fs from 'node:fs/promises';
import path from 'node:path';

// Aponta para a pasta onde o Sirius salvou os JSONs

console.log("process.cwd():::>", process.cwd())
const DATA_DIR = path.resolve(process.cwd(), 'server/data');

export default defineEventHandler(async (event) => {
  // Pega o slug da URL (ex: 'blog/post-1' ou undefined para home)
  let slug = getRouterParam(event, 'slug') || 'index';
  
  // Normaliza: remove barras extras e garante segurança
  slug = slug.replace(/\/+$/, ''); // Remove barra final
  if (Array.isArray(slug)) slug = slug.join('/'); // Se vier como array

  // Estratégia de Resolução de Arquivo:
  // 1. Tenta slug direto (ex: blog.json)
  // 2. Tenta index dentro da pasta (ex: blog/index.json)
  const possiblePaths = [
    path.join(DATA_DIR, `${slug}.json`),
    path.join(DATA_DIR, slug, 'index.json')
  ];

  for (const p of possiblePaths) {
    try {
      // Tenta ler o arquivo
      const content = await fs.readFile(p, 'utf-8');
      console.log("content::::?:>>>", content)
      return JSON.parse(content);
    } catch (e) {
      // Ignora erro e tenta o próximo path
      continue;
    }
  }

  // Se não achou nada
  throw createError({ statusCode: 404, message: 'Página não encontrada (JSON Missing)' });
});