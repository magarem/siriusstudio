import { unlink, rm, lstat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { site, folder, file } = body;

  if (!site || !folder || !file) {
    throw createError({ statusCode: 400, message: 'Parâmetros ausentes' });
  }

  // --- CORREÇÃO DO CAMINHO (Docker Friendly) ---
  // 1. Define a raiz (usa /app no Docker ou volta um nível no Local)
  const appRoot = process.env.APPS_ROOT || resolve(process.cwd(), '..');
  
  // 2. Define a raiz do storage
  const storageRoot = join(appRoot, 'storage');

  // 3. Monta o caminho final do arquivo
  // Nota: 'folder' geralmente já vem como "content/blog", então o resolve junta tudo corretamente
  const filePath = resolve(storageRoot, site, folder, file);

  // LOG DE DEBUG (Útil para ver no container se o caminho está certo)
  // console.log("Tentando deletar:", filePath);

  // SEGURANÇA: Previne Path Traversal (impedir deletar coisas fora do storage)
  if (!filePath.startsWith(storageRoot)) {
    throw createError({ statusCode: 403, message: 'Acesso negado: Caminho inválido.' });
  }

  try {
    // 1. Verifica o status (se existe e o que é)
    const stats = await lstat(filePath);

    if (stats.isDirectory()) {
      // 2. Se for PASTA, usa rm recursivo
      await rm(filePath, { recursive: true, force: true });
    } else {
      // 3. Se for ARQUIVO, usa unlink
      await unlink(filePath);
    }

    return { success: true };

  } catch (err: any) {
    // Tratamento para arquivo não encontrado (ENOENT)
    if (err.code === 'ENOENT') {
      // Se não achou, tecnicamente já está "deletado", então podemos retornar sucesso 
      // ou lançar erro 404 dependendo da sua preferência. 
      // Geralmente lançar 404 ajuda a debugar.
      throw createError({ 
        statusCode: 404, 
        message: 'Arquivo ou pasta não encontrado no disco.' 
      });
    }

    // Outros erros
    console.error("Erro ao deletar:", err);
    throw createError({ 
      statusCode: 500, 
      message: 'Erro ao deletar: ' + err.message 
    });
  }
});