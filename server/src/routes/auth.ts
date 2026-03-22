import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { join, normalize } from "node:path"; // Prefixo 'node:' adicionado
import { CONFIG } from "../../config"; // Usando a fonte da verdade centralizada

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "uma_chave_muito_longa_e_aleatoria_123456",
    })
  )
  .post("/login", async ({ body, jwt, cookie: { auth_token, cms_site_context }, set }) => {
    set.headers['content-type'] = 'application/json';

    const { username, password, domain } = body;

    // Usando o CONFIG centralizado
    const baseDir = normalize(CONFIG.paths.storage);
    const usersFilePath = normalize(join(baseDir, domain, ".auth", "users.json"));

    // Trava de Path Traversal
    if (!usersFilePath.startsWith(baseDir)) {
      set.status = 403;
      return { success: false, message: "Acesso ilegal." };
    }

    const file = Bun.file(usersFilePath);
    if (!(await file.exists())) {
      set.status = 401;
      return { success: false, message: "Credenciais inválidas ou domínio não configurado!" };
    }

    try {
      const fileContent = await file.text();
      const users = JSON.parse(fileContent);
      
      // NOTA DE SEGURANÇA: No futuro, considere usar Bun.password.verify() aqui!
      const user = users.find((u: any) => u.username === username && u.password === password);

      if (!user) {
        set.status = 401;
        return { success: false, message: "Usuário ou senha inválidos" };
      }

      // 1. Criação do Token JWT
      const token = await jwt.sign({
        userId: user.id,
        username: user.username,
        role: user.role || "admin",
        domain: domain,
        exp: Math.floor(Date.now() / 1000) + 86400, // Expira em 24 horas
      });

      // 2. Configuração dos Cookies
      auth_token.value = token;
      auth_token.path = "/";
      auth_token.maxAge = 86400;
      auth_token.httpOnly = false; // Permite que o Nuxt leia o cookie no Client-Side
      auth_token.sameSite = "lax";
      auth_token.secure = process.env.NODE_ENV === "production";

      cms_site_context.value = domain;
      cms_site_context.path = "/";
      cms_site_context.maxAge = 86400;
      cms_site_context.httpOnly = false;
      cms_site_context.sameSite = "lax";

      return { 
        success: true, 
        message: "Login efetuado com sucesso" 
      };

    } catch (err: any) {
      console.error("Erro no login:", err);
      set.status = 500;
      return { success: false, message: "Erro interno ao processar login." };
    }
  }, {
    // Blindagem de Tipagem do Elysia
    body: t.Object({
      username: t.String(),
      password: t.String(),
      domain: t.String()
    })
  })
  
  // ==========================================
  // LOGOUT (POST /logout)
  // ==========================================
  .post("/logout", ({ cookie: { auth_token, cms_site_context } }) => {
    auth_token.remove();
    cms_site_context.remove();
    return { success: true, message: "Logout efetuado com sucesso" };
  });