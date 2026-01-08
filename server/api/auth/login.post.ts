import { resolve, join } from 'node:path';

import Database from 'better-sqlite3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password, domain } = body;

  // Em vez de '..', use o caminho absoluto que você confirmou no Finder
  // Ajuste esta string para o caminho REAL no seu Mac:
  const BASE_PATH = '/Users/marceloamagalhaes/desenv/apps/storage';
  const dbPath = join(BASE_PATH, domain, 'data', 'database.sqlite');

  console.log('Tentando abrir banco em:', dbPath);

  try {
    // Usamos readonly para testar se o problema é permissão de escrita
    const db = new Database(dbPath, { verbose: console.log });
    
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
                   .get(username, password);

    db.close();

    if (!user) {
      throw createError({ statusCode: 401, message: 'Usuário ou senha inválidos' });
    }

    setCookie(event, 'cms_site_context', domain, {
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax'
    });

    return { success: true };

  } catch (err: any) {
    console.error('ERRO DETALHADO:', err);
    throw createError({ 
      statusCode: 500, 
      message: `Erro ao acessar banco em ${dbPath}: ${err.message}` 
    });
  }
});