import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { sendStream, getQuery, getCookie, setHeader } from "h3";

export default defineEventHandler(async (event) => {
  // 1. Pega o caminho da URL (ex: assets/sobre/visitacao/foto.jpg -> sobre/visitacao/foto.jpg)
  const pathParam = event.context.params?.path;
  if (!pathParam) {
    throw createError({ statusCode: 400, message: "Caminho inválido" });
  }

  // 2. Decodifica caracteres especiais (espaços, acentos)
  const decodedPath = decodeURIComponent(pathParam);

  // 3. DETECTA O MODO (PREVIEW vs PRODUÇÃO)
  // Se a URL tiver ?preview=true, ativamos o modo rascunho
  const query = getQuery(event);
  const isPreview = query.preview === "true";

  // 4. IDENTIFICA O SITE
  // Tenta pegar do cookie (Modo Admin/Editor) OU da configuração (Modo Site Público)
  const config = useRuntimeConfig();
  const siteId =
    getCookie(event, "cms_site_context") ||
    config.public?.siteId 

  // 5. DEFINE A PASTA DE ORIGEM
  // Preview  -> 'content' (Arquivos originais em edição, estado real-time)
  // Produção -> 'data'    (Arquivos copiados/otimizados pelo script de build)
  let sourceFolder = isPreview ? "content" : "data";

  let filePath = "";

  // 6. RESOLUÇÃO DO CAMINHO FÍSICO
  if (siteId) {
    // Lógica Monorepo: Estamos em /apps/site/server, precisamos voltar para /apps/storage
    // path: .../apps/storage/[site]/[content ou data]/[arquivo]
    sourceFolder = "content";
    filePath = resolve(
      process.cwd(),
      "..",
      "storage",
      siteId,
      sourceFolder,
      decodedPath,
    );
    console.log("1 - Resolved with siteId:", siteId);
  } else {
    // Fallback Local: Tenta buscar na pasta do projeto atual (útil para dev isolado)
    filePath = resolve(process.cwd(), sourceFolder, decodedPath);
    console.log("2 - Resolved with siteId:");
  }

  console.log("filePath:", filePath);

  // Debug (Descomente se precisar ver no terminal o que está acontecendo)
  // console.log(`📂 Asset Request: ${decodedPath}`)
  // console.log(`⚙️ Mode: ${isPreview ? '🚧 PREVIEW (Content)' : '🚀 PROD (Data)'}`)
  // console.log(`📍 Physical Path: ${filePath}`)

  // 7. VERIFICAÇÃO DE SEGURANÇA E EXISTÊNCIA
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw createError({ statusCode: 404, message: "Arquivo não encontrado" });
  }

  // 8. DEFINE O MIME TYPE
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    mp4: "video/mp4",
  };

  if (ext && mimeTypes[ext]) {
    setHeader(event, "Content-Type", mimeTypes[ext]);
  }

  // 9. CONTROLE DE CACHE (Cache Control)
  if (isPreview) {
    // Modo Preview: Cache DESLIGADO para ver alterações instantaneamente
    setHeader(event, "Cache-Control", "no-cache, no-store, must-revalidate");
    setHeader(event, "Pragma", "no-cache");
    setHeader(event, "Expires", "0");
  } else {
    // Modo Produção: Cache LONGO (1 dia) para performance do site
    setHeader(event, "Cache-Control", "public, max-age=86400");
  }

  // 10. ENTREGA O ARQUIVO (Stream)
  return sendStream(event, createReadStream(filePath));
});
