import { promises as fs } from 'node:fs';
import { resolve, join, relative, extname } from 'node:path';
import { parseMarkdown } from '@nuxtjs/mdc/runtime'; 
import { parse as parseToml } from 'smol-toml'; 
import yaml from 'js-yaml'; 

export default defineEventHandler(async (event) => {

  let slug = getRouterParam(event, 'slug') || 'index';
  slug = slug.replace(/\/+$/, ''); // Remove a barra final
  if (slug === '') slug = 'index'; // Previne erros na página principal (home)

  const STORAGE_DIR = resolve(process.cwd(), 'content');

  console.log(`🔍 Preview a solicitar: ${slug}`);

  // LISTA DE PRIORIDADES DE BUSCA
  const possiblePaths = [
    // 1. Configurações de Bloco (JSON/TOML/YAML)
    join(STORAGE_DIR, `${slug}.json`),
    join(STORAGE_DIR, slug, '_index.json'),
    join(STORAGE_DIR, slug, '_index.toml'),
    join(STORAGE_DIR, slug, '_index.yml'),
    join(STORAGE_DIR, slug, '_index.yaml'),

    // 2. Padrão Novo Markdown: content/pagina/_index.md
    join(STORAGE_DIR, slug, '_index.md'),
    
    // 3. Caso Especial: Home
    (slug === 'index' ? join(STORAGE_DIR, '_index.toml') : ''),
    (slug === 'index' ? join(STORAGE_DIR, '_index.md') : ''),

    // 4. Fallbacks Antigos
    join(STORAGE_DIR, `${slug}.md`),
    join(STORAGE_DIR, slug, 'index.md')
  ].filter(p => p !== ''); 

  for (const p of possiblePaths) {
    try {
      const rawContent = await fs.readFile(p, 'utf-8');
      const ext = extname(p).toLowerCase();
      
      let resultData = {};
      let resultBody = null; // O AST só será gerado para ficheiros Markdown

      // --- LÓGICA DE PARSE POR EXTENSÃO ---
      if (ext === '.json') {
          resultData = JSON.parse(rawContent);
      } 
      else if (ext === '.toml') {
          resultData = parseToml(rawContent);
      } 
      else if (ext === '.yml' || ext === '.yaml') {
          resultData = yaml.load(rawContent);
      } 
      else {
          // =====================================================================
          // MARKDOWN: Geração da AST no Preview
          // Usamos o parser do MDC para identificar os seus componentes Vue (ex: Listfiles)
          // =====================================================================
          const parsed = await parseMarkdown(rawContent, {
            toc: { depth: 2, searchDepth: 2 }
          });
          
          resultData = parsed.data;
          resultBody = parsed.body; // A AST pura que alimenta o <MDCRenderer>
      }

      // --- MONTAGEM DA RESPOSTA ---
      // Mantém a exata consistência com o ficheiro de compilação
      return {
        data: resultData || {}, 
        body: resultBody, 
        _path: slug === 'index' ? '/' : `/${slug}`,
        _source: 'preview',
        _extension: ext.replace('.', '')
      }; 

    } catch (e) {
      // Se der erro de leitura ou parse, tenta o próximo caminho da lista
      continue; 
    }
  }

  // Se percorreu todos os caminhos e não encontrou nada:
  throw createError({ statusCode: 404, message: 'Página/Rascunho não encontrado.' });
});