import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { readdir, stat, mkdir, rm, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import * as tar from "tar";
import { CONFIG } from "../../config"; // Usando o Cérebro Central

export const backupRoutes = new Elysia({ prefix: "/backup" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "uma_chave_muito_longa_e_aleatoria_123456",
    })
  )
  
  // ==========================================
  // 1. LISTAR BACKUPS (GET /)
  // ==========================================
  .get("/", async ({ site }) => {
    const siteStr = String(site);
    const storageRoot = CONFIG.paths.storage;
    const backupsRoot = join(dirname(storageRoot), "backups"); 
    const backupDir = join(backupsRoot, siteStr);

    const dirExists = await Bun.file(backupDir).exists() || await Bun.file(join(backupDir, '.')).exists();
    // Fallback manual para checar diretório se o Bun.file falhar em pastas vazias
    try {
        await stat(backupDir);
    } catch {
        return [];
    }

    try {
      const rawFiles = await readdir(backupDir);
      const tarFiles = rawFiles.filter((file) => file.endsWith(".tar.gz"));

      // Usa Promise.all para ler os arquivos de forma assíncrona e paralela!
      const processedFiles = await Promise.all(
        tarFiles.map(async (file) => {
          const filePath = join(backupDir, file);
          try {
            const fileStats = await stat(filePath);
            let displayName = file;
            const firstUnderscoreIndex = file.indexOf("_");

            if (firstUnderscoreIndex !== -1) {
              const rawName = file.substring(firstUnderscoreIndex + 1);
              let cleanName = rawName.replace(".tar.gz", "").replace(/-/g, " ");
              displayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            }

            return {
              filename: file,
              name: displayName,
              size: (fileStats.size / 1024 / 1024).toFixed(2) + " MB",
              created: fileStats.birthtime,
              timestamp: fileStats.birthtime.getTime(),
            };
          } catch (err) {
            return null;
          }
        })
      );

      return processedFiles
        .filter(Boolean)
        .sort((a: any, b: any) => b.timestamp - a.timestamp);
        
    } catch (err) {
      return [];
    }
  })

  // ==========================================
  // 2. CRIAR BACKUP (POST /create)
  // ==========================================
  .post("/create", async ({ body, site, set }) => {
      const { name } = body;
      const siteStr = String(site);
      
      const storageRoot = CONFIG.paths.storage;
      const backupsRoot = join(dirname(storageRoot), "backups");
      const sourceDir = join(storageRoot, siteStr);
      const destDir = join(backupsRoot, siteStr);

      try {
        await stat(sourceDir);
      } catch {
        set.status = 404;
        return { success: false, error: "Site não encontrado no storage." };
      }

      try {
        await stat(destDir);
      } catch {
        await mkdir(destDir, { recursive: true });
      }

      const safeName = name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${dateStr}_${safeName}.tar.gz`;
      const destPath = join(destDir, fileName);

      try {
        // tar.create já retorna uma Promise, então o await aqui é perfeito!
        await tar.create(
          {
            gzip: true,
            file: destPath,
            cwd: storageRoot, 
            portable: true,
          },
          [siteStr] 
        );

        return { success: true, file: fileName, message: "Backup criado com sucesso!" };
      } catch (error: any) {
        set.status = 500;
        return { success: false, error: "Falha na compactação: " + error.message };
      }
    },
    {
      body: t.Object({ name: t.String() }),
    }
  )

  // ==========================================
  // 3. DELETAR BACKUP (POST /delete)
  // ==========================================
  .post("/delete", async ({ body, site, set }) => {
      const { filename } = body;
      const siteStr = String(site);
      const backupsRoot = join(dirname(CONFIG.paths.storage), "backups");
      const backupDir = join(backupsRoot, siteStr);
      const filePath = join(backupDir, filename);

      if (!filePath.startsWith(backupDir)) {
        set.status = 403;
        return { success: false, error: "Acesso negado." };
      }

      const file = Bun.file(filePath);
      if (!(await file.exists())) {
        set.status = 404;
        return { success: false, error: "Backup não encontrado." };
      }

      try {
        await unlink(filePath);
        return { success: true, message: "Backup excluído com sucesso!" };
      } catch (error: any) {
        set.status = 500;
        return { success: false, error: "Falha ao excluir arquivo." };
      }
    },
    {
      body: t.Object({ filename: t.String() }),
    }
  )

  // ==========================================
  // 4. RESTAURAR BACKUP (POST /restore)
  // ==========================================
  .post("/restore", async ({ body, site, set }) => {
      const { filename } = body;
      const siteStr = String(site);
      
      const storageRoot = CONFIG.paths.storage;
      const backupsRoot = join(dirname(storageRoot), "backups");
      const backupDir = join(backupsRoot, siteStr);
      const backupFile = join(backupDir, filename);
      const siteStorageDir = join(storageRoot, siteStr);

      if (!backupFile.startsWith(backupDir)) {
        set.status = 403;
        return { success: false, error: "Acesso negado ao arquivo." };
      }

      const file = Bun.file(backupFile);
      if (!(await file.exists())) {
        set.status = 404;
        return { success: false, error: "Arquivo de backup não encontrado." };
      }

      try {
        // Remove o site atual de forma assíncrona
        try {
            await stat(siteStorageDir);
            await rm(siteStorageDir, { recursive: true, force: true });
        } catch {
            // Se não existe, apenas ignora e segue para a extração
        }

        // Extrai o backup de forma assíncrona
        await tar.extract({
          file: backupFile,
          cwd: storageRoot,
          strict: false,
          preserveOwner: false,
          unlink: true,
        });

        return { success: true, message: "Backup restaurado com sucesso!" };
      } catch (error: any) {
        set.status = 500;
        return { success: false, error: "Falha crítica ao restaurar: " + error.message };
      }
    },
    {
      body: t.Object({ filename: t.String() }),
    }
  );