import { exec } from 'node:child_process';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { path, site } = body;

  if (!path) {
    throw createError({ statusCode: 400, message: 'Caminho do arquivo é obrigatório' });
  }

  // 1. Constrói o caminho absoluto baseado na sua estrutura de storage
  // Ajuste o 'storage' abaixo se sua pasta raiz de conteúdo tiver outro nome
  const cwd = process.cwd();
  
  // Lógica: Se o path já vier completo ou relativo, tentamos resolver
  // Assumindo que seus arquivos estão em: /seu-projeto/storage/NOME-DO-SITE/content/...
  let fullPath = '';

  if (site) {
      fullPath = resolve(cwd, 'storage', site, path);
  } else {
      fullPath = resolve(cwd, path);
  }

  // 2. Segurança básica: Verifica se o arquivo existe antes de tentar abrir
  if (!existsSync(fullPath)) {
     // Tenta verificar se é apenas o nome do arquivo na raiz do content
     // Às vezes o frontend manda só "index.md"
     fullPath = resolve(cwd, 'storage', site, 'content', path);
     
     if (!existsSync(fullPath)) {
        throw createError({ statusCode: 404, message: 'Arquivo não encontrado no disco.' });
     }
  }

  // 3. Executa o comando "code" (VS Code) no terminal do servidor
  // O comando 'code -r' abre no arquivo na janela atual (reuse)
  exec(`code -r "${fullPath}"`, (error) => {
    if (error) {
      console.error('Erro ao abrir editor:', error);
      // Se falhar o 'code', tenta o comando padrão do sistema (opcional)
      // exec(`open "${fullPath}"`); // Mac
      // exec(`start "${fullPath}"`); // Windows
    }
  });

  return { success: true, opened: fullPath };
});