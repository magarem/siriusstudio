import { exec } from 'node:child_process';
import { rm, access } from 'node:fs/promises'; // Usaremos FS nativo
import path from 'node:path';

// CONFIGURAÇÃO DOS CAMINHOS
const SITES_ROOT = '/Users/marceloamagalhaes/desenv/apps/sites';

// Helper para rodar o PM2
const runCommand = (command: string) => {
  return new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const site = body.site; // ex: 'novagokula'

  if (!site || !/^[a-zA-Z0-9-_]+$/.test(site)) {
    throw createError({ statusCode: 400, message: 'ID do site inválido.' });
  }

  // 1. Define os alvos para destruição
  const sitePath = path.join(SITES_ROOT, site);
  
  // Alvo A: Cache de Resposta (ISR) - Onde fica o HTML/JSON velho
  const nitroCache = path.join(sitePath, '.output', 'server', 'cache');
  
  // Alvo B: Cache interno do Nitro (se existir)
  const tempCache = path.join(sitePath, '.nitro', 'cache');

  const logs: string[] = [];

  try {
    // 2. Apaga o Cache do Nitro (ISR)
    try {
      await access(nitroCache); // Verifica se existe
      await rm(nitroCache, { recursive: true, force: true });
      logs.push(`✅ Cache deletado: ${nitroCache}`);
    } catch (e) {
      logs.push(`ℹ️ Cache não encontrado ou já limpo: ${nitroCache}`);
    }

    // 3. Apaga Cache Temporário (se houver)
    try {
      await access(tempCache);
      await rm(tempCache, { recursive: true, force: true });
      logs.push(`✅ Temp deletado: ${tempCache}`);
    } catch (e) {
      // Ignora se não existir
    }

    // 4. Reinicia o PM2 (Limpa memória RAM)
    logs.push(`🔄 Reiniciando PM2 para: ${site}...`);
    // update-env garante que ele pegue variáveis novas se houver
    await runCommand(`pm2 reload ${site} --update-env`);
    logs.push(`✅ Processo ${site} reiniciado com sucesso.`);

    return { 
      success: true, 
      message: 'Limpeza completa realizada.',
      details: logs 
    };

  } catch (err: any) {
    console.error(`[irk:error] Falha fatal no publish:`, err);
    throw createError({ 
      statusCode: 500, 
      message: 'Erro crítico ao limpar cache.',
      data: { error: err.message, logs }
    });
  }
});