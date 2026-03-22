import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger"; 
// 1. IMPORTAÇÃO DAS ROTAS
import { authRoutes } from "./routes/auth";
import { assetsRoutes } from "./routes/assets";
import { storageRoutes } from "./routes/storage";
import { collectionRoutes } from "./routes/collection";
import { uploadRoutes } from "./routes/upload";
import { schemaRoutes } from "./routes/schema";
import { publishRoutes } from "./routes/publish";
import { backupRoutes } from "./routes/backup";
import { CONFIG } from "../config";

// (Limpamos os imports de mkdir, rename e reorder, pois agora vivem no storageRoutes!)

// 2. CONFIGURAÇÃO DE CAMINHOS CENTRALIZADA
const isMac = process.platform === "darwin";
export const STORAGE_PATH = process.env.STORAGE_PATH;

const app = new Elysia()
  // --- DOCUMENTAÇÃO SWAGGER ---
  // Acessível via /docs
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Sirius CMS API',
        version: '1.0.0',
        description: 'Painel administrativo interativo para testes do Headless CMS.'
      }
    }
  }))

  // 3. MIDDLEWARES GLOBAIS
  .use(
    cors({
      origin: true, 
      credentials: true, // ESSENCIAL para os cookies transitarem
      allowedHeaders: ["Content-Type", "Authorization", "x-cms-site"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "uma_chave_muito_longa_e_aleatoria_123456",
    })
  )

  // 4. ROTAS TOTALMENTE PÚBLICAS
  .use(authRoutes)

  // 5. O CORAÇÃO DO SISTEMA: EXTRAÇÃO DE CONTEXTO (.derive)
  .derive(({ cookie: { cms_site_context } }) => {
    return {
      site: cms_site_context?.value
    };
  })

  // 6. ASSETS (Imagens e Mídias)
  .use(assetsRoutes)
.get("/", () => "Bem-vindo ao Sirius CMS - Core Engine! 🚀")
  // 7. GRUPO PROTEGIDO DO PAINEL (/api/admin)
  .group("/api/admin", (admin) => 
    admin
      // Barreira de Fogo Central
      .onBeforeHandle(({ site, set }) => {
        if (!site) {
          set.status = 401;
          return { success: false, error: "Site não identificado no contexto (cookie)." };
        }
      })
      // Registro das rotas administrativas
      .use(storageRoutes) // O storage agora é super-poderoso!
      .use(collectionRoutes) // O storage agora é super-poderoso!
      .use(uploadRoutes)
      .use(schemaRoutes)
      .use(publishRoutes)
      .use(backupRoutes) 
  )
  .listen(process.env.PORT || 8080);

// 8. LOGS DE INICIALIZAÇÃO
console.log(`🦊 Sirius Server (Core Engine) rodando em ${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Documentação Interativa (Swagger): http://${app.server?.hostname}:${app.server?.port}/docs`);
console.log(`📂 Storage ativo em: ${CONFIG.paths.storage}`);

// ==========================================
// 9. AUTO-GERADOR DE DOCUMENTAÇÃO MARKDOWN
// ==========================================
const generateApiMarkdown = async () => {
  let mdContent = "# 🚀 Sirius CMS - API Reference\n\n";
  mdContent += "> Auto-generated documentation for the Sirius CMS Backend.\n\n";

  // Agrupar rotas por caminho base (ex: /storage, /publish)
  let currentGroup = "";

  app.routes.forEach((route) => {
    // Ignorar as rotas internas do próprio Swagger para manter o MD limpo
    if (route.path.startsWith('/docs') || route.path === '/') return;

    // Criar um subtítulo visual para agrupar as rotas
    const groupName = route.path.split('/')[2] || 'core'; 
    if (groupName !== currentGroup) {
      mdContent += `\n---\n### 📂 /${groupName.toUpperCase()}\n\n`;
      currentGroup = groupName;
    }

    // Adicionar o Método e o Caminho
    mdContent += `- **${route.method}** \`${route.path}\`\n`;
  });

  // Escrever o arquivo na raiz do servidor usando a velocidade do Bun
  try {
    await Bun.write("API.md", mdContent);
    console.log("📄 Arquivo API.md auto-gerado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao gerar API.md:", err);
  }
};

// Executa a função assim que o servidor liga!
generateApiMarkdown();