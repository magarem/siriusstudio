import { Elysia, t } from "elysia";
import { mkdir, copyFile, access } from "fs/promises";
import { join, normalize } from "path";
import { STORAGE_PATH } from "../index"; // Importa a configuração mestre

export const mkdirRoutes = new Elysia({ prefix: "/mkdir" })
  // O JWT e a validação do 'site' já são resolvidos pelo grupo no index.ts

  .post(
    "/",
    async ({ body, site, set }) => {
      // 1. O site agora vem injetado pelo .derive() do index.ts
      const { name, folder } = body;

      // 2. Sanitização do nome (Slugify)
      const safeName = name
        .toString()
        .toLowerCase()
        .trim()
        .normalize("NFD") 
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");

      if (!safeName) {
        set.status = 400;
        return { success: false, error: "Nome de pasta inválido após sanitização." };
      }

      // 3. Resolução de Caminhos usando a constante centralizada (Mac ou Hostinger)
      const storageRoot = normalize(join(STORAGE_PATH, String(site)));
      const parentPath = normalize(join(storageRoot, folder));
      const targetPath = join(parentPath, safeName);

      // Trava de segurança contra Path Traversal
      if (!targetPath.startsWith(storageRoot)) {
        set.status = 403;
        return { success: false, error: "Acesso negado: Tentativa de sair do diretório do site." };
      }

      try {
        // 4. Criação da pasta
        await mkdir(targetPath, { recursive: true });

        // 5. Herança de Schema (_schema.json)
        const sourceSchema = join(parentPath, "_schema.json");
        const destSchema = join(targetPath, "_schema.json");

        try {
          await access(sourceSchema);
          await copyFile(sourceSchema, destSchema);
        } catch {
          // Silencioso: Se não houver schema pai, prossegue normalmente
        }

        return { 
          success: true, 
          folderName: safeName,
          path: targetPath 
        };

      } catch (error: any) {
        set.status = 500;
        return { 
          success: false, 
          error: `Erro de sistema ao criar pasta: ${error.message}` 
        };
      }
    },
    {
      // A Blindagem High Top: Protege contra 'null or undefined'
      body: t.Object({
        name: t.String(),
        folder: t.String(),
      }),
    }
  );