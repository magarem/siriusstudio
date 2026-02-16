import { promises as fs, existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { getCookie, getQuery, createError, defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  // --- 0. HEADERS & CONFIG ---
  setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
  const config = useRuntimeConfig();
  const query = getQuery(event);

  const site =
    getCookie(event, "cms_site_context") ||
    config.public?.siteName 

  console.log("🚀 ~ site:", site)

  // --- 1. PREPARAÇÃO DA SEÇÃO ---
  const mode = query.mode === 'preview' ? 'preview' : 'production';
  // const site = query.site ? String(query.site) : null;
  const includeIndex = query.includeIndex === 'true';
  // Limpa a string da seção para evitar caminhos duplos
  // Ex: "atrativos/alimentacao"
  let section = query.section || query.folder; 
  section = String(section || '').replace(/^content\/?/, '').replace(/^\//, '');

  if (!section) return [];

  
  if (mode === 'preview' && !site) {
    throw createError({ statusCode: 400, message: 'Site é obrigatório no modo preview.' });
  }

  // --- 2. DEFINIR DIRETÓRIO FÍSICO ALVO ---
  let targetDir = '';

  if (mode === 'preview') {
    // Caminho no modo Preview (Disk)
    const APPS_ROOT = config.storagePath ? resolve(config.storagePath) : process.cwd();
    targetDir = join(APPS_ROOT, 'storage', site!, 'content', section);
  } else {
    // Caminho no modo Produção/Build
    const DATA_ROOT = resolve(process.cwd(), 'data');
    targetDir = join(DATA_ROOT, section);
  }

  // Se a pasta não existe (ex: /conteudo-novo), retorna vazio
  if (!existsSync(targetDir)) return [];

  try {
    // --- 3. LER O CONTEÚDO DA PASTA ---
    const rawFiles = await fs.readdir(targetDir, { withFileTypes: true });

    // Filtra arquivos de sistema
    const filteredFiles = rawFiles.filter(dirent => {
      const name = dirent.name;
      // Pula arquivos ocultos (.) ou arquivos de sistema (_) QUE ESTÃO NA RAIZ DA LISTA
      // Nota: Não pulamos se for a pasta que queremos ler, mas aqui estamos listando FILHOS.
      // Se você tem "_schema.json" na lista, ele será ignorado aqui, o que é correto.
      if (name.startsWith('.') || (name.startsWith('_') && !dirent.isDirectory())) return false;
      return true;
    });

    // --- 4. CARREGAR ORDEM PERSONALIZADA (_order.yml) ---
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

    // --- 5. PROCESSAMENTO DOS ITENS ---
    const items = await Promise.all(filteredFiles.map(async (dirent) => {
      try {
        const itemFullPath = join(targetDir, dirent.name);
        const fileNameNoExt = dirent.name.replace(/\.[^/.]+$/, "");
        
        let title = '';
        let description = '';
        let image = null;
        let date = null;
        let isFolder = dirent.isDirectory();

        // Path base para o frontend (Importante para calcular assets)
        // Ex: content/atrativos/alimentacao/bistro
        let sourcePath = `content/${section}/${dirent.name}`.replace(/\\/g, '/').replace(/\/+/g, '/');

        // === CASO A: É UMA PASTA (O CASO MAIS COMUM NO SEU DIRETÓRIO) ===
        // Ex: atrativos/alimentacao/bistro
        if (isFolder) {
            // Adiciona sufixo '/index' virtual para o frontend saber que é pasta
            sourcePath = `${sourcePath}/index`;

            // Procura pelos arquivos de metadados NESTA ORDEM:
            const indexCandidates = ['_index.md', 'index.md', '_index.json', 'index.json'];
            let foundIndexFile = null;

            for (const candidate of indexCandidates) {
                const p = join(itemFullPath, candidate);
                if (existsSync(p)) {
                    foundIndexFile = p;
                    break;
                }
            }

            if (foundIndexFile) {
                const rawContent = await fs.readFile(foundIndexFile, 'utf-8');
                
                // Processa Markdown ou JSON
                if (foundIndexFile.endsWith('.md')) {
                    const { data } = matter(rawContent);
                    title = data.title;
                    description = data.description;
                    image = data.image || data.images?.[0] || data.cover; // Pega qualquer variação de imagem
                    date = data.date;
                } else {
                    const json = JSON.parse(rawContent);
                    // Suporta estrutura flat ou { data: ... }
                    const meta = { ...(json.data || {}), ...json };
                    title = meta.title;
                    description = meta.description;
                    image = meta.image || meta.images?.[0] || meta.cover;
                }
            }

            // Fallback: Se não achou título no arquivo (ou não achou o arquivo), usa o nome da pasta formatado
            if (!title) {
                title = fileNameNoExt.charAt(0).toUpperCase() + fileNameNoExt.slice(1).replace(/-/g, ' ');
            }
        } 
        
        // === CASO B: É UM ARQUIVO SOLTO (.md ou .json) ===
        // Ex: _home/algum-post.md (se houver)
        else {
            // Se o arquivo for o próprio _index.md solto na raiz da seção, IGNORAR,
            // pois ele define a seção atual e não um item filho.
            if (dirent.name.startsWith('_index')) return null;

            const fileContent = await fs.readFile(itemFullPath, 'utf-8');
            if (dirent.name.endsWith('.md')) {
                 const { data } = matter(fileContent);
                 title = data.title || fileNameNoExt;
                 description = data.description;
                 image = data.image || data.images?.[0];
            } else if (dirent.name.endsWith('.json')) {
                 const json = JSON.parse(fileContent);
                 const meta = { ...(json.data || {}), ...json };
                 title = meta.title || fileNameNoExt;
                 image = meta.image || meta.images?.[0];
            }
        }

        // Retorno padronizado
        return {
          title,
          description,
          image,
          date,
          path: sourcePath, // Caminho "source" para o frontend resolver assets
          isFolder,
          _fileName: fileNameNoExt
        };

      } catch (e) {
        console.error(`[SuperList] Erro ao ler item: ${dirent.name}`, e);
        return null;
      }
    }));

    // Filtra nulos e Ordena
    const validItems = items.filter((item): item is NonNullable<typeof item> => Boolean(item));

    validItems.sort((a, b) => {
      const indexA = orderMap.has(a._fileName) ? orderMap.get(a._fileName)! : 9999;
      const indexB = orderMap.has(b._fileName) ? orderMap.get(b._fileName)! : 9999;

      if (indexA !== indexB) return indexA - indexB;
      return a.title.localeCompare(b.title);
    });

    //Testa para ver se quer também retornar o próprio nome do arquivo em JSON
    // return validItems;

    return validItems.filter(item =>
      includeIndex || item._fileName !== 'index'
    );

  } catch (error: any) {
    console.error('[SuperList] Erro Fatal:', error);
    return [];
  }
});