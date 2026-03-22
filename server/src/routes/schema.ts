import { Elysia, t } from "elysia";
import { join, normalize, dirname } from "node:path"; // 👈 Prefixo 'node:'
import { CONFIG } from "../../config"; // 👈 Fonte centralizada

export const schemaRoutes = new Elysia({ prefix: "/schema" })
  
  .get("/", async ({ query, site, set }) => {
    // Força o Nuxt a interpretar como Objeto JSON
    set.headers['content-type'] = 'application/json';

    const folder = query.folder || "";
    const schemaStr = query.schema || null;
    const siteStr = String(site);

    // Se não houver site (injetado) ou schema na query, retorna vazio
    if (!siteStr || !schemaStr) {
      return { types: {}, mapping: {} };
    }

    // Usando a constante centralizada
    const siteRoot = normalize(join(CONFIG.paths.storage, siteStr));

    // --- LÓGICA 1: CAMINHO DIRETO ---
    if (schemaStr.includes("/") || schemaStr.endsWith(".json")) {
      const relativePath = schemaStr.startsWith("/") ? schemaStr.substring(1) : schemaStr;
      const finalPath = relativePath.endsWith(".json") ? relativePath : `${relativePath}.json`;
      const absoluteSchemaPath = normalize(join(siteRoot, finalPath));

      // Segurança: Não deixa sair do storage do site
      if (!absoluteSchemaPath.startsWith(siteRoot)) {
        set.status = 403;
        return { error: "Acesso negado ao schema solicitado." };
      }

      const file = Bun.file(absoluteSchemaPath);
      if (await file.exists()) {
        try {
          return await file.json(); // Leitura nativa e super rápida do Bun
        } catch (e) {
          return { error: "Erro ao processar JSON do schema." };
        }
      }
    }

    // --- LÓGICA 2: BUBBLING UP (BUSCA HIERÁRQUICA) ---
    // Começa na pasta atual e sobe até a raiz procurando a pasta _schemas
    let currentPath = String(folder).replace("/_index.md", "");
    let foundSchema = null;

    while (currentPath !== "." && currentPath !== "/") {
      const potentialSchemaPath = join(siteRoot, currentPath, "_schemas", `${schemaStr}.json`);
      const schemaFile = Bun.file(potentialSchemaPath);

      if (await schemaFile.exists()) {
        try {
          foundSchema = await schemaFile.json();
          break; // Achou! Para a busca.
        } catch (e) {
          break; // Arquivo existe mas tá quebrado, paramos por segurança.
        }
      } else {
        // Sobe um nível na pasta
        const parent = dirname(currentPath);
        if (parent === currentPath) break;
        // Evita subir além do necessário (para fora da pasta content)
        if (!currentPath.includes("content") && parent !== "content") break;
        currentPath = parent;
      }
    }

    if (foundSchema) {
      return foundSchema;
    } else {
      // Falha silenciosa elegante para o frontend não quebrar
      return { types: {}, mapping: {}, error: "Schema not found in hierarchy" };
    }
  }, {
    // Validação estrita do Elysia
    query: t.Object({
      folder: t.Optional(t.String()),
      schema: t.Optional(t.String())
    })
  });