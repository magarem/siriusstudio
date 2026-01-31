import { promises as fs } from 'node:fs';
import { resolve, join, relative, dirname } from 'node:path';
import { parseMarkdown } from '@nuxtjs/mdc/runtime'; 

export default defineEventHandler(async (event) => {

  let slug = getRouterParam(event, 'slug') || 'index';
  slug = slug.replace(/\/+$/, ''); // Remove barra final

  // Ajuste o caminho base se necessário (ex: ../storage/site/content ou apenas content)
  const STORAGE_DIR = resolve(process.cwd(), 'content');

  console.log(`🔍 Preview solicitando: ${slug}`);

  // LISTA DE PRIORIDADES DE BUSCA
  // Agora priorizamos o _index.md dentro da pasta
  const possiblePaths = [
    // 1. O Padrão Novo: content/minha-pagina/_index.md
    join(STORAGE_DIR, slug, '_index.md'),
    
    // 2. Caso Especial: Home (content/_index.md)
    (slug === 'index' ? join(STORAGE_DIR, '_index.md') : ''),

    // 3. Fallback: Arquivo solto antigo (content/minha-pagina.md)
    join(STORAGE_DIR, `${slug}.md`),

    // 4. Fallback: Padrão antigo de index (content/minha-pagina/index.md)
    join(STORAGE_DIR, slug, 'index.md')
  ].filter(p => p !== ''); // Remove strings vazias

  for (const p of possiblePaths) {
    try {
      // Tenta ler o arquivo
      const rawContent = await fs.readFile(p, 'utf-8');
      
      // Compila o Markdown
      const parsed = await parseMarkdown(rawContent, {});

      // --- TRUQUE DO SIRIUS ---
      // Injetamos o caminho real do arquivo no objeto de resposta.
      // Isso ajuda a Previewbar a saber EXATAMENTE o que editar.
      // Ex: "atrativos/alimentacao/bistro/_index.md"
      const relativePath = relative(STORAGE_DIR, p);
      
      // Adicionamos essas propriedades "escondidas" que o Nuxt Content costuma ter
      parsed._file = relativePath;
      parsed._path = slug === 'index' ? '/' : `/${slug}`;
      parsed._id = relativePath; // Id único baseado no arquivo

      return {
        data: parsed.data, // Frontmatter
        body: parsed.body, // AST do conteúdo
        _file: relativePath,
        _path: parsed._path
      }; 
    } catch (e) {
      // Se não achou, silencia o erro e tenta o próximo da lista
      continue; 
    }
  }

  // Se o loop terminou e não retornou nada:
  throw createError({ statusCode: 404, message: 'Página/Rascunho não encontrado.' });
});