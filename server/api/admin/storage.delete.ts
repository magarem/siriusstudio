import { unlink, rmdir, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { site, folder, file } = body;

  if (!site || !folder || !file) {
    throw createError({ statusCode: 400, message: 'Parâmetros ausentes' });
  }

  // Monta o caminho absoluto
  // Nota: Ajuste os '..' conforme a estrutura real do seu servidor se necessário
  const filePath = resolve(process.cwd(), '..', 'storage', site, folder, file);

  console.log("Tentando deletar:", filePath);

  try {
    // 1. Verifica o que é (Arquivo ou Pasta)
    const stats = await lstat(filePath);

    if (stats.isDirectory()) {
      // 2. Se for pasta, tenta remover com rmdir
      // O rmdir nativamente falha se a pasta tiver conteúdo
      await rmdir(filePath);
    } else {
      // 3. Se for arquivo, remove com unlink
      await unlink(filePath);
    }

    return { success: true };

  } catch (err: any) {
    // Tratamento específico para pasta não vazia
    if (err.code === 'ENOTEMPTY' || err.code === 'EEXIST') {
      throw createError({ 
        statusCode: 400, 
        message: 'A pasta não está vazia. Exclua o conteúdo primeiro.' 
      });
    }

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