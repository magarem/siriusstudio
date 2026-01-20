import { promises as fs, existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import matter from 'gray-matter'; // Necessário para ler MD no preview
import yaml from 'js-yaml';       // Necessário para ler _order.yml

export default defineEventHandler(async (event) => {
    // --- 0. ANTI-CACHE (CABEÇALHOS) ---
  // Isso diz ao navegador e proxies para não cachear a resposta JSON
  setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
  setResponseHeader(event, 'Pragma', 'no-cache');
  setResponseHeader(event, 'Expires', '0');
  
  const config = useRuntimeConfig();
  const query = getQuery(event);

  // --- 1. PARÂMETROS E VALIDAÇÃO ---
  const mode = query.mode === 'preview' ? 'preview' : 'production';
  const site = query.site ? String(query.site) : null;
  let section = query.section || query.folder; // Aceita ambos os nomes
  section = String(section || '').replace(/^content\/?/, '').replace(/^\//, '');

  if (!section) return [];

  // Em modo preview, o site é obrigatório para achar a pasta storage
  if (mode === 'preview' && !site) {
    throw createError({ statusCode: 400, message: 'Site é obrigatório no modo preview.' });
  }

  // --- 2. DEFINIÇÃO DO DIRETÓRIO ALVO ---
  let targetDir = '';

  if (mode === 'preview') {
    // Caminho do Preview (Markdown em Storage)
    const APPS_ROOT = config.storagePath ? resolve(config.storagePath) : process.cwd();
    targetDir = join(APPS_ROOT, 'storage', site!, 'content', section);
  } else {
    // Caminho de Produção (JSON em Server Data)
    // Ajuste aqui se sua estrutura de produção for diferente (ex: sites/site/server/data)
    const DATA_ROOT = resolve(process.cwd(), 'server/data');
    targetDir = join(DATA_ROOT, section);
  }

  // Se a pasta não existe, retorna vazio
  if (!existsSync(targetDir)) return [];

  try {
    // --- 3. LEITURA E FILTRAGEM ---
    const rawFiles = await fs.readdir(targetDir, { withFileTypes: true });

    // Filtra arquivos baseados no modo
    const filteredFiles = rawFiles.filter(dirent => {
      if (dirent.isDirectory()) return false;
      const name = dirent.name;
      
      if (mode === 'preview') {
        // Preview: Aceita .md, ignora _sistemas
        return name.endsWith('.md') && !name.startsWith('_');
      } else {
        // Prod: Aceita .json, ignora index.json e _sistemas
        return name.endsWith('.json') && name !== 'index.json' && !name.startsWith('_');
      }
    });

    // --- 4. PREPARAÇÃO DA ORDENAÇÃO (_order.yml) ---
    const orderFilePath = join(targetDir, '_order.yml');
    let orderMap = new Map<string, number>();

    if (existsSync(orderFilePath)) {
      try {
        const fileContent = readFileSync(orderFilePath, 'utf-8');
        const loaded = yaml.load(fileContent) as string[];

        if (Array.isArray(loaded)) {
          orderMap = new Map(loaded.map((name, index) => {
            // Remove extensão para normalizar (ex: "post.md" vira "post")
            const cleanName = name.replace(/\.[^/.]+$/, "");
            return [cleanName, index];
          }));
        }
      } catch (e) {
        console.warn(`Aviso: _order.yml inválido em ${section}`);
      }
    }

    // --- 5. PROCESSAMENTO DOS ARQUIVOS (NORMALIZAÇÃO) ---
    const items = await Promise.all(filteredFiles.map(async (dirent) => {
      try {
        const filePath = join(targetDir, dirent.name);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        
        // Variáveis normalizadas
        let title = '';
        let description = '';
        let image = null;
        let date = null;
        
        // Nome limpo (sem extensão)
        const fileNameNoExt = dirent.name.replace(/\.[^/.]+$/, "");
        const webPath = `/${section}/${fileNameNoExt}`.replace(/\/+/g, '/');

        // Lógica de Extração baseada no modo
        if (mode === 'preview') {
          // A. PREVIEW (Markdown + GrayMatter)
          const { data } = matter(fileContent);
          title = data.title || fileNameNoExt;
          description = data.description || '';
          image = data.images?.[0] || data.topimages?.[0] || data.image || null;
          date = data.date || data.publishDate || null;
        } else {
          // B. PRODUÇÃO (JSON Parse)
          const json = JSON.parse(fileContent);
          // O JSON compilado às vezes tem 'data' (frontmatter) ou está na raiz, depende do parser
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
          key: webPath,
          _fileName: fileNameNoExt // Auxiliar para ordenação
        };

      } catch (e) {
        console.error(`Erro ao processar ${dirent.name}`, e);
        return null;
      }
    }));

    // Remove falhas
    const validItems = items.filter((item): item is NonNullable<typeof item> => Boolean(item));

    // --- 6. APLICAÇÃO DA ORDENAÇÃO ---
    validItems.sort((a, b) => {
      const indexA = orderMap.has(a._fileName) ? orderMap.get(a._fileName)! : 9999;
      const indexB = orderMap.has(b._fileName) ? orderMap.get(b._fileName)! : 9999;

      // 1. Pelo _order.yml
      if (indexA !== indexB) return indexA - indexB;

      // 2. Por Data (se existir, mais recentes primeiro)
      // if (a.date && b.date) {
      //   return new Date(b.date).getTime() - new Date(a.date).getTime();
      // }

      // 3. Alfabético (Título)
      return a.title.localeCompare(b.title);
    });

    // --- 7. RETORNO LIMPO ---
    // Remove a chave auxiliar _fileName antes de enviar pro front
    return validItems.map(({ _fileName, ...rest }) => rest);

  } catch (error: any) {
    console.error('Unified List Error:', error);
    return [];
  }
});