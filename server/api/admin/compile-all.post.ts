import { promises as fs } from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';

// O MDC Runtime é o motor que converte Markdown -> JSON (AST)
import { parseMarkdown } from '@nuxtjs/mdc/runtime'; 

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { site } = body;

  if (!site) {
    throw createError({ statusCode: 400, message: 'O parâmetro "site" é obrigatório.' });
  }

  // --- 1. DEFINIÇÃO DE CAMINHOS ---
  const APPS_ROOT = resolve(process.cwd(), '..'); 
  
  // Origem (MD)
  const SOURCE_ROOT = join(APPS_ROOT, 'storage', site, 'content'); // Ou 'drafts' se mudou a arquitetura
  
  // Destino (JSON)
  const DEST_ROOT = join(APPS_ROOT, 'sites', site, 'server', 'data');
  
  console.log(`📂 Lendo de: ${SOURCE_ROOT}`);
  console.log(`💾 Salvando em: ${DEST_ROOT}`);

  const stats = {
    cleaned: false,
    processed: 0,
    errors: 0,
    files: [] as string[]
  };

  try {
    // --- 2. LIMPEZA (NUKE) ---
    // Remove os arquivos antigos para evitar "fantasmas" (arquivos deletados no CMS que sobram no site)
    console.log('🧹 Iniciando limpeza de diretórios...');
    
    await Promise.all([
      // Limpa a pasta de dados (JSONs)
      fs.rm(DEST_ROOT, { recursive: true, force: true }),
      // Limpa o cache de renderização do servidor
    //   fs.rm(CACHE_ROOT, { recursive: true, force: true })
    ]);
    
    console.log('✨ Diretórios limpos com sucesso!');
    stats.cleaned = true;

    // --- 3. VERIFICAÇÃO ---
    try {
      await fs.access(SOURCE_ROOT);
    } catch {
      throw createError({ statusCode: 404, message: `Pasta content não encontrada: ${SOURCE_ROOT}` });
    }

    // --- 4. CRAWLER RECURSIVO ---
    async function getFiles(dir: string): Promise<string[]> {
      const dirents = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(dirents.map((dirent) => {
        const res = join(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
      }));
      return Array.prototype.concat(...files);
    }

    const allFiles = await getFiles(SOURCE_ROOT);
    const mdFiles = allFiles.filter(f => f.endsWith('.md'));

    console.log(`🚀 Iniciando compilação de ${mdFiles.length} arquivos...`);

    // --- 5. COMPILAÇÃO ---
    for (const filePath of mdFiles) {
      try {
        const rawContent = await fs.readFile(filePath, 'utf-8');
        const relPath = relative(SOURCE_ROOT, filePath);
        
        // ID único para debug
        const contentId = `content:${site}:${relPath.replace(/\//g, ':')}`;

        // PARSE (A MÁGICA)
        const parsedAST = await parseMarkdown(rawContent, {
          toc: {
            depth: 2,
            searchDepth: 2
          }
        });

        // Injeta metadados úteis na AST
        parsedAST._id = contentId;
        parsedAST._path = '/' + relPath.replace('.md', '').replace('/index', '');

        // Define destino
        const destFile = join(DEST_ROOT, relPath.replace('.md', '.json'));
        const destFolder = dirname(destFile);

        // Cria a pasta de destino (pois deletamos o DEST_ROOT na limpeza)
        await fs.mkdir(destFolder, { recursive: true });
        
        // Salva
        await fs.writeFile(destFile, JSON.stringify(parsedAST, null, 2));

        stats.processed++;
        stats.files.push(relPath);
      } catch (err: any) {
        console.error(`❌ Erro em ${filePath}:`, err);
        stats.errors++;
      }
    }

    return {
      success: true,
      message: `Concluído! Limpeza realizada e ${stats.processed} arquivos gerados.`,
      details: stats
    };

  } catch (error: any) {
    console.error(error);
    throw createError({ statusCode: 500, message: error.message });
  }
});