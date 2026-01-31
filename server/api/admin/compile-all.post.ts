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
  
  const stats = { processed: 0, copiedOrders: 0, copiedJson: 0, errors: 0 };
  const versions: Record<string, number> = {};

  try {
    // --- 1. LIMPEZA (NUKE) ---
    try {
      const files = await fs.readdir(DEST_ROOT);
      await Promise.all(files.map(f => fs.rm(join(DEST_ROOT, f), { recursive: true, force: true })));
    } catch (e: any) {
      if (e.code !== 'ENOENT') console.error('Aviso na limpeza:', e.message);
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

    // Verifica se a origem existe
    try {
        await fs.access(SOURCE_ROOT);
    } catch {
        throw createError({ statusCode: 404, message: `Content não encontrado: ${SOURCE_ROOT}` });
    }

    const allFiles = await getFiles(SOURCE_ROOT);
    
    // Filtros
    const mdFiles = allFiles.filter(f => f.endsWith('.md'));
    const orderFiles = allFiles.filter(f => f.endsWith('_order.yml'));
    const jsonFiles = allFiles.filter(f => f.endsWith('.json'));

    // --- 3. COMPILAÇÃO (MARKDOWN -> JSON) ---
    for (const filePath of mdFiles) {
      try {
        const fileStat = await fs.stat(filePath);
        const lastModified = fileStat.mtime.getTime(); 

        const rawContent = await fs.readFile(filePath, 'utf-8');
        const relPath = relative(SOURCE_ROOT, filePath);
        
        // Normaliza path (Windows/Linux)
        const normalizedRelPath = relPath.split(sep).join('/');

        // [DETECÇÃO DE INDEX]
        // Verifica se é um arquivo _index.md ou index.md
        const isIndex = normalizedRelPath.endsWith('_index.md') || normalizedRelPath.endsWith('index.md');

        // [VERSIONAMENTO] 
        // Se for _index.md, a chave no meta deve ser "pasta/index"
        let keyName = normalizedRelPath.replace('.md', '');
        if (keyName.endsWith('_index')) keyName = keyName.replace('_index', 'index');
        versions[keyName] = lastModified;

        // Parse do Markdown
        const parsedAST = await parseMarkdown(rawContent, { toc: { depth: 2, searchDepth: 2 } });
        parsedAST._id = `content:${site}:${normalizedRelPath}`;
        
        // [PATH FIX] Gera o caminho web correto (Slug)
        // Remove .md, remove _index e index do final para gerar rota limpa
        let webPath = normalizedRelPath.replace('.md', '');
        
        // Remove sufixos para a URL
        if (webPath.endsWith('/_index')) webPath = webPath.substring(0, webPath.length - 7);
        else if (webPath.endsWith('/index')) webPath = webPath.substring(0, webPath.length - 6);
        else if (webPath === '_index' || webPath === 'index') webPath = ''; // Home

        // Garante barra inicial
        if (!webPath.startsWith('/')) webPath = '/' + webPath;
        if (webPath === '') webPath = '/';

        parsedAST._path = webPath;
        
        // [OUTPUT FIX] Define o nome do arquivo JSON de destino
        // Se a entrada for "pasta/_index.md", a saída DEVE ser "pasta/index.json"
        // para que o Runtime ache fácil.
        let destFileName = relPath;
        if (destFileName.endsWith('_index.md')) {
            destFileName = destFileName.replace('_index.md', 'index.json');
        } else {
            destFileName = destFileName.replace('.md', '.json');
        }

        const destFile = join(DEST_ROOT, destFileName);
        
        await fs.mkdir(dirname(destFile), { recursive: true });
        await fs.writeFile(destFile, JSON.stringify(parsedAST, null, 2));

        stats.processed++;
      } catch (err) {
        console.error(`Erro compilando ${filePath}:`, err);
        stats.errors++;
      }
    }

    // --- 4. CÓPIA DE ARQUIVOS JSON PUROS ---
    for (const filePath of jsonFiles) {
      try {
        const relPath = relative(SOURCE_ROOT, filePath);
        const destFile = join(DEST_ROOT, relPath);
        
        const fileStat = await fs.stat(filePath);
        const normalizedRelPath = relPath.split(sep).join('/');
        const keyName = normalizedRelPath.replace('.json', '');
        
        if (!versions[keyName]) {
            versions[keyName] = fileStat.mtime.getTime();
        }

        await fs.mkdir(dirname(destFile), { recursive: true });
        await fs.copyFile(filePath, destFile);
        
        stats.copiedJson++;
      } catch (err) {
        console.error(`Erro copiando JSON ${filePath}:`, err);
        stats.errors++;
      }
    }

    // --- 5. CÓPIA _ORDER.YML ---
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

    // --- 6. MANIFESTO ---
    await fs.writeFile(
      join(DEST_ROOT, '_meta.json'), 
      JSON.stringify(versions, null, 2)
    );

    console.log(`✅ Compilação concluída para ${site}.`);
    return { success: true, details: stats };

  } catch (error: any) {
    console.error(error);
    throw createError({ statusCode: 500, message: error.message });
  }
});