// server/api/page/[...slug].ts
import fs from 'node:fs/promises';
import path from 'node:path';

// Aponta para a pasta onde o Sirius salvou os JSONs compilados
// Geralmente em produção/build, isso fica em 'data' ou '.output/data'
const DATA_DIR = path.resolve(process.cwd(), 'data');

export default defineEventHandler(async (event) => {
  // 1. Pega o slug da URL
  let slug = getRouterParam(event, 'slug') || 'index';
  
  // 2. Normalização do Slug
  if (Array.isArray(slug)) slug = slug.join('/');
  slug = slug.replace(/\/+$/, ''); // Remove barra final
  if (slug === '') slug = 'index';

  // 3. Estratégia de Resolução de Arquivo
  // O compilador do CMS deve ter gerado arquivos .json para tudo
  const possiblePaths = [
    path.join(DATA_DIR, `${slug}.json`),          // ex: data/contato.json
    path.join(DATA_DIR, slug, 'index.json'),      // ex: data/blog/index.json
    path.join(DATA_DIR, slug, '_index.json')      // ex: data/blog/_index.json (fallback)
  ];

  for (const p of possiblePaths) {
    try {
      // Segurança: garante que não sai da pasta DATA_DIR
      if (!p.startsWith(DATA_DIR)) continue;

      // Tenta ler o arquivo
      const content = await fs.readFile(p, 'utf-8');
      
      // Parseia o JSON
      const jsonContent = JSON.parse(content);

      // =====================================================================
      // 4. PADRONIZAÇÃO DE RESPOSTA (A Correção da "Questão Intrigante")
      // =====================================================================
      
      // Cenário A: O arquivo já é um Markdown compilado pelo CMS?
      // (Geralmente Markdowns compilados já salvam com { data: ..., body: ... })
      if (jsonContent.data && (jsonContent.body || jsonContent._path)) {
          // Retorna como está, pois já está no padrão Nuxt Content
          return jsonContent;
      }

      // Cenário B: O arquivo é um JSON Puro / Configuração (Raw Data)?
      // Se for apenas { "titulo": "Olá" }, nós encapsulamos manualmente 
      // para o front-end não quebrar esperando um .data
      return {
        data: jsonContent,   // O conteúdo vira o Frontmatter
        body: null,          // Não tem corpo de texto (AST)
        _path: slug === 'index' ? '/' : `/${slug}`,
        _source: 'json-api'
      };

    } catch (e) {
      // Arquivo não existe neste path, tenta o próximo da lista
      continue;
    }
  }

  // 5. Se percorreu todas as opções e não achou nada
  // console.warn(`[Page API] 404 Not Found for slug: ${slug}`);
  throw createError({ statusCode: 404, message: 'Página não encontrada' });
});