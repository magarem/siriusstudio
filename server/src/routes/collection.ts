import { Elysia, t } from "elysia";
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { normalize, join } from "node:path";
import { CONFIG } from "../../config"; // Ajuste o nível de pastas ../ conforme necessário

export const collectionRoutes = new Elysia({ prefix: "/create-collection" })
  .post("/", ({ body, error }) => {
    const { site, folder, name } = body;

    if (!site || !name) {
      return error(400, { error: "Dados incompletos." });
    }

    // 1. Definição de Caminhos usando CONFIG centralizado
    const siteRoot = normalize(join(CONFIG.paths.storage, String(site)));
    
    // Sanitização do nome da nova coleção
    const collectionName = name.trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/\s+/g, "-");
      
    const targetDir = normalize(join(siteRoot, folder, collectionName));

    // 🔒 Trava de segurança contra Path Traversal
    if (!targetDir.startsWith(siteRoot)) {
        return error(403, { error: "Acesso negado: Tentativa de sair do diretório do site." });
    }

    // Caminho do Schema Global (Origem)
    const globalSchemaPath = normalize(join(siteRoot, "content", "_schemas", "default.json"));

    // 2. Verificação de Segurança
    if (existsSync(targetDir)) {
      return error(409, { error: "Esta coleção já existe." });
    }

    try {
      // 3. Cria a Pasta da Coleção
      mkdirSync(targetDir, { recursive: true });

      // 4. Cria os marcadores de diretório e coleção
      writeFileSync(join(targetDir, ".collection"), JSON.stringify({ created: new Date() }, null, 2));
      writeFileSync(join(targetDir, ".isDirFlag"), JSON.stringify({ created: new Date() }, null, 2));

      // 5. Cria o _index.md (Capa da Coleção)
      const indexContent = `---\ntitle: ${name}\n---\n\n<Listfiles></Listfiles>`;
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

      // Retorna o caminho limpo para o frontend navegar
      return { 
        success: true, 
        path: folder === 'content' ? collectionName : `${folder}/${collectionName}` 
      };

    } catch (err: any) {
      return error(500, { error: err.message });
    }
  }, {
    // Validação estrita do payload com Elysia t.Object
    body: t.Object({
      site: t.String(),
      folder: t.String(),
      name: t.String()
    })
  });