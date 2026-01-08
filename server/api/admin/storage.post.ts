import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { site, folder, file, content } = body;

  // Validação básica
  if (!site || !folder || !file) {
    throw createError({
      statusCode: 400,
      message: 'Parâmetros site, folder e file são obrigatórios.',
    });
  }

  const APPS_ROOT = resolve(process.cwd(), '..');
  
  // O segredo está aqui: o join vai montar 'storage/novagokula/content/pousadas/nome.md'
  const targetPath = join(APPS_ROOT, 'storage', site, folder, file);

  try {
    // Garantir que a pasta existe (caso cries um ficheiro numa subpasta nova)
    const targetDir = dirname(targetPath);
    mkdirSync(targetDir, { recursive: true });

    // Grava o conteúdo no disco
    writeFileSync(targetPath, content || '', 'utf-8');

    return { success: true, path: targetPath };
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao salvar o ficheiro: ' + err.message,
    });
  }
});