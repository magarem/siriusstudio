import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, extname, normalize } from 'node:path';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const { site, file } = query;

  if (!site || !file) {
    throw createError({ statusCode: 400, statusMessage: 'Parâmetros ausentes' });
  }

  // 1. Define a raiz do armazenamento (igual aos outros endpoints)
  const APPS_ROOT = config.storagePath 
    ? resolve(config.storagePath) 
    : process.cwd();

  // 2. Define a raiz do Site
  const siteRoot = join(APPS_ROOT, 'storage', String(site));

  // 3. Limpa o caminho do arquivo recebido
  // Remove barras iniciais e previne navegação maliciosa (../)
  let cleanFile = String(file).replace(/^\/+/, '').replace(/\.\.\//g, '');
  
  // Opcional: Se o frontend mandar "routes/assets/...", limpamos para pegar o caminho físico
  if (cleanFile.startsWith('routes/assets/')) {
      cleanFile = cleanFile.replace('routes/assets/', 'content/');
  }

  // 4. Monta o caminho absoluto
  // A diferença principal: removemos o hardcode 'images' do join
  const filePath = resolve(siteRoot, cleanFile);

  // 5. Segurança: Garante que o arquivo ainda está dentro da pasta do site (Jail)
  if (!filePath.startsWith(siteRoot)) {
      throw createError({ statusCode: 403, statusMessage: 'Acesso negado: Caminho inválido.' });
  }

  console.log('Renderizando imagem:', filePath);

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw createError({ statusCode: 404, statusMessage: 'Imagem não encontrada' });
  }

  // 6. Define o Mime Type
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp'
  };

  setResponseHeader(event, 'Content-Type', mimeTypes[ext] || 'application/octet-stream');
  
  // Cache Control para performance no editor (Opcional)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600');

  return readFileSync(filePath);
});