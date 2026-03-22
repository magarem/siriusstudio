import { Elysia, t } from "elysia";
import { readdir, rm, mkdir, access, stat, copyFile } from "node:fs/promises";
import { join, normalize, dirname, relative, sep } from "node:path";
import { parseMarkdown } from "@nuxtjs/mdc/runtime"; 
import { parse as parseToml } from "smol-toml"; // Renomeado para maior clareza
import { CONFIG } from "../../config"; // Usando a fonte centralizada

export const publishRoutes = new Elysia({ prefix: "/publish" })
  // JWT e validação do 'site' já resolvidos pelo grupo no index.ts

  .post("/", async ({ site, set }) => {
    // O site agora vem injetado automaticamente pelo contexto global
    set.headers['content-type'] = 'application/json';

    // --- 0. CONFIGURAÇÃO DE CAMINHOS ---
    // SOURCE: onde o usuário edita (content) | DEST: onde o Nuxt lê (data)
    const baseDir = normalize(CONFIG.paths.storage);
    const siteStr = String(site);
    
    const SOURCE_ROOT = normalize(join(baseDir, siteStr, 'content')); 
    const DEST_ROOT = normalize(join(baseDir, siteStr, 'data'));
    
    const stats = { processed: 0, copiedOrders: 0, copiedJson: 0, copiedImages: 0, errors: 0 };
    const versions: Record<string, number> = {};

    try {
      // --- 1. LIMPEZA E PREPARAÇÃO ---
      // Apaga o cache de produção antigo (a pasta inteira) e recria
      await rm(DEST_ROOT, { recursive: true, force: true });
      await mkdir(DEST_ROOT, { recursive: true });

      // Verificação de existência da origem
      try {
        await access(SOURCE_ROOT);
      } catch {
        set.status = 404;
        return { success: false, error: `Pasta de rascunhos (content) não encontrada para o site: ${siteStr}` };
      }

      // --- 2. CRAWLER (Buscar arquivos recursivamente) ---
      async function getFiles(dir: string): Promise<string[]> {
        const dirents = await readdir(dir, { withFileTypes: true });
        // Promise.all executa as buscas em subpastas em paralelo!
        const files = await Promise.all(dirents.map(async (dirent) => {
          const res = join(dir, dirent.name);
          return dirent.isDirectory() ? await getFiles(res) : res;
        }));
        return Array.prototype.concat(...files);
      }

      const allFiles = await getFiles(SOURCE_ROOT);
      
      // Filtros por tipo de arquivo
      const mdFiles = allFiles.filter(f => f.endsWith('.md'));
      const tomlFiles = allFiles.filter(f => f.endsWith('.toml'));
      const orderFiles = allFiles.filter(f => f.endsWith('_order.yml'));
      const jsonFiles = allFiles.filter(f => f.endsWith('.json')); 
      
      // Filtro robusto para imagens e mídias
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp', '.mp4', '.pdf'];
      const imageFiles = allFiles.filter(f => {
         const ext = f.toLowerCase().slice(f.lastIndexOf('.'));
         return imageExtensions.includes(ext);
      });

      // --- 3. COMPILAÇÃO TOML -> JSON ---
      for (const filePath of tomlFiles) {
        try {
          const rawContent = await Bun.file(filePath).text();
          const parsedData = parseToml(rawContent); 
          const relPath = relative(SOURCE_ROOT, filePath);
          
          // Garante que a pasta de destino exista
          const destFile = join(DEST_ROOT, relPath.replace('.toml', '.json'));
          await mkdir(dirname(destFile), { recursive: true });

          const fileStat = await stat(filePath);
          const keyName = relPath.replace('.toml', '').split(sep).join('/');
          versions[keyName] = fileStat.mtime.getTime();

          // AQUI: Injetamos o 'raw' para o TOML também, caso o app queira ler puramente
          const finalPayload = {
             data: parsedData,
             raw: rawContent 
          };

          await Bun.write(destFile, JSON.stringify(finalPayload, null, 2));
          stats.processed++; 
        } catch (err) {
          console.error(`Erro ao compilar TOML ${filePath}:`, err);
          stats.errors++;
        }
      }

      // --- 4. COMPILAÇÃO MARKDOWN -> AST (MDC) ---
      for (const filePath of mdFiles) {
        try {
          const fileStat = await stat(filePath);
          const rawContent = await Bun.file(filePath).text();
          const relPath = relative(SOURCE_ROOT, filePath);
          const normalizedRelPath = relPath.split(sep).join('/');

          // Gerar Key para o Manifesto
          let keyName = normalizedRelPath.replace('.md', '');
          if (keyName.endsWith('_index')) keyName = keyName.replace('_index', 'index');
          versions[keyName] = fileStat.mtime.getTime();

          // MDC Parse (Transforma MD em AST JSON para o Nuxt)
          const parsedAST = await parseMarkdown(rawContent, { 
              toc: { depth: 2, searchDepth: 2 } 
          });
          
          // Lógica de Path amigável (Slugify Web)
          let webPath = normalizedRelPath.replace('.md', '');
          if (webPath.endsWith('/_index')) webPath = webPath.substring(0, webPath.length - 7);
          else if (webPath.endsWith('/index')) webPath = webPath.substring(0, webPath.length - 6);
          else if (webPath === '_index' || webPath === 'index') webPath = ''; 
          
          webPath = webPath.startsWith('/') ? webPath : '/' + webPath;
          if (webPath === '') webPath = '/';
          
          // AQUI ESTÁ A MÁGICA! 
          // Anexamos a string bruta do Markdown para habilitar o modo '?raw=true' no Delivery!
          const finalJsonObj = {
            data: parsedAST.data || {},
            body: parsedAST.body, 
            raw: rawContent, // <- O Texto original puro!
            _id: `content:${siteStr}:${normalizedRelPath}`,
            _path: webPath
          };
          
          const destFileName = relPath.endsWith('_index.md') 
            ? relPath.replace('_index.md', 'index.json') 
            : relPath.replace('.md', '.json');

          // Garante que a subpasta de destino exista
          const finalDestPath = join(DEST_ROOT, destFileName);
          await mkdir(dirname(finalDestPath), { recursive: true });

          await Bun.write(finalDestPath, JSON.stringify(finalJsonObj, null, 2));
          stats.processed++;
        } catch (err) {
           console.error(`Erro ao compilar MD ${filePath}:`, err);
           stats.errors++;
        }
      }

      // --- 5. ARQUIVOS AUXILIARES (_order.yml e .json estáticos) ---
      const auxFiles = [...jsonFiles, ...orderFiles];
      for (const filePath of auxFiles) {
        try {
          const relPath = relative(SOURCE_ROOT, filePath);
          const destFile = join(DEST_ROOT, relPath);
          
          await mkdir(dirname(destFile), { recursive: true });
          await copyFile(filePath, destFile);
          
          if (filePath.endsWith('_order.yml')) stats.copiedOrders++;
          else stats.copiedJson++;
        } catch (err) {
           stats.errors++;
        }
      }

      // --- 6. CÓPIA DE ASSETS (Imagens/Mídia) ---
      for (const filePath of imageFiles) {
          try {
              const relPath = relative(SOURCE_ROOT, filePath);
              const destFile = join(DEST_ROOT, relPath);
              await mkdir(dirname(destFile), { recursive: true });
              await copyFile(filePath, destFile);
              stats.copiedImages++;
          } catch (err) {
              stats.errors++;
          }
      }

      // --- 7. MANIFESTO DE VERSÕES ---
      await Bun.write(join(DEST_ROOT, '_meta.json'), JSON.stringify(versions, null, 2));

      return { success: true, details: stats, message: "Site publicado com sucesso!" };

    } catch (error: any) {
      set.status = 500;
      return { success: false, error: "Falha na publicação: " + error.message };
    }
  });