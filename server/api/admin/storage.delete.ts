import { unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { site, folder, file } = body;

  if (!site || !folder || !file) {
    throw createError({ statusCode: 400, message: 'Parâmetros ausentes' });
  }

  const APPS_ROOT = resolve(process.cwd(), '..');
  const filePath = join(APPS_ROOT, 'storage', site, folder, file);

  try {
    await unlink(filePath);
    return { success: true };
  } catch (err: any) {
    throw createError({ statusCode: 500, message: 'Erro ao deletar: ' + err.message });
  }
});