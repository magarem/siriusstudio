import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { site, file } = query;

  if (!site || !file) {
    throw createError({ statusCode: 400, statusMessage: 'Parâmetros ausentes' });
  }

  // Caminho absoluto para a pasta de imagens no storage
  const APPS_ROOT = resolve(process.cwd(), '..');
  const filePath = join(APPS_ROOT, 'storage', site as string, 'images', file as string);

  console.log('Buscando imagem em:', filePath);
  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Imagem não encontrada' });
  }

  // Detectar a extensão para definir o Content-Type (png, jpg, webp, etc)
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };

  setResponseHeader(event, 'Content-Type', mimeTypes[ext] || 'application/octet-stream');
  
  // Retorna o buffer da imagem
  return readFileSync(filePath);
});