import { promises as fs } from 'node:fs';
import { resolve, join, relative, extname } from 'node:path';
import { parseMarkdown } from '@nuxtjs/mdc/runtime'; 
import { parse as parseToml } from 'smol-toml'; // Parser para TOML
import yaml from 'js-yaml'; // Parser para YAML (caso queira suportar também)

export default defineEventHandler(async (event) => {

  let slug = getRouterParam(event, 'slug') || 'index';
  slug = slug.replace(/\/+$/, ''); // Remove barra final

  const STORAGE_DIR = resolve(process.cwd(), 'content');

  console.log(`🔍 Preview solicitando: ${slug}`);

  // LISTA DE PRIORIDADES DE BUSCA
  const possiblePaths = [
    // 1. Prioridade Máxima: Configurações de Bloco (TOML/YAML)
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
      const relativePath = relative(STORAGE_DIR, p);
      
      let resultData = {};
      let resultBody = {};

      // --- LÓGICA DE PARSE POR EXTENSÃO ---
      if (ext === '.json') {
          // JSON: É puramente dados, não tem "Body" (AST)
          resultData = JSON.parse(rawContent);
          resultBody = null; // Smart Blocks não têm corpo de texto rico
      } 
      else if (ext === '.toml') {
          // TOML: É puramente dados, não tem "Body" (AST)
          resultData = parseToml(rawContent);
          resultBody = null; // Smart Blocks não têm corpo de texto rico
      } 
      else if (ext === '.yml' || ext === '.yaml') {
          // YAML: Também puramente dados
          resultData = yaml.load(rawContent);
          resultBody = null;
      } 
      else {
          // MARKDOWN: Usa o parser do Nuxt (MDC)
          const parsed = await parseMarkdown(rawContent, {});
          resultData = parsed.data;
          resultBody = parsed.body;
      }

      // --- MONTAGEM DA RESPOSTA ---
      return {
        data: resultData || {}, // Frontmatter ou Dados do TOML
        body: resultBody,       // AST (apenas para Markdown)
        
        // Metadados do Nuxt Content
        _file: relativePath,
        _path: slug === 'index' ? '/' : `/${slug}`,
        _id: relativePath,
        _extension: ext.replace('.', '')
      }; 

    } catch (e) {
      // Se der erro de leitura ou parse, tenta o próximo
      // console.error(`Erro ao ler ${p}:`, e.message); // Opcional: Debug
      continue; 
    }
  }

  // Se o loop terminou e não retornou nada:
  throw createError({ statusCode: 404, message: 'Página/Rascunho não encontrado.' });
});