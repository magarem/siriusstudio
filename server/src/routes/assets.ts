import { Elysia, t } from "elysia";
import { join, normalize } from "node:path";
import { CONFIG } from "../../config";

export const assetsRoutes = new Elysia({ prefix: "/assets" })
  .get("/*", async ({ params, query, site, set, request }) => {
    const wildcardPath = params["*"];

    if (!wildcardPath) {
      set.status = 400;
      return { error: "Caminho de asset inválido." };
    }

    const decodedPath = decodeURIComponent(wildcardPath);
    const isPreview = query.preview === "true";
    const activeSite = site || query.site;

    if (!activeSite) {
      set.status = 400;
      return { error: "Site não identificado no contexto ou na URL." };
    }

    // ✅ search in both storage root AND content subfolder
    const storageRoot = normalize(join(CONFIG.paths.storage, String(activeSite)));
    const contentRoot = normalize(join(storageRoot, "content"));

    // try content/ first, then storage root
    let filePath = normalize(join(contentRoot, decodedPath));
    let searchRoot = contentRoot;

    if (!(await Bun.file(filePath).exists())) {
      filePath = normalize(join(storageRoot, decodedPath));
      searchRoot = storageRoot;
    }

    // path traversal guard
    if (!filePath.startsWith(storageRoot)) {
      set.status = 403;
      return { error: "Acesso negado." };
    }

    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      set.status = 404;
      return { error: "Arquivo não encontrado." };
    }

    // MIME type detection
    let mimeType = file.type;
    const lowerPath = decodedPath.toLowerCase();
    if (!mimeType || mimeType === "application/octet-stream") {
      if (lowerPath.endsWith(".mp4"))  mimeType = "video/mp4";
      else if (lowerPath.endsWith(".webm")) mimeType = "video/webm";
      else if (lowerPath.endsWith(".mov"))  mimeType = "video/quicktime";
      else if (lowerPath.endsWith(".ogg"))  mimeType = "video/ogg";
      else if (lowerPath.endsWith(".avi"))  mimeType = "video/x-msvideo";
    }

    // cache control
    set.headers["Cache-Control"] = isPreview
      ? "no-cache, no-store, must-revalidate"
      : "public, max-age=86400";

    set.headers["Content-Type"] = mimeType;
    set.headers["Accept-Ranges"] = "bytes";

    const fileSize = file.size;
    const range = request.headers.get("range");

    if (range) {
      // ✅ HTTP 206 Partial Content — required for video seeking
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? Math.min(parseInt(parts[1], 10), fileSize - 1) : fileSize - 1;
      const chunkSize = end - start + 1;

      set.status = 206;
      set.headers["Content-Range"]  = `bytes ${start}-${end}/${fileSize}`;
      set.headers["Content-Length"] = chunkSize.toString();

      return file.slice(start, end + 1);
    }

    // ✅ HTTP 200 — full file with Content-Length (was missing before)
    set.headers["Content-Length"] = fileSize.toString();
    return file;

  }, {
    query: t.Optional(t.Object({
      preview: t.Optional(t.String()),
      site: t.Optional(t.String())
    }))
  });