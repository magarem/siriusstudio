import { Elysia, t } from "elysia";
import { join, normalize } from "path";
import yaml from "js-yaml";
import { STORAGE_PATH } from "../index"; // Importa a configuração mestre

export const reorderRoutes = new Elysia({ prefix: "/reorder" })
  // O JWT e a validação do 'site' já são resolvidos pelo grupo no index.ts

  .post(
    "/",
    async ({ body, site, set }) => {
      // 1. O site agora vem injetado pelo .derive() do index.ts
      const { folder, files } = body;

      // 2. Resolução de Caminhos usando a constante centralizada
      const storageRoot = normalize(join(STORAGE_PATH, String(site)));
      const baseDir = normalize(join(storageRoot, folder));

      // Trava de segurança contra Path Traversal
      if (!baseDir.startsWith(storageRoot)) {
        set.status = 403;
        return { success: false, error: "Acesso negado: Tentativa de sair do diretório do site." };
      }

      const orderFilePath = normalize(join(baseDir, "_order.yml"));

      try {
        // 3. Converte o Array JS para formato YAML (estilo PrimeVue Reorder)
        const yamlContent = yaml.dump(files, {
          indent: 2,
          lineWidth: -1, // Mantém nomes de arquivos longos em uma única linha
        });

        // 4. Grava o arquivo na velocidade do Bun
        await Bun.write(orderFilePath, yamlContent);

        return { success: true };
      } catch (error: any) {
        console.error("❌ Erro ao salvar _order.yml:", error);
        set.status = 500;
        return { success: false, error: "Erro interno ao salvar a ordenação." };
      }
    },
    {
      // A Blindagem High Top: Protege contra 'null or undefined'
      body: t.Object({
        folder: t.String(),
        files: t.Array(t.String()), 
      }),
    }
  );