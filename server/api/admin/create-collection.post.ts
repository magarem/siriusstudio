// server/api/admin/create-collection.post.ts
import { mkdirSync, writeFileSync, copyFileSync, existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { readBody } from "h3";
import { getCookie, getQuery, createError, defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const {folder, name } = body;
  const site = getCookie(event, "cms_site_context");
  

  if (!site || !name) {
    throw createError({ statusCode: 400, statusMessage: "Dados incompletos." });
  }

  // 1. Definição de Caminhos
  const APPS_ROOT = config.storagePath ? resolve(String(config.storagePath)) : process.cwd();
  const siteRoot = join(APPS_ROOT, "storage", site);
  
  // Caminho da nova coleção
  const collectionName = name.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, "-");
    
  const targetDir = join(siteRoot, folder, collectionName);

  // Caminho do Schema Global (Origem)
  const globalSchemaPath = join(siteRoot, "content", "_schemas", "default.json");

  // 2. Verificação de Segurança
  if (existsSync(targetDir)) {
    throw createError({ statusCode: 409, statusMessage: "Esta coleção já existe." });
  }

  try {
    // 3. Cria a Pasta da Coleção
    mkdirSync(targetDir, { recursive: true });

    // 4. Cria o marcador .collection
    writeFileSync(join(targetDir, ".collection"), JSON.stringify({ created: new Date() }, null, 2));
    writeFileSync(join(targetDir, ".isDirFlag"), JSON.stringify({ created: new Date() }, null, 2));

    // 5. Cria o _index.md (Capa da Coleção)
    const indexContent = `---\ntitle: ${name}\n---\n\n <Listfiles></Listfiles>`;
    writeFileSync(join(targetDir, "_index.md"), indexContent);

    // 6. Lógica de Schema Local
    const localSchemaDir = join(targetDir, "_schemas");
    mkdirSync(localSchemaDir, { recursive: true });

    if (existsSync(globalSchemaPath)) {
      // Copia o default.json global para a pasta local
      copyFileSync(globalSchemaPath, join(localSchemaDir, "default.json"));
    } else {
      // Fallback: Se não existir global, cria um básico
      const basicSchema = {
        name: "default",
        fields: [
          { name: "title", label: "Título", type: "text" },
          { name: "date", label: "Data", type: "date" },
          { name: "draft", label: "Rascunho", type: "boolean" },
          { name: "coverimage", label: "Imagem de Capa", type: "image" }
        ]
      };
      writeFileSync(join(localSchemaDir, "default.json"), JSON.stringify(basicSchema, null, 2));
    }

    // Retorna o caminho para o frontend navegar
    return { 
      success: true, 
      path: folder === 'content' ? collectionName : `${folder}/${collectionName}` 
    };

  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});