import { promises as fs } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { parseMarkdown } from '@nuxtjs/mdc/runtime'; 
import { parse } from 'smol-toml';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { site } = body;

  if (!site) throw createError({ statusCode: 400, message: 'Site obrigatório.' });

  // --- 0. CONFIGURAÇÃO DE CAMINHOS ---
  const config = useRuntimeConfig();
  const envPath = config.storagePath as string;
  const APPS_ROOT = resolve(envPath); 
  
  // ORIGEM: Onde você edita (MD + Imagens)
  const SOURCE_ROOT = join(APPS_ROOT, 'storage', site, 'content'); 
  
  // DESTINO: Onde fica o site compilado (JSON + Imagens)
  const DEST_ROOT = join(APPS_ROOT, 'storage', site, 'data');
  
  const stats = { processed: 0, copiedOrders: 0, copiedJson: 0, copiedImages: 0, errors: 0 };
  const versions: Record<string, number> = {};

  try {
    // --- 1. LIMPEZA (NUKE) ---
    // Limpa a pasta 'data' inteira para garantir que não sobrem arquivos órfãos
    try {
      if (await fs.stat(DEST_ROOT).catch(() => false)) {
          const files = await fs.readdir(DEST_ROOT);
          await Promise.all(files.map(f => fs.rm(join(DEST_ROOT, f), { recursive: true, force: true })));
      } else {
          await fs.mkdir(DEST_ROOT, { recursive: true });
      }
    } catch (e: any) {
      console.error('Aviso na limpeza:', e.message);
    }

    // --- 2. CRAWLER (Buscar arquivos) ---
    async function getFiles(dir: string): Promise<string[]> {
      const dirents = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(dirents.map((dirent) => {
        const res = join(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
      }));
      return Array.prototype.concat(...files);
    }

    // Verifica origem
    try {
        await fs.access(SOURCE_ROOT);
    } catch {
        throw createError({ statusCode: 404, message: `Pasta Content não encontrada: ${SOURCE_ROOT}` });
    }

    const allFiles = await getFiles(SOURCE_ROOT);
    
    // Categoriza os arquivos
    const mdFiles = allFiles.filter(f => f.endsWith('.md'));
    const tomlFiles = allFiles.filter(f => f.endsWith('.toml'));
    const orderFiles = allFiles.filter(f => f.endsWith('_order.yml'));
    const jsonFiles = allFiles.filter(f => f.endsWith('.json')); 
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp'];
    const imageFiles = allFiles.filter(f => {
        const ext = f.toLowerCase().slice(f.lastIndexOf('.'));
        return imageExtensions.includes(ext);
    });

    // --- 3. COMPILAÇÃO (TOML -> JSON) ---
    for (const filePath of tomlFiles) {
      try {
        const rawContent = await fs.readFile(filePath, 'utf-8');
        const parsedToml = parse(rawContent); 
        
        const relPath = relative(SOURCE_ROOT, filePath);
        const destFile = join(DEST_ROOT, relPath.replace('.toml', '.json'));

        // Versionamento
        const fileStat = await fs.stat(filePath);
        const keyName = relPath.replace('.toml', '').split(sep).join('/');
        versions[keyName] = fileStat.mtime.getTime();

        await fs.mkdir(dirname(destFile), { recursive: true });
        await fs.writeFile(destFile, JSON.stringify(parsedToml, null, 2));

        stats.processed++; 
      } catch (err) {
        console.error(`Erro compilando TOML ${filePath}:`, err);
        stats.errors++;
      }
    }

    // --- 4. COMPILAÇÃO (MARKDOWN -> AST JSON) ---
    for (const filePath of mdFiles) {
      try {
        const fileStat = await fs.stat(filePath);
        const lastModified = fileStat.mtime.getTime(); 

        const rawContent = await fs.readFile(filePath, 'utf-8');
        const relPath = relative(SOURCE_ROOT, filePath);
        const normalizedRelPath = relPath.split(sep).join('/');

        // Versionamento
        let keyName = normalizedRelPath.replace('.md', '');
        if (keyName.endsWith('_index')) keyName = keyName.replace('_index', 'index');
        versions[keyName] = lastModified;

        // =====================================================================
        // O CORAÇÃO DO MDC: Geração da Árvore de Sintaxe (AST)
        // Isso converte <Listfiles> ou ::listfiles no objeto JSON correto
        // =====================================================================
        const parsedAST = await parseMarkdown(rawContent, { 
            toc: { depth: 2, searchDepth: 2 } 
        });
        
        // Caminho Web (Slug)
        let webPath = normalizedRelPath.replace('.md', '');
        if (webPath.endsWith('/_index')) webPath = webPath.substring(0, webPath.length - 7);
        else if (webPath.endsWith('/index')) webPath = webPath.substring(0, webPath.length - 6);
        else if (webPath === '_index' || webPath === 'index') webPath = ''; 
        if (!webPath.startsWith('/')) webPath = '/' + webPath;
        if (webPath === '') webPath = '/';
        
        // Monta o JSON final, devolvendo o `body` que o frontend espera
        const finalJsonObj = {
          data: parsedAST.data || {},
          body: parsedAST.body, // A AST pura que alimenta o <MDCRenderer>
          _id: `content:${site}:${normalizedRelPath}`,
          _path: webPath
        };
        // =====================================================================
        
        // Define nome do arquivo de saída
        let destFileName = relPath;
        if (destFileName.endsWith('_index.md')) {
            destFileName = destFileName.replace('_index.md', 'index.json');
        } else {
            destFileName = destFileName.replace('.md', '.json');
        }

        const destFile = join(DEST_ROOT, destFileName);
        
        await fs.mkdir(dirname(destFile), { recursive: true });
        await fs.writeFile(destFile, JSON.stringify(finalJsonObj, null, 2));

        stats.processed++;
      } catch (err) {
        console.error(`Erro compilando MD ${filePath}:`, err);
        stats.errors++;
      }
    }

    // --- 5. CÓPIA DE ARQUIVOS AUXILIARES ---
    const auxFiles = [...jsonFiles, ...orderFiles];
    for (const filePath of auxFiles) {
      try {
        const relPath = relative(SOURCE_ROOT, filePath);
        const destFile = join(DEST_ROOT, relPath);
        
        if (filePath.endsWith('.json')) {
            const normalizedRelPath = relPath.split(sep).join('/');
            const keyName = normalizedRelPath.replace('.json', '');
            if (!versions[keyName]) {
                const s = await fs.stat(filePath);
                versions[keyName] = s.mtime.getTime();
            }
        }

        await fs.mkdir(dirname(destFile), { recursive: true });
        await fs.copyFile(filePath, destFile);
        
        if (filePath.endsWith('_order.yml')) stats.copiedOrders++;
        else stats.copiedJson++;

      } catch (err) {
        console.error(`Erro copiando auxiliar ${filePath}:`, err);
      }
    }

    // --- 6. CÓPIA DE IMAGENS ---
    for (const filePath of imageFiles) {
        try {
            const relPath = relative(SOURCE_ROOT, filePath);
            const destFile = join(DEST_ROOT, relPath);
            
            await fs.mkdir(dirname(destFile), { recursive: true });
            await fs.copyFile(filePath, destFile);
            stats.copiedImages++;
        } catch (err) {
            console.error(`Erro copiando imagem ${filePath}:`, err);
            stats.errors++;
        }
    }

    // --- 7. MANIFESTO ---
    await fs.writeFile(
      join(DEST_ROOT, '_meta.json'), 
      JSON.stringify(versions, null, 2)
    );

    console.log(`✅ Compilação concluída: ${site} -> storage/${site}/data`);
    return { success: true, details: stats };

  } catch (error: any) {
    console.error(error);
    throw createError({ statusCode: 500, message: error.message });
  }
});