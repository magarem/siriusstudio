import { Elysia, t } from "elysia";
import { rename } from "fs/promises";
import { join, normalize, dirname, basename } from "path";
import { STORAGE_PATH } from "../index"; // Importa a configuração mestre

// Função de sanitização robusta para manter o padrão High Top
const sanitizeFilename = (filename: string) => {
  return filename
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\.]/g, '')
    .replace(/\-\-+/g, '-');
}

export const renameRoutes = new Elysia({ prefix: "/rename" }) // Prefixo simplificado (grupo /api/admin)
  // JWT e Site já resolvidos pelo .derive e .onBeforeHandle no index.ts
  
  .post("/", async ({ body, site, set }) => {
    // 1. O site agora vem injetado automaticamente pelo contexto global
    const { oldname, newname } = body;

    // 2. Preparação dos nomes e caminhos
    const newDir = dirname(newname);
    const sanitizedBase = sanitizeFilename(basename(newname));
    const finalNewName = join(newDir, sanitizedBase);

    // 3. Resolução de Caminhos com a constante que detecta Mac ou Hostinger
    const storageRoot = normalize(join(STORAGE_PATH, String(site)));
    const oldPath = normalize(join(storageRoot, oldname));
    const newPath = normalize(join(storageRoot, finalNewName));

    // 4. Trava de Segurança contra Path Traversal
    if (!oldPath.startsWith(storageRoot) || !newPath.startsWith(storageRoot)) {
      set.status = 403;
      return { success: false, error: 'Acesso negado: Caminho fora do diretório permitido.' };
    }

    try {
      // 5. Execução do Rename
      await rename(oldPath, newPath);
      return { success: true, oldname, newname: finalNewName };
    } catch (error: any) {
      console.error("❌ Erro ao renomear:", error.message);
      set.status = 500;
      return { success: false, error: "Erro de sistema ao renomear ficheiro ou pasta." };
    }
  }, 
  {
    // A Blindagem High Top: Garante que o body nunca seja null
    body: t.Object({
      oldname: t.String(),
      newname: t.String()
    })
  });