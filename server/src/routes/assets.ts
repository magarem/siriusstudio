import { Elysia, t } from "elysia";
import { join, normalize } from "node:path"; // 👈 Prefixo 'node:' adicionado para máxima performance no Bun
import { CONFIG } from "../../config"; // Importa a constante centralizada

export const assetsRoutes = new Elysia({ prefix: "/assets" })
  .get("/*", async ({ params, query, site, set }) => {
    const wildcardPath = params["*"];
    
    if (!wildcardPath) {
      set.status = 400;
      return { error: "Caminho de asset inválido." };
    }

    const decodedPath = decodeURIComponent(wildcardPath);
    const isPreview = query.preview === "true";

    // Fallback de segurança: Se a tag <img> não mandar o cookie, tentamos ler da query
    const activeSite = site || query.site;

    if (!activeSite) {
      set.status = 400;
      return { error: "Site não identificado no contexto ou na URL." };
    }

    const storageRoot = normalize(join(CONFIG.paths.storage, String(activeSite), "content"));
    const filePath = normalize(join(storageRoot, decodedPath));

    // Trava de segurança contra Path Traversal
    if (!filePath.startsWith(storageRoot)) {
      set.status = 403;
      return { error: "Acesso negado: Tentativa de acesso fora do diretório de assets." };
    }

    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      set.status = 404;
      return { error: "Arquivo não encontrado no servidor." };
    }

    // Controle de Cache Dinâmico
    if (isPreview) {
      set.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    } else {
      set.headers["Cache-Control"] = "public, max-age=86400"; // Cache de 24h para produção
    }

    // O Elysia e o Bun enviam o arquivo diretamente com altíssima performance
    return file;
  }, {
    // --- BLINDAGEM ANTI-422 ---
    // Avisamos ao Elysia que a URL PODE conter esses parâmetros, 
    // mas não quebramos a requisição se eles não vierem.
    query: t.Optional(t.Object({
      preview: t.Optional(t.String()),
      site: t.Optional(t.String())
    }))
  });