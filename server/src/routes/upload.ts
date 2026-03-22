import { Elysia, t } from "elysia";
import { join, normalize, extname, basename } from "node:path";
import { mkdir } from "node:fs/promises";
import { CONFIG } from "../../config"; 
import sharp from "sharp"; // ✨ NEW: Import Sharp

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  .post("/", async ({ body, query, site, set }) => {
    const targetFolder = (query.folder as string) || "images";
    const siteStr = String(site);

    if (!siteStr) {
      set.status = 400;
      return { error: "Site não identificado." };
    }

    let fileDataToSave: File | ArrayBuffer | null = null;
    let originalFilename = "";

    const bodyData = body as any;

    // --- 1. CHECK FOR EXTERNAL URL ---
    if (bodyData.imageUrl && typeof bodyData.imageUrl === 'string') {
      try {
        const response = await fetch(bodyData.imageUrl);
        if (!response.ok) throw new Error("Falha ao acessar a URL.");

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) {
          set.status = 400;
          return { error: "A URL fornecida não aponta para uma imagem válida." };
        }

        fileDataToSave = await response.arrayBuffer();
        const urlObj = new URL(bodyData.imageUrl);
        originalFilename = basename(urlObj.pathname);

        if (!originalFilename || !originalFilename.includes(".")) {
          originalFilename = `imported-${Date.now()}.jpg`;
        }
      } catch (error) {
        set.status = 500;
        return { error: "Erro ao baixar a imagem da URL externa." };
      }
    } 
    
    // --- 2. CAPTURA FLEXÍVEL (MANUAL UPLOAD) ---
    else {
      let uploadedFile: File | null = null;
      
      for (const key in bodyData) {
        const item = bodyData[key];
        if (item instanceof File) {
          uploadedFile = item;
          break;
        } else if (Array.isArray(item) && item[0] instanceof File) {
          uploadedFile = item[0];
          break;
        }
      }

      if (!uploadedFile) {
        set.status = 400;
        return { error: "Nenhum arquivo ou URL encontrado." };
      }

      fileDataToSave = uploadedFile;
      originalFilename = uploadedFile.name;
    }

    // --- 3. PREPARAR PASTA DE DESTINO ---
    const storageRoot = normalize(join(CONFIG.paths.storage, siteStr));
    const uploadDir = normalize(join(storageRoot, targetFolder));

    if (!uploadDir.startsWith(storageRoot)) {
      set.status = 403;
      return { error: "Acesso negado." };
    }

    // --- 4. NOMEAÇÃO E CONVERSÃO PARA WEBP ---
    // Remove the old extension entirely because we are forcing WebP
    const nameBody = basename(originalFilename, extname(originalFilename))
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\-_]/g, "-")
      .toLowerCase();
    
    const cleanNameBody = nameBody.replace(/\-\-+/g, "-").replace(/-+$/, "");
    
    // ✨ Force the .webp extension for maximum compression
    const safeFilename = `${cleanNameBody}.webp`;
    const filePath = normalize(join(uploadDir, safeFilename));

    try {
      await mkdir(uploadDir, { recursive: true });
      
      // --- 5. ✨ COMPRESSION & RESIZING MAGIC WITH SHARP ✨ ---
      
      // Convert the Bun File or ArrayBuffer into a standard Node Buffer
      let bufferToProcess: Buffer;
      if (fileDataToSave instanceof File) {
        bufferToProcess = Buffer.from(await fileDataToSave.arrayBuffer());
      } else {
        bufferToProcess = Buffer.from(fileDataToSave as ArrayBuffer);
      }

      // Run it through Sharp
      const processedImageBuffer = await sharp(bufferToProcess)
        .resize({ 
          width: 1600, // Maximum width of 1600px (great for Hero banners)
          withoutEnlargement: true // Never scale up small images (prevents pixelation)
        })
        .webp({ quality: 80, effort: 4 }) // Convert to WebP with 80% quality
        .toBuffer();

      // Write the compressed WebP buffer to disk
      await Bun.write(filePath, processedImageBuffer);

      return {
        success: true,
        path: targetFolder.startsWith("content") ? safeFilename : `/${targetFolder}/${safeFilename}`, 
        filename: safeFilename,
        folder: targetFolder,
        message: "Upload otimizado concluído!"
      };
    } catch (err: any) {
      console.error("❌ Erro no processamento/upload:", err);
      set.status = 500;
      return { error: "Erro interno ao otimizar e gravar arquivo." };
    }
  }, {
    body: t.Any(), 
    query: t.Object({
      folder: t.Optional(t.String()),
      site: t.Optional(t.String())
    })
  });