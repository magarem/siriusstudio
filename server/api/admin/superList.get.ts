import { promises as fs, existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

export default defineEventHandler(async (event) => {
  // --- 0. ANTI-CACHE ---
  setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
  setResponseHeader(event, 'Pragma', 'no-cache');
  setResponseHeader(event, 'Expires', '0');
  
  const config = useRuntimeConfig();
  const query = getQuery(event);

  // --- 1. PARÂMETROS ---
  const mode = query.mode === 'preview' ? 'preview' : 'production';
  const site = query.site ? String(query.site) : null;
  let section = query.section || query.folder; 
  section = String(section || '').replace(/^content\/?/, '').replace(/^\//, '');

  if (!section) return [];

  if (mode === 'preview' && !site) {
    throw createError({ statusCode: 400, message: 'Site é obrigatório no modo preview.' });
  }

  // --- 2. DIRETÓRIO ALVO ---
  let targetDir = '';

  if (mode === 'preview') {
    const APPS_ROOT = config.storagePath ? resolve(config.storagePath) : process.cwd();
    targetDir = join(APPS_ROOT, 'storage', site!, 'content', section);
  } else {
    const DATA_ROOT = resolve(process.cwd(), 'server/data');
    targetDir = join(DATA_ROOT, section);
  }

  if (!existsSync(targetDir)) return [];

  try {
    // --- 3. LEITURA E FILTRAGEM (CORRIGIDO) ---
    const rawFiles = await fs.readdir(targetDir, { withFileTypes: true });

    const filteredFiles = rawFiles.filter(dirent => {
      const name = dirent.name;
      // Ignora arquivos de sistema/ocultos
      if (name.startsWith('_') || name.startsWith('.')) return false;

      // ACEITAR PASTAS AGORA:
      if (dirent.isDirectory()) return true;

      // Lógica de arquivos
      if (mode === 'preview') {
        return name.endsWith('.md');
      } else {
        return name.endsWith('.json') && name !== 'index.json';
      }
    });

    // --- 4. ORDENAÇÃO (_order.yml) ---
    const orderFilePath = join(targetDir, '_order.yml');
    let orderMap = new Map<string, number>();

    if (existsSync(orderFilePath)) {
      try {
        const fileContent = readFileSync(orderFilePath, 'utf-8');
        const loaded = yaml.load(fileContent) as string[];
        if (Array.isArray(loaded)) {
          orderMap = new Map(loaded.map((name, index) => {
            const cleanName = name.replace(/\.[^/.]+$/, "");
            return [cleanName, index];
          }));
        }
      } catch (e) {}
    }

    // --- 5. PROCESSAMENTO (COM SUPORTE A PASTAS) ---
    const items = await Promise.all(filteredFiles.map(async (dirent) => {
      try {
        const filePath = join(targetDir, dirent.name);
        
        let title = '';
        let description = '';
        let image = null;
        let date = null;
        const fileNameNoExt = dirent.name.replace(/\.[^/.]+$/, "");
        const webPath = `/${section}/${fileNameNoExt}`.replace(/\/+/g, '/');

        // === CASO A: É UMA PASTA ===
        if (dirent.isDirectory()) {
            // Tenta achar um index para pegar metadados da pasta (capa, título personalizado)
            let indexContent = null;
            let hasIndex = false;

            // Define qual arquivo de índice procurar baseado no modo
            const indexName = mode === 'preview' ? 'index.md' : 'index.json';
            const indexParamsPath = join(filePath, indexName);

            if (existsSync(indexParamsPath)) {
                try {
                    const rawIndex = await fs.readFile(indexParamsPath, 'utf-8');
                    if (mode === 'preview') {
                        const { data } = matter(rawIndex);
                        title = data.title;
                        image = data.images?.[0] || data.image;
                        description = data.description;
                    } else {
                        const json = JSON.parse(rawIndex);
                        const meta = { ...(json.data || {}), ...(json.meta || {}), ...json };
                        title = meta.title;
                        image = meta.images?.[0] || meta.image;
                        description = meta.description;
                    }
                    hasIndex = true;
                } catch (err) {
                    console.warn(`Erro ao ler index da pasta ${dirent.name}`);
                }
            }

            // Fallback se não tiver index ou título: Formata o nome da pasta
            if (!title) {
                title = fileNameNoExt.charAt(0).toUpperCase() + fileNameNoExt.slice(1).replace(/-/g, ' ');
            }

            return {
                title,
                description,
                image, // Retorna a imagem se achou no index da pasta
                path: webPath,
                isFolder: true, // Flag importante para o frontend
                _fileName: fileNameNoExt
            };
        }

        // === CASO B: É UM ARQUIVO (Código Original) ===
        const fileContent = await fs.readFile(filePath, 'utf-8');
        
        if (mode === 'preview') {
          const { data } = matter(fileContent);
          title = data.title || fileNameNoExt;
          description = data.description || '';
          image = data.images?.[0] || data.topimages?.[0] || data.image || null;
          date = data.date || data.publishDate || null;
        } else {
          const json = JSON.parse(fileContent);
          const meta = { ...(json.data || {}), ...(json.meta || {}), ...json };
          title = meta.title || fileNameNoExt;
          description = meta.description || '';
          image = meta.images?.[0] || meta.topimages?.[0] || meta.image || null;
          date = meta.date || meta.publishDate || null;
        }

        return {
          title,
          description,
          image,
          date,
          path: webPath,
          isFolder: false,
          _fileName: fileNameNoExt
        };

      } catch (e) {
        console.error(`Erro ao processar ${dirent.name}`, e);
        return null;
      }
    }));

    const validItems = items.filter((item): item is NonNullable<typeof item> => Boolean(item));

    // --- 6. ORDENAÇÃO ---
    validItems.sort((a, b) => {
      // Pastas primeiro? Descomente abaixo se quiser pastas no topo
      // if (a.isFolder && !b.isFolder) return -1;
      // if (!a.isFolder && b.isFolder) return 1;

      const indexA = orderMap.has(a._fileName) ? orderMap.get(a._fileName)! : 9999;
      const indexB = orderMap.has(b._fileName) ? orderMap.get(b._fileName)! : 9999;

      if (indexA !== indexB) return indexA - indexB;
      
      // Fallback alfabético
      return a.title.localeCompare(b.title);
    });

    return validItems.map(({ _fileName, ...rest }) => rest);

  } catch (error: any) {
    console.error('Unified List Error:', error);
    return [];
  }
});