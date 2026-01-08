import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

export default defineEventHandler(async (event) => {
  const method = event.method;
  const query = getQuery(event);
  const body = method === 'POST' ? await readBody(event) : null;

  // Configuração de caminhos baseada no seu PWD: /apps/siriusstudio
  const APPS_ROOT = resolve(process.cwd(), '..');
  
  const site = (query.site || body?.site) as string;
  const folder = (query.folder || body?.folder) as string; // 'content', 'layouts', 'pages', etc.
  const filename = (query.file || body?.file) as string;

  if (!site || !folder) {
    throw createError({ statusCode: 400, statusMessage: 'Site e Folder são obrigatórios.' });
  }

  const targetPath = join(APPS_ROOT, 'storage', site, folder);

  // --- OPERAÇÃO: LISTAR ARQUIVOS (GET sem filename) ---
  if (method === 'GET' && !filename) {
    try {
      if (!existsSync(targetPath)) return [];
      return readdirSync(targetPath).map(file => ({
        name: file,
        ext: extname(file),
        size: 'N/A' // Opcional: adicionar stats de tamanho aqui
      }));
    } catch (e) {
      throw createError({ statusCode: 500, statusMessage: 'Erro ao listar diretório.' });
    }
  }

  // --- OPERAÇÃO: LER CONTEÚDO (GET com filename) ---
  if (method === 'GET' && filename) {
    const filePath = join(targetPath, filename);
    if (!existsSync(filePath)) throw createError({ statusCode: 404, statusMessage: 'Arquivo não encontrado.' });
    
    const content = readFileSync(filePath, 'utf-8');
    return { content };
  }

  // --- OPERAÇÃO: SALVAR CONTEÚDO (POST) ---
  if (method === 'POST') {
    const filePath = join(targetPath, filename);
    const content = body.content;

    try {
      writeFileSync(filePath, content, 'utf-8');
      
      // AQUI: Você pode usar o better-sqlite3 para logar:
      // db.prepare('INSERT INTO activity_log ...').run(...)
      
      return { success: true, message: 'Arquivo salvo com sucesso!' };
    } catch (e) {
      throw createError({ statusCode: 500, statusMessage: 'Erro ao salvar arquivo.' });
    }
  }
});