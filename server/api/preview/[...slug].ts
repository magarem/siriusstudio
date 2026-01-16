// server/api/preview/[...slug].ts
import { promises as fs } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseMarkdown } from '@nuxtjs/mdc/runtime'; 

export default defineEventHandler(async (event) => {
  // 1. Descobre o Slug
  let slug = getRouterParam(event, 'slug') || 'index';
  slug = slug.replace(/\/+$/, ''); // Remove barra final

  // 2. Aponta para a pasta de Rascunhos (DRAFTS) no Storage
  // Caminho relativo: site está em /apps/sites/novagokula -> sobe 2 niveis -> entra em storage
  // Ajuste 'novagokula' se quiser deixar dinâmico via env, mas hardcoded funciona agora.
  const STORAGE_DIR = resolve(process.cwd(), '../../storage/novagokula/content');

  console.log(`🔍 Preview solicitando: ${slug} em ${STORAGE_DIR}`);

  // 3. Tenta achar o arquivo MD (mesma lógica de fallback)
  const possiblePaths = [
    join(STORAGE_DIR, `${slug}.md`),
    join(STORAGE_DIR, slug, 'index.md')
  ];

  for (const p of possiblePaths) {
    try {
      // Lê o Markdown Cru
      const rawContent = await fs.readFile(p, 'utf-8');
      
      // Compila na hora (On-the-fly)
      // Isso é mais lento que ler JSON, mas para preview não importa
      const parsed = await parseMarkdown(rawContent, {});

      // Retorna no formato que o useSmartContent espera
      return parsed; 
    } catch (e) {
      continue; // Tenta o próximo
    }
  }

  throw createError({ statusCode: 404, message: 'Rascunho não encontrado' });
});