import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs'; // Importação correta aqui

import { resolve, join } from 'node:path';

export default defineEventHandler(async (event) => {
  // 1. Pega o site do cookie ou da query
  const site = getCookie(event, 'cms_site_context');
  
  if (!site) {
    throw createError({ statusCode: 401, message: 'Contexto de site não definido' });
  }

  // 2. Lê os ficheiros do formulário (Multipart)
  const formData = await readMultipartFormData(event);
  
  if (!formData) {
    throw createError({ statusCode: 400, message: 'Nenhum ficheiro enviado' });
  }

  const APPS_ROOT = resolve(process.cwd(), '..');
  const uploadDir = join(APPS_ROOT, 'storage', site, 'images');

  // Garante que a pasta de imagens existe
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];

  for (const file of formData) {
    if (file.filename) {
      // Caminho final do ficheiro
      const filePath = join(uploadDir, file.filename);
      await writeFile(filePath, file.data);
      results.push({ name: file.filename, status: 'success' });
    }
  }

  return { success: true, files: results };
});