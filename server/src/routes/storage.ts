import { Elysia, t } from "elysia";
import { readdir, stat, rm, unlink, mkdir, copyFile, access, rename as fsRename } from "node:fs/promises";
import { join, normalize, dirname, basename } from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { CONFIG } from "../../config";

console.log("🔥 ARQUIVO STORAGE.TS NOVO CARREGADO COM SUCESSO! 🔥");

const sanitizeFilename = (filename: string) => {
  return filename
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\.]/g, '')
    .replace(/\-\-+/g, '-');
}

export const storageRoutes = new Elysia({ prefix: "/storage" })

  // ==========================================
  // 0. LISTAR TODAS AS PASTAS (GET /folders)
  // ==========================================
  .get("/folders", async ({ site, set }) => {
    const baseDir = normalize(join(CONFIG.paths.storage, String(site)));

    const getFoldersRecursive = async (dir: string, base: string, list: string[] = []) => {
      try {
        const items = await readdir(dir, { withFileTypes: true });
        for (const item of items) {
          if (item.isDirectory() && !item.name.startsWith(".") && item.name !== "_schemas") {
            const fullPath = join(dir, item.name);
            const relativePath = fullPath.replace(base, "").replace(/\\/g, "/").replace(/^\//, "");
            list.push(relativePath);
            await getFoldersRecursive(fullPath, base, list);
          }
        }
      } catch (e) { }
      return list;
    };

    try {
      const folders = await getFoldersRecursive(baseDir, baseDir);
      return Array.from(new Set(["content", "content/_globals", ...folders]));
    } catch (error: any) {
      set.status = 500;
      return { error: "Erro ao listar pastas: " + error.message };
    }
  })

  // ==========================================
  // 1. LISTAR CONTEÚDO (GET /)
  // ==========================================
.get("/", async ({ query, site, set }) => {
    const folder = query.folder || "";
    const file = query.file || null;
    const baseDir = normalize(join(CONFIG.paths.storage, String(site)));
    const targetDir = normalize(join(baseDir, folder));

    if (!targetDir.startsWith(baseDir)) {
      set.status = 403;
      return { error: "Acesso negado." };
    }

    try {
      await stat(targetDir);
    } catch {
      set.status = 404;
      return { error: `Pasta não encontrada: ${folder}` };
    }

    if (file) {
      const filePath = normalize(join(targetDir, file));
      if (!filePath.startsWith(baseDir)) { set.status = 403; return { error: "Acesso negado." }; }
      const bunFile = Bun.file(filePath);
      if (!(await bunFile.exists())) { set.status = 404; return { error: "Arquivo não encontrado." }; }
      return { name: file, content: await bunFile.text() };
    }

    try {
      const rawItems = await readdir(targetDir, { withFileTypes: true });
      const hasCollectionMarker = rawItems.some((i) => i.name === ".collection");
      const subDirectories = rawItems.filter((i) => i.isDirectory());

      let folderType = hasCollectionMarker ? "collection" : (subDirectories.length === 0 && rawItems.some((i) => i.name === "_index.md") ? "page" : "folder");

      const processedFiles = await Promise.all(
        rawItems.map(async (item) => {
          const isDirectory = item.isDirectory();
          let metadata: any = { title: item.name, isDir: false, isCollection: false };

          if (isDirectory) {
            const subPath = join(targetDir, item.name);
            const isCommonDir = await Bun.file(join(subPath, ".isDirFlag")).exists();
            const isCollection = await Bun.file(join(subPath, ".collection")).exists();
            const indexMdPath = join(subPath, "_index.md");
            let displayTitle = item.name;
            const indexFile = Bun.file(indexMdPath);

            if (await indexFile.exists()) {
              try {
                const { data } = matter(await indexFile.text());
                if (data.title) displayTitle = data.title;
                // Caso o _index.md também tenha data, capturamos aqui
                if (data.date) metadata.date = data.date;
              } catch (e) { }
            }
            metadata = { ...metadata, title: displayTitle, isDir: isCommonDir, isCollection: isCollection };
          } else {
            // ✅ NOVO: Processamento para ficheiros normais (não-pastas)
            if (item.name.endsWith('.md')) {
              const filePath = join(targetDir, item.name);
              const fileObj = Bun.file(filePath);
              if (await fileObj.exists()) {
                try {
                  const { data } = matter(await fileObj.text());
                  // Substitui o título pelo frontmatter se existir
                  if (data.title) metadata.title = data.title;
                  // Captura a data
                  if (data.date) metadata.date = data.date;
                  
                  // Bónus: Se quiseres retornar TUDO do frontmatter (como roast, imagens),
                  // podes descomentar a linha abaixo para injetar todos os campos no CMS:
                  // metadata = { ...metadata, ...data };
                } catch (e) { }
              }
            }
          }

          return {
            name: item.name,
            path: folder === "content" ? item.name : join(folder, item.name).replace(/\\/g, '/'),
            isDirectory,
            data: metadata,
          };
        })
      );

      const cleanFiles = processedFiles.filter((f) => ![".DS_Store", "_order.yml", "_order.json", "_schema.json"].includes(f.name));
      let orderList: string[] = [];
      const ymlOrderFile = Bun.file(join(targetDir, "_order.yml"));

      try {
        if (await ymlOrderFile.exists()) {
          const parsed = yaml.load(await ymlOrderFile.text());
          if (Array.isArray(parsed)) orderList = parsed;
        }
      } catch (e) { }

      cleanFiles.sort((a, b) => {
        // PRIORIDADE MÁXIMA: _index.md e _index.js sempre no topo
        const isIndexA = a.name === "_index.md" || a.name === "_index.js";
        const isIndexB = b.name === "_index.md" || b.name === "_index.js";

        if (isIndexA && !isIndexB) return -1;
        if (!isIndexA && isIndexB) return 1;
        if (isIndexA && isIndexB) return a.name.localeCompare(b.name);

        // compare sem a extensão
        const nameA = a.name.replace(/\.[^/.]+$/, '')
        const nameB = b.name.replace(/\.[^/.]+$/, '')

        const indexA = orderList.indexOf(nameA) !== -1 ? orderList.indexOf(nameA) : orderList.indexOf(a.name)
        const indexB = orderList.indexOf(nameB) !== -1 ? orderList.indexOf(nameB) : orderList.indexOf(b.name)

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      return { type: folderType, files: cleanFiles };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  }, {
    query: t.Object({
      folder: t.Optional(t.String()),
      file: t.Optional(t.String())
    })
  })

  // ==========================================
  // 2. SALVAR/CRIAR ARQUIVO (POST /)
  // ==========================================
  .post("/", async ({ body, site, set }) => {
    const { folder, file, content } = body;
    const baseDir = normalize(join(CONFIG.paths.storage, String(site)));
    const targetPath = normalize(join(baseDir, folder, file));

    if (!targetPath.startsWith(baseDir)) { set.status = 403; return { error: "Acesso negado: Caminho inválido." }; }
    try {
      await Bun.write(targetPath, content || "");
      return { success: true, message: "Arquivo salvo com sucesso!" };
    } catch (err: any) {
      set.status = 500; return { error: "Erro ao salvar o arquivo: " + err.message };
    }
  }, {
    body: t.Object({ folder: t.String(), file: t.String(), content: t.Optional(t.String()) })
  })

  // ==========================================
  // 3. DELETAR (DELETE /)
  // ==========================================
  .delete("/", async ({ body, site, set }) => {
    const { path: itemPath, folder, file } = body;
    const baseDir = normalize(join(CONFIG.paths.storage, String(site)));
    const targetPath = itemPath ? normalize(join(baseDir, itemPath)) : normalize(join(baseDir, folder || "", file || ""));

    if (!targetPath.startsWith(baseDir) || targetPath === baseDir) { set.status = 403; return { error: "Acesso negado." }; }
    try {
      const stats = await stat(targetPath);
      if (stats.isDirectory()) { await rm(targetPath, { recursive: true, force: true }); }
      else { await unlink(targetPath); }
      return { success: true, message: "Removido com sucesso!" };
    } catch (err: any) {
      set.status = 500; return { error: "Erro ao deletar: " + err.message };
    }
  }, {
    body: t.Object({ path: t.Optional(t.String()), folder: t.Optional(t.String()), file: t.Optional(t.String()) })
  })

  // ==========================================
  // 4. CRIAR PASTA (POST /mkdir)
  // ==========================================
  .post("/mkdir", async ({ body, site, set }) => {
    const { name, folder } = body;
    const safeName = sanitizeFilename(name).replace(/-+$/, "");
    if (!safeName) { set.status = 400; return { success: false, error: "Nome de pasta inválido." }; }

    const storageRoot = normalize(join(CONFIG.paths.storage, String(site)));
    const parentPath = normalize(join(storageRoot, folder));
    const targetPath = join(parentPath, safeName);

    if (!targetPath.startsWith(storageRoot)) { set.status = 403; return { success: false, error: "Acesso negado." }; }
    try {
      await mkdir(targetPath, { recursive: true });
      const sourceSchema = join(parentPath, "_schema.json");
      const destSchema = join(targetPath, "_schema.json");
      try {
        await access(sourceSchema);
        await copyFile(sourceSchema, destSchema);
      } catch { }
      return { success: true, folderName: safeName, path: targetPath };
    } catch (error: any) {
      set.status = 500; return { success: false, error: `Erro ao criar pasta: ${error.message}` };
    }
  }, {
    body: t.Object({ name: t.String(), folder: t.String() })
  })

  // ==========================================
  // 5. RENOMEAR (POST /rename)
  // ==========================================
  .post("/rename", async ({ body, site, set }) => {
    const { oldname, newname } = body;
    const newDir = dirname(newname);
    const sanitizedBase = sanitizeFilename(basename(newname));
    const finalNewName = join(newDir, sanitizedBase);

    const storageRoot = normalize(join(CONFIG.paths.storage, String(site)));
    const oldPath = normalize(join(storageRoot, oldname));
    const newPath = normalize(join(storageRoot, finalNewName));

    if (!oldPath.startsWith(storageRoot) || !newPath.startsWith(storageRoot)) { set.status = 403; return { success: false, error: 'Acesso negado.' }; }
    try {
      await fsRename(oldPath, newPath);
      return { success: true, oldname, newname: finalNewName };
    } catch (error: any) {
      set.status = 500; return { success: false, error: "Erro ao renomear ficheiro ou pasta." };
    }
  }, {
    body: t.Object({ oldname: t.String(), newname: t.String() })
  })

  // ==========================================
  // 6. REORDENAR ITENS (POST /reorder)
  // ==========================================
  .post("/reorder", async ({ body, site, set }) => {
    console.log("Reordenar itens:", body);
    const { folder, files } = body;
    const storageRoot = normalize(join(CONFIG.paths.storage, String(site)));
    const baseDir = normalize(join(storageRoot, folder));

    if (!baseDir.startsWith(storageRoot)) { set.status = 403; return { success: false, error: "Acesso negado." }; }
    const orderFilePath = normalize(join(baseDir, "_order.yml"));

    try {
      const yamlContent = yaml.dump(files, { indent: 2, lineWidth: -1 });
      await Bun.write(orderFilePath, yamlContent);
      return { success: true, message: "Ordenação salva com sucesso!" };
    } catch (error: any) {
      set.status = 500; return { success: false, error: "Erro ao salvar a ordenação." };
    }
  }, {
    body: t.Object({ folder: t.String(), files: t.Array(t.String()) })
  });