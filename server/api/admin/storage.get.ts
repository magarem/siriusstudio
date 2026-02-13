import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { getCookie } from "h3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const site = getCookie(event, "cms_site_context");
  const folder = query.folder ? String(query.folder) : null;
  const file = query.file ? String(query.file) : null;

  if (!site || !folder) {
    throw createError({
      statusCode: 400,
      statusMessage: `Parâmetros inválidos.`,
    });
  }

  const APPS_ROOT = config.storagePath
    ? resolve(config.storagePath)
    : process.cwd();
  const targetDir = join(APPS_ROOT, "storage", site, folder);

  if (!existsSync(targetDir)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Arquivo não encontrado",
    });
  }

  try {
    // CASO A: Leitura de arquivo único
    if (file) {
      const filePath = join(targetDir, file);
      if (!existsSync(filePath)) throw new Error("Arquivo não encontrado");
      return { name: file, content: readFileSync(filePath, "utf-8") };
    }

    // CASO B: Listagem de Diretório
    const rawItems = readdirSync(targetDir, { withFileTypes: true });

    let processedFiles = rawItems
      .map((item) => {
        const isDirectory = item.isDirectory();
        let metadata: any = {}; 
        let hasChildren = false;
        let isCollection = false;

        // 1. SE FOR PASTA: 
        //    a) Verifica filhos e flag de coleção
        //    b) Tenta ler _index.md interno para pegar metadados da pasta
        if (isDirectory) {
          try {
            const subPath = join(targetDir, item.name);
            const subItems = readdirSync(subPath);

            // Verifica Collection
            if (subItems.includes(".collection")) {
              isCollection = true;
            }

            // Verifica Filhos Válidos
            const validChildren = subItems.filter((subName) => {
              if (
                subName === ".isDirFlag" ||
                subName === ".isDirectory" ||
                subName === ".collection"
              ) return true;
              
              if (
                subName.startsWith(".") ||
                ["_index.md", "index.md", "_order.yml", "_schema.json"].includes(subName)
              ) return false;

              const subItemPath = join(subPath, subName);
              if (statSync(subItemPath).isDirectory()) return true;

              const allowedExtensions = [".md", ".json", ".yml", ".yaml"];
              return allowedExtensions.some((ext) => subName.toLowerCase().endsWith(ext));
            });

            hasChildren = validChildren.length > 0;

            // --- AQUI ESTÁ A MUDANÇA ---
            // Procura por _index.md dentro da pasta para pegar os metadados
            const indexMdPath = join(subPath, "_index.md");
            if (existsSync(indexMdPath)) {
                const indexContent = readFileSync(indexMdPath, "utf-8");
                const { data } = matter(indexContent);
                
                metadata = {
                  title: data.title || item.name, // Título do _index.md ou nome da pasta
                  date: data.date || null,
                  coverimage: data.coverimage || null,
                  images: data.images || []
                };
            } else {
                // Se não tiver _index.md, usa apenas o nome da pasta
                metadata = { title: item.name };
            }

          } catch (e) {
            hasChildren = false;
            isCollection = false;
            metadata = { title: item.name };
          }
        }

        // 2. SE FOR ARQUIVO MARKDOWN SOLTO (caso misture pastas e arquivos)
        if (!isDirectory && item.name.endsWith(".md")) {
          try {
            const filePath = join(targetDir, item.name);
            const { data } = matter(readFileSync(filePath, "utf-8"));
            
            metadata = {
              title: data.title || item.name.replace(".md", ""),
              date: data.date || null,
              coverimage: data.coverimage || null,
              images: data.images || []
            };
          } catch (e) {
            metadata = { title: item.name.replace(".md", "") };
          }
        }

        return {
          name: item.name,
          path: folder + "/" + item.name,
          isDirectory,
          hasChildren,
          isCollection,
          data: metadata, // Agora contém os dados do _index.md se for pasta
        };
      });

    // ... Ordenação continua igual ...
    const orderFilePath = join(targetDir, "_order.yml");
    // ... (restante do código de ordenação)

    // Filtragem final para não exibir o próprio _index.md da pasta pai na lista
    return processedFiles.filter(
      (f) => f.name !== "_order.yml" && f.name !== "_schema.json" && f.name !== "_index.md"
    );

  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});