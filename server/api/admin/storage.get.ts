import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import matter from "gray-matter";
import { getCookie, getQuery, createError, defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  // @ts-ignore
  const site = getCookie(event, "cms_site_context");
  const folder = query.folder ? String(query.folder) : null;
  const file = query.file ? String(query.file) : null;

  if (!site || !folder) {
    throw createError({ statusCode: 400, statusMessage: `Parâmetros inválidos.` });
  }

  // Define a raiz. Ajuste conforme sua configuração de storagePath no nuxt.config
  const APPS_ROOT = config.storagePath ? resolve(String(config.storagePath)) : process.cwd();
  const targetDir = join(APPS_ROOT, "storage", site, folder);

  if (!existsSync(targetDir)) {
    throw createError({ statusCode: 404, statusMessage: "Pasta não encontrada" });
  }

  // --- CASO 1: LEITURA DE ARQUIVO ÚNICO ---
  if (file) {
    const filePath = join(targetDir, file);
    if (!existsSync(filePath)) throw createError({ statusCode: 404, statusMessage: "Arquivo não encontrado" });
    return { name: file, content: readFileSync(filePath, "utf-8") };
  }

  // --- CASO 2: LISTAGEM DE DIRETÓRIO ---
  try {
    const rawItems = readdirSync(targetDir, { withFileTypes: true });

    // 1. Identificar o TIPO da pasta atual (onde estamos navegando)
    const hasCollectionMarker = rawItems.some(i => i.name === '.collection' || i.name === '.collection.json');
    const subDirectories = rawItems.filter(i => i.isDirectory());

    let folderType = 'folder'; // Padrão

    if (hasCollectionMarker) {
      folderType = 'collection';
    } else if (subDirectories.length === 0 && rawItems.some(i => i.name === '_index.md')) {
      // Se não tem subpastas mas tem _index, pode ser considerado uma página folha
      folderType = 'page';
    }

    // 2. Processar os itens
    const processedFiles = rawItems.map((item) => {
      const isDirectory = item.isDirectory();
      
      // Metadados padrão
      let metadata: any = {
        title: item.name,
        isDir: false,       // Se é pasta de navegação estrutural
        isCollection: false // Se é uma coleção
      };

      if (isDirectory) {
        const subPath = join(targetDir, item.name);

        // Verificações de Flags
        const isCommonDir = existsSync(join(subPath, ".isDirFlag"));
        const isCollection = existsSync(join(subPath, ".collection")) || existsSync(join(subPath, ".collection.json"));

        // Busca título no _index.md
        const indexMdPath = join(subPath, "_index.md");
        let displayTitle = item.name;

        if (existsSync(indexMdPath)) {
          try {
            const fileContent = readFileSync(indexMdPath, "utf-8");
            const { data } = matter(fileContent);
            if (data.title) displayTitle = data.title;
          } catch (e) {
            // Ignora erro de parse no frontmatter
          }
        }

        metadata = {
          title: displayTitle,
          isDir: isCommonDir,
          isCollection: isCollection
        };
      } else {
        // Se for arquivo (não diretório), podemos tentar pegar o título se for .md, 
        // ou manter o nome do arquivo.
        // Aqui mantemos simples para não ler todos os arquivos de uma vez.
      }

      return {
        name: item.name,
        path: folder === 'content' ? item.name : `${folder}/${item.name}`, // Caminho relativo limpo
        isDirectory,
        data: metadata
      };
    });

    // Filtros finais (Ocultar arquivos de sistema se necessário)
    const cleanFiles = processedFiles.filter(f => 
       !['.DS_Store', '_order.yml', '_schema.json'].includes(f.name)
    );

    // Ordenação: Pastas primeiro, depois arquivos
    cleanFiles.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
        return a.isDirectory ? -1 : 1;
    });

    return {
      type: folderType, // 'page', 'folder', ou 'collection'
      files: cleanFiles
    };

  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});