import { promises as fs } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
// O MDC Runtime é o motor que converte Markdown -> JSON (AST)
import { parseMarkdown } from '@nuxtjs/mdc/runtime'; 

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { site } = body;

  if (!site) throw createError({ statusCode: 400, message: 'Site obrigatório.' });

  // --- 0. CONFIGURAÇÃO ---
  const config = useRuntimeConfig();
  const envPath = config.storagePath as string;
  const APPS_ROOT = resolve(envPath); 
  const SOURCE_ROOT = join(APPS_ROOT, 'storage', site, 'content'); 
  const DEST_ROOT = join(APPS_ROOT, 'sites', site, 'server', 'data');
  
  const stats = { processed: 0, copiedOrders: 0, errors: 0 };
  
  // --- OBJETO PARA GUARDAR AS VERSÕES (_meta.json) ---
  const versions: Record<string, number> = {};

  try {
    // --- 1. LIMPEZA (NUKE) ---
    // Limpa o conteúdo da pasta de destino mantendo a pasta em si
    try {
      const files = await fs.readdir(DEST_ROOT);
      await Promise.all(files.map(f => fs.rm(join(DEST_ROOT, f), { recursive: true, force: true })));
    } catch (e: any) {
      if (e.code !== 'ENOENT') console.error('Aviso na limpeza:', e.message);
      // Se a pasta não existir, criamos agora
      await fs.mkdir(DEST_ROOT, { recursive: true });
    }

    // --- 2. CRAWLER RECURSIVO ---
    async function getFiles(dir: string): Promise<string[]> {
      const dirents = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(dirents.map((dirent) => {
        const res = join(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
      }));
      return Array.prototype.concat(...files);
    }

    // Verifica se a origem existe antes de ler
    try {
        await fs.access(SOURCE_ROOT);
    } catch {
        throw createError({ statusCode: 404, message: `Content não encontrado: ${SOURCE_ROOT}` });
    }

    const allFiles = await getFiles(SOURCE_ROOT);
    const mdFiles = allFiles.filter(f => f.endsWith('.md'));
    const orderFiles = allFiles.filter(f => f.endsWith('_order.yml'));

    // --- 3. COMPILAÇÃO (MARKDOWN -> JSON) ---
    for (const filePath of mdFiles) {
      try {
        // [VERSIONAMENTO] Pega data de modificação
        const fileStat = await fs.stat(filePath);
        const lastModified = fileStat.mtime.getTime(); 

        const rawContent = await fs.readFile(filePath, 'utf-8');
        const relPath = relative(SOURCE_ROOT, filePath);
        
        // Normaliza separadores de path (Windows \\ -> /)
        const normalizedRelPath = relPath.split(sep).join('/');

        // [VERSIONAMENTO] Chave limpa para o manifesto
        // Ex: "home/banner1" ou "index"
        const keyName = normalizedRelPath
            .replace('.md', '')
            .replace(/\/index$/, '') || 'index';
            
        versions[keyName] = lastModified;

        // Parse do Markdown
        const parsedAST = await parseMarkdown(rawContent, { toc: { depth: 2, searchDepth: 2 } });
        parsedAST._id = `content:${site}:${normalizedRelPath}`;
        
        // [PATH FIX] Gera o caminho web correto
        // Se for "index.md" vira "/", se for "sobre.md" vira "/sobre"
        let webPath = normalizedRelPath.replace('.md', '');
        if (webPath.endsWith('index')) webPath = webPath.substring(0, webPath.length - 5); // remove 'index'
        if (webPath.endsWith('/')) webPath = webPath.slice(0, -1); // remove barra final se sobrar
        if (!webPath.startsWith('/')) webPath = '/' + webPath; // garante barra inicial
        if (webPath === '') webPath = '/'; // garante raiz

        parsedAST._path = webPath;
        
        // Salva o JSON
        const destFile = join(DEST_ROOT, relPath.replace('.md', '.json'));
        await fs.mkdir(dirname(destFile), { recursive: true });
        await fs.writeFile(destFile, JSON.stringify(parsedAST, null, 2));

        stats.processed++;
      } catch (err) {
        console.error(`Erro compilando ${filePath}:`, err);
        stats.errors++;
      }
    }

    // --- 4. CÓPIA _ORDER.YML ---
    for (const filePath of orderFiles) {
        try {
            const relPath = relative(SOURCE_ROOT, filePath);
            const destFile = join(DEST_ROOT, relPath);
            await fs.mkdir(dirname(destFile), { recursive: true });
            await fs.copyFile(filePath, destFile);
            stats.copiedOrders++;
        } catch (err) {
            console.error(`Erro copiando ordem ${filePath}:`, err);
        }
    }

    // --- 5. SALVA O MANIFESTO DE VERSÕES (_meta.json) ---
    await fs.writeFile(
      join(DEST_ROOT, '_meta.json'), 
      JSON.stringify(versions, null, 2)
    );
    console.log(`✅ Manifesto _meta.json gerado com ${Object.keys(versions).length} entradas.`);

    return { success: true, details: stats };

  } catch (error: any) {
    console.error(error);
    throw createError({ statusCode: 500, message: error.message });
  }
});