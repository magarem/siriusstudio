// server/api/page/[...slug].ts
import fs from 'node:fs/promises';
import path from 'node:path';

// Aponta para a pasta onde o Sirius salvou os JSONs
const DATA_DIR = path.resolve(process.cwd(), 'server/data');

export default defineEventHandler(async (event) => {
  // Pega o slug da URL (ex: 'atrativos/bistro' ou undefined para home)
  let slug = getRouterParam(event, 'slug') || 'index';
  
  // Normaliza: remove barras extras e garante segurança
  // Se vier array (Nuxt behavior), junta com /
  if (Array.isArray(slug)) slug = slug.join('/');
  
  slug = slug.replace(/\/+$/, ''); // Remove barra final

  // Se o slug for vazio (rota raiz), assume 'index'
  if (slug === '') slug = 'index';

  // Estratégia de Resolução de Arquivo:
  // Como o Compiler converteu "_index.md" para "index.json",
  // a lógica padrão de pastas funciona.
  const possiblePaths = [
    // 1. Tenta slug direto (ex: server/data/contato.json)
    path.join(DATA_DIR, `${slug}.json`),
    
    // 2. Tenta index dentro da pasta (ex: server/data/atrativos/index.json)
    // Isso resolve o caso de pastas como "atrativos/_index.md" que virou "index.json"
    path.join(DATA_DIR, slug, 'index.json'),

    // 3. (Fallback de segurança) Tenta _index.json caso algo tenha passado sem renomear
    path.join(DATA_DIR, slug, '_index.json')
  ];

  for (const p of possiblePaths) {
    try {
      // Verifica se o caminho está dentro de DATA_DIR para segurança (evitar ../../)
      if (!p.startsWith(DATA_DIR)) continue;

      // Tenta ler o arquivo
      const content = await fs.readFile(p, 'utf-8');
      
      // Se leu com sucesso, parseia e retorna
      const json = JSON.parse(content);
      return json;
      
    } catch (e) {
      // Arquivo não existe neste path, tenta o próximo
      continue;
    }
  }

  // Se percorreu todas as opções e não achou
  console.warn(`[Page API] 404 Not Found for slug: ${slug}`);
  throw createError({ statusCode: 404, message: 'Página não encontrada' });
});