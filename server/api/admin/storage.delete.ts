import { unlink, rm, lstat } from 'node:fs/promises'; // Troquei rmdir por rm
import { resolve } from 'node:path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { site, folder, file } = body;

  if (!site || !folder || !file) {
    throw createError({ statusCode: 400, message: 'Parâmetros ausentes' });
  }

  // Monta o caminho absoluto
  const filePath = resolve(process.cwd(), '..', 'storage', site, folder, file);

  console.log("Tentando deletar:", filePath);

  try {
    // 1. Verifica o que é (Arquivo ou Pasta)
    const stats = await lstat(filePath);

    if (stats.isDirectory()) {
      // 2. MUDANÇA AQUI: Usa 'rm' com recursive: true
      // Isso apaga a pasta e TUDO que tem dentro dela
      await rm(filePath, { recursive: true, force: true });
    } else {
      // 3. Se for arquivo, remove com unlink
      await unlink(filePath);
    }

    return { success: true };

  } catch (err: any) {
    // Removi o bloco do 'ENOTEMPTY' pois agora ele força a exclusão

    // Tratamento para arquivo não encontrado
    if (err.code === 'ENOENT') {
      throw createError({ 
        statusCode: 404, 
        message: 'Arquivo ou pasta não encontrado.' 
      });
    }

    // Outros erros
    throw createError({ 
      statusCode: 500, 
      message: 'Erro ao deletar: ' + err.message 
    });
  }
});