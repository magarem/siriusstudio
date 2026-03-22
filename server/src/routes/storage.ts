import { Elysia, t } from "elysia";
import { readdir, stat, rm, unlink, mkdir, copyFile, access, rename as fsRename } from "node:fs/promises";
import { join, normalize, dirname, basename } from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { CONFIG } from "../../config";

// Função de sanitização robusta para manter o padrão High Top
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
  // 1. LISTAR CONTEÚDO (GET /)
  // ==========================================
  .get("/", async ({ query, site, set }) => {
    const folder = query.folder || "";
    const file = query.file || null;

    const baseDir = normalize(join(CONFIG.paths.storage, String(site)));
    const targetDir = normalize(join(baseDir, folder));

    if (!targetDir.startsWith(baseDir)) {
      set.status = 403;
      return { error: "Acesso negado: Tentativa de sair do diretório do site." };
    }

    try {
      await stat(targetDir);
    } catch {
      set.status = 404;
      return { error: `Pasta não encontrada: ${folder}` };
    }

    if (file) {
      const filePath = normalize(join(targetDir, file));
      if (!filePath.startsWith(baseDir)) {
        set.status = 403;
        return { error: "Acesso negado." };
      }
      
      const bunFile = Bun.file(filePath);
      if (!(await bunFile.exists())) {
        set.status = 404;
        return { error: "Arquivo não encontrado." };
      }
      return { name: file, content: await bunFile.text() };
    }

    try {
      const rawItems = await readdir(targetDir, { withFileTypes: true });
      const hasCollectionMarker = rawItems.some((i) => i.name === ".collection");
      const subDirectories = rawItems.filter((i) => i.isDirectory());
      
      let folderType = "folder";
      if (hasCollectionMarker) {
        folderType = "collection";
      } else if (subDirectories.length === 0 && rawItems.some((i) => i.name === "_index.md")) {
        folderType = "page";
      }

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
              } catch (e) {}
            }

            metadata = { title: displayTitle, isDir: isCommonDir, isCollection: isCollection };
          }

          return {
            name: item.name,
            path: folder === "content" ? item.name : join(folder, item.name).replace(/\\/g, '/'),
            isDirectory,
            data: metadata,
          };
        })
      );

      const cleanFiles = processedFiles.filter(
        (f) => ![".DS_Store", "_order.yml", "_order.json", "_schema.json"].includes(f.name)
      );

      let orderList: string[] = [];
      const ymlOrderFile = Bun.file(join(targetDir, "_order.yml"));
      try {
        if (await ymlOrderFile.exists()) {
          const parsed = yaml.load(await ymlOrderFile.text());
          if (Array.isArray(parsed)) orderList = parsed;
        }
      } catch (e) {}

      cleanFiles.sort((a, b) => {
        const indexA = orderList.indexOf(a.name);
        const indexB = orderList.indexOf(b.name);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
        return a.isDirectory ? -1 : 1;
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

    if (!targetPath.startsWith(baseDir)) {
      set.status = 403;
      return { error: "Acesso negado: Caminho inválido." };
    }

    try {
      await Bun.write(targetPath, content || "");
      return { success: true, message: "Arquivo salvo com sucesso!" };
    } catch (err: any) {
      set.status = 500;
      return { error: "Erro ao salvar o arquivo: " + err.message };
    }
  }, {
    body: t.Object({
      folder: t.String(),
      file: t.String(),
      content: t.Optional(t.String())
    })
  })
  
  // ==========================================
  // 3. DELETAR (DELETE /)
  // ==========================================
  .delete("/", async ({ body, site, set }) => {
    const { path: itemPath, folder, file } = body;
    const baseDir = normalize(join(CONFIG.paths.storage, String(site)));
    
    const targetPath = itemPath 
      ? normalize(join(baseDir, itemPath)) 
      : normalize(join(baseDir, folder || "", file || ""));

    if (!targetPath.startsWith(baseDir) || targetPath === baseDir) {
      set.status = 403;
      return { error: "Acesso negado ou tentativa de deletar diretório raiz." };
    }

    try {
      const stats = await stat(targetPath);
      if (stats.isDirectory()) {
        await rm(targetPath, { recursive: true, force: true });
      } else {
        await unlink(targetPath);
      }
      return { success: true, message: "Removido com sucesso!" };
    } catch (err: any) {
      set.status = 500;
      return { error: "Erro ao deletar: " + err.message };
    }
  }, {
    body: t.Object({
      path: t.Optional(t.String()),
      folder: t.Optional(t.String()),
      file: t.Optional(t.String())
    })
  })
  // ==========================================
  // 4. CRIAR PASTA (POST /mkdir)
  // ==========================================
  .post("/mkdir", async ({ body, site, set }) => {
    const { name, folder } = body;

    const safeName = sanitizeFilename(name).replace(/-+$/, ""); // Reaproveita a sanitização e tira o traço do final

    if (!safeName) {
      set.status = 400;
      return { success: false, error: "Nome de pasta inválido após sanitização." };
    }

    const storageRoot = normalize(join(CONFIG.paths.storage, String(site)));
    const parentPath = normalize(join(storageRoot, folder));
    const targetPath = join(parentPath, safeName);

    if (!targetPath.startsWith(storageRoot)) {
      set.status = 403;
      return { success: false, error: "Acesso negado: Tentativa de sair do diretório do site." };
    }

    try {
      await mkdir(targetPath, { recursive: true });

      const sourceSchema = join(parentPath, "_schema.json");
      const destSchema = join(targetPath, "_schema.json");

      try {
        await access(sourceSchema);
        await copyFile(sourceSchema, destSchema);
      } catch {
        // Silencioso se não houver schema
      }

      return { success: true, folderName: safeName, path: targetPath };
    } catch (error: any) {
      set.status = 500;
      return { success: false, error: `Erro de sistema ao criar pasta: ${error.message}` };
    }
  }, {
    body: t.Object({
      name: t.String(),
      folder: t.String(),
    })
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

    if (!oldPath.startsWith(storageRoot) || !newPath.startsWith(storageRoot)) {
      set.status = 403;
      return { success: false, error: 'Acesso negado: Caminho fora do diretório permitido.' };
    }

    try {
      await fsRename(oldPath, newPath);
      return { success: true, oldname, newname: finalNewName };
    } catch (error: any) {
      console.error("❌ Erro ao renomear:", error.message);
      set.status = 500;
      return { success: false, error: "Erro de sistema ao renomear ficheiro ou pasta." };
    }
  }, 
  {
    body: t.Object({
      oldname: t.String(),
      newname: t.String()
    })
  })
  // ==========================================
  // 6. REORDENAR ITENS (POST /reorder)
  // ==========================================
  .post("/reorder", async ({ body, site, set }) => {
    const { folder, files } = body;

    // Resolução de Caminhos usando a constante centralizada
    const storageRoot = normalize(join(CONFIG.paths.storage, String(site)));
    const baseDir = normalize(join(storageRoot, folder));

    // Trava de segurança contra Path Traversal
    if (!baseDir.startsWith(storageRoot)) {
      set.status = 403;
      return { success: false, error: "Acesso negado: Tentativa de sair do diretório do site." };
    }

    const orderFilePath = normalize(join(baseDir, "_order.yml"));

    try {
      // Converte o Array JS para formato YAML (estilo PrimeVue Reorder)
      const yamlContent = yaml.dump(files, {
        indent: 2,
        lineWidth: -1, // Mantém nomes de arquivos longos em uma única linha
      });

      // Grava o arquivo na velocidade do Bun
      await Bun.write(orderFilePath, yamlContent);

      return { success: true, message: "Ordenação salva com sucesso!" };
    } catch (error: any) {
      console.error("❌ Erro ao salvar _order.yml:", error);
      set.status = 500;
      return { success: false, error: "Erro interno ao salvar a ordenação." };
    }
  }, {
    // A Blindagem High Top
    body: t.Object({
      folder: t.String(),
      files: t.Array(t.String()), 
    })
  });