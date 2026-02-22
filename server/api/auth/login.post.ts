import { promises as fs } from 'node:fs';
import { resolve, join } from 'node:path';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { username, password, domain } = body;

  if (!username || !password || !domain) {
    throw createError({ statusCode: 400, message: 'Faltam credenciais ou domínio.' });
  }

  // Proteção contra Path Traversal no domínio
  // if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
  //   throw createError({ statusCode: 400, message: 'Formato de domínio inválido.' });
  // }

  const APPS_ROOT = config.storagePath ? resolve(String(config.storagePath)) : process.cwd();
  
  // Aponta direto para o novo arquivo JSON
  const usersFilePath = resolve(join(APPS_ROOT, 'storage', domain, '.auth', 'users.json'));
  console.log("🚀 ~ usersFilePath:", usersFilePath)

  // Trava de segurança extra
  if (!usersFilePath.startsWith(resolve(join(APPS_ROOT, 'storage')))) {
    throw createError({ statusCode: 403, message: 'Tentativa de acesso ilegal detectada.' });
  }

  console.log('Tentando ler usuários em:', usersFilePath);

  try {
    // Lê o arquivo JSON
    const fileContent = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(fileContent);

    // Encontra o usuário que bate com login e senha
    const user = users.find((u: any) => u.username === username && u.password === password);

    if (!user) {
      throw createError({ statusCode: 401, message: 'Usuário ou senha inválidos' });
    }

    // Geração do Token JWT
    const secret = process.env.JWT_SECRET || 'uma_chave_muito_longa_e_aleatoria_123456';
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role || 'admin',
        domain: domain 
      }, 
      secret, 
      { expiresIn: '24h' }
    );

    // Cookies de Segurança e Contexto
    setCookie(event, 'auth_token', token, {
      path: '/',
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    setCookie(event, 'cms_site_context', domain, {
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      httpOnly: false 
    });

    return { success: true, message: 'Login efetuado com sucesso' };

  } catch (err: any) {
    console.error('ERRO DETALHADO NO LOGIN:', err);
    // Se o arquivo não existir, retorna erro 401 para não vazar a infraestrutura
    throw createError({ 
      statusCode: 401, 
      message: `Credenciais inválidas ou banco não configurado.` 
    });
  }
});