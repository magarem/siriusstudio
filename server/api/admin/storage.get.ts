import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml"; // <--- 1. IMPORTAÇÃO ADICIONADA

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  const site = query.site ? String(query.site) : null;
  const folder = query.folder ? String(query.folder) : null;
  const file = query.file ? String(query.file) : null;

  if (!site || !folder) {
    throw createError({
      statusCode: 400,
      statusMessage: `Parâmetros inválidos. Recebido site: ${site}, folder: ${folder}`,
    });
  }

  const APPS_ROOT = config.storagePath
    ? resolve(config.storagePath)
    : process.cwd();
  console.log("APPS_ROOT definido como:", APPS_ROOT);

  const targetDir = join(APPS_ROOT, "storage", site, folder);
  // const targetDir = join(process.cwd(), "content", folder);
 console.log("targetDir:", targetDir)
  if (!existsSync(targetDir)) {
    return [];
  }

 
  
  try {
    // CASO A: Leitura de um arquivo específico (Modo Edição/Detalhe)
    if (file) {
      const filePath = join(targetDir, file);
      if (!existsSync(filePath)) throw new Error("Arquivo não encontrado");

      const content = readFileSync(filePath, "utf-8");
      return {
        name: file,
        content: content,
      };
    }

    // CASO B: Listagem de Diretório COM ORDENAÇÃO
    // 1. Ler os itens brutos do diretório
    const rawItems = readdirSync(targetDir, { withFileTypes: true });

    // 2. Processar metadados (Frontmatter) de cada item
    let processedFiles = rawItems
      .filter((item) => !item.name.startsWith(".") /*&& item.name !== "_index.md"*/) // Filtros iniciais
      .map((item) => {
        const isDirectory = item.isDirectory();
        let metadata = {};

        // Se for Markdown, extrai dados do frontmatter
        if (!isDirectory && item.name.endsWith(".md")) {
          try {
            const filePath = join(targetDir, item.name);
            const fileRaw = readFileSync(filePath, "utf-8");
            const { data } = matter(fileRaw);

            metadata = {
              title: data.title || item.name.replace(".md", ""),
              topimages:
                data.topimages || (data.topimage ? [data.topimage] : []),
              images: data.images || (data.image ? [data.image] : []),
              description: data.description || "",
            };
          } catch (e) {
            console.error(`Erro ao ler metadados de ${item.name}`);
          }
        }

        return {
          name: item.name,
          isDirectory,
          data: metadata,
        };
      });

    // 3. Ler o arquivo _order.yml para descobrir a ordem manual
    const orderFilePath = join(targetDir, "_order.yml");
    let orderMap = new Map();

    if (existsSync(orderFilePath)) {
      try {
        const fileContent = readFileSync(orderFilePath, "utf-8");
        const loaded = yaml.load(fileContent);

        if (Array.isArray(loaded)) {
          // Cria um mapa { 'nome_do_arquivo': index } para acesso rápido
          orderMap = new Map(loaded.map((name, index) => [name, index]));
        }
      } catch (e) {
        console.warn("Erro ao ler _order.yml, usando ordenação padrão.", e);
      }
    }

    // 4. Aplicar a Ordenação
    processedFiles.sort((a, b) => {
      // Verifica se os itens têm posição definida no _order.yml
      const indexA = orderMap.has(a.name) ? orderMap.get(a.name) : 9999;
      const indexB = orderMap.has(b.name) ? orderMap.get(b.name) : 9999;

      // Se ambos tiverem ordem manual, respeita o YAML
      if (indexA !== 9999 || indexB !== 9999) {
        return indexA - indexB;
      }

      // Se nenhum tiver ordem (arquivos novos), usa o padrão:
      // Pastas primeiro, depois ordem alfabética
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    // 5. Filtrar o próprio arquivo de ordem da lista final
    // 5. Filtrar arquivos de sistema da lista final
    return processedFiles.filter(
      (f) => f.name !== "_order.yml" && f.name !== "_schema.json"
    );
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao acessar o storage: " + error.message,
    });
  }
});
