import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
// Importa o parser do Nuxt (garanta que o Sirius tenha @nuxt/content instalado)

const STORAGE_ROOT = '/apps/storage';
const SITES_ROOT = '/apps/sites'; // Ou onde ficam os projetos rodando

export default defineEventHandler(async (event) => {
  const { site, file, folder } = await readBody(event);
  
  // --- ORIGEM (Storage Centralizado / MD) ---
  const sourceDir = path.join(STORAGE_ROOT, site, 'content', folder || '');
  const sourceFile = path.join(sourceDir, file);
  
  // --- DESTINO (Pasta do Site / JSON) ---
  // Salvamos dentro do site para acesso ultra-rápido via fs local
  const destDir = path.join(SITES_ROOT, site, 'server', 'data', folder || '');
  const destFile = path.join(destDir, file.replace('.md', '.json'));

  try {
    // 1. Ler o Rascunho MD do Storage
    const mdContent = await readFile(sourceFile, 'utf-8');

    // 2. Compilar para AST (JSON)
    // O ID é usado pelo Nuxt para cache interno, pode ser o caminho do arquivo
    const id = `content:${folder ? folder + ':' : ''}${file}`;
    const parsedAST = await parseMarkdown(id, mdContent);

    // 3. Salvar o JSON compilado no Site
    await mkdir(destDir, { recursive: true });
    
    // Salvamos tudo (body + data)
    await writeFile(destFile, JSON.stringify(parsedAST, null, 2));

    return { success: true, message: 'Publicado e Compilado com sucesso!' };

  } catch (e: any) {
    console.error(e);
    throw createError({ statusCode: 500, message: `Erro ao publicar: ${e.message}` });
  }
});