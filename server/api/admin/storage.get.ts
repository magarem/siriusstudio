import { readdirSync, readFileSync, existsSync, statSync } from "node:fs"; // <--- ADICIONADO statSync
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

  if (!existsSync(targetDir)) return [];

  try {
    // CASO A: Leitura de arquivo (Mantido igual)
    if (file) {
      const filePath = join(targetDir, file);
      if (!existsSync(filePath)) throw new Error("Arquivo não encontrado");
      return { name: file, content: readFileSync(filePath, "utf-8") };
    }

    // CASO B: Listagem de Diretório
    const rawItems = readdirSync(targetDir, { withFileTypes: true });

    let processedFiles = rawItems
      .filter((item) => !item.name.startsWith("."))
      .map((item) => {
        const isDirectory = item.isDirectory();
        let metadata = {};

        // [NOVO] Propriedade para controlar a navegação no frontend
        let hasChildren = false;

        // 1. SE FOR PASTA: Verifica se tem conteúdo relevante dentro
        if (isDirectory) {
          try {
            const subPath = join(targetDir, item.name);
            const subItems = readdirSync(subPath);

            // Filtra para ver se tem algo além do básico (_index.md)
            const validChildren = subItems.filter((subName) => {
              // 1. [NOVO] Se encontrar a flag oculta de diretório, considera válido imediatamente
              if (subName === ".isDirFlag" || subName === ".isDirectory") {
                return true;
              }
              // Ignora arquivos ocultos e arquivos de sistema da pasta
              if (
                subName.startsWith(".") ||
                [
                  "_index.md",
                  "index.md",
                  "_order.yml",
                  "_schema.json",
                ].includes(subName)
              ) {
                return false;
              }

              // Verifica se é um arquivo de conteúdo válido ou subpasta
              const subItemPath = join(subPath, subName);
              if (statSync(subItemPath).isDirectory()) return true; // É subpasta? Conta.

              // É arquivo de texto relevante (.md, .json)? Conta.
              // (Ignora imagens para não liberar navegação só por causa de assets)
              const allowedExtensions = [".md", ".json", ".yml", ".yaml"];
              return allowedExtensions.some((ext) =>
                subName.toLowerCase().endsWith(ext),
              );
            });

            hasChildren = validChildren.length > 0;
          } catch (e) {
            hasChildren = false;
          }
        }

        // 2. SE FOR MARKDOWN: Lê frontmatter (Mantido igual)
        if (!isDirectory && item.name.endsWith(".md")) {
          try {
            const filePath = join(targetDir, item.name);
            const { data } = matter(readFileSync(filePath, "utf-8"));
            metadata = {
              title: data.title || item.name.replace(".md", ""),
              // ... outros metadados ...
            };
          } catch (e) {}
        }

        return {
          name: item.name,
          isDirectory,
          hasChildren, // <--- Retornamos essa flag preciosa
          data: metadata,
        };
      });

    // ... (Lógica de Order Map e Sort mantida igual) ...
    const orderFilePath = join(targetDir, "_order.yml");
    let orderMap = new Map();
    if (existsSync(orderFilePath)) {
      try {
        const loaded = yaml.load(readFileSync(orderFilePath, "utf-8"));
        if (Array.isArray(loaded))
          orderMap = new Map(loaded.map((name, index) => [name, index]));
      } catch (e) {}
    }

    processedFiles.sort((a, b) => {
      const indexA = orderMap.has(a.name) ? orderMap.get(a.name) : 9999;
      const indexB = orderMap.has(b.name) ? orderMap.get(b.name) : 9999;
      if (indexA !== 9999 || indexB !== 9999) return indexA - indexB;
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return processedFiles.filter(
      (f) => f.name !== "_order.yml" && f.name !== "_schema.json",
    );
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
