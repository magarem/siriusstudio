import { exec } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

// Helper para transformar exec em Promise
const runCommand = (command: string, cwd?: string) => {
  return new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const site = body.site; // Ex: 'indiasagrada'

  if (!site) {
    throw createError({ statusCode: 400, message: 'Site não informado.' });
  }

  // 1. Resolve caminhos
  const siteDir = path.join(config.storagePath, 'sites', site);
  if (!fs.existsSync(siteDir)) {
    throw createError({ statusCode: 404, message: `Diretório não encontrado: ${siteDir}` });
  }

  try {
    const logs = [];

    // --- PASSO 1: BUILD ---
    console.log(`[irk:build] Iniciando build de ${site}...`);
    const buildResult = await runCommand(`npm run build`, siteDir);
    logs.push(buildResult.stdout);

    // --- PASSO 2: PM2 RESTART ---
    // Reinicia o processo que tem o mesmo nome do ID do site
    console.log(`[irk:restart] Reiniciando processo PM2: ${site}...`);
    
    // --update-env garante que novas variaveis de ambiente sejam carregadas se houver
    const restartResult = await runCommand(`pm2 restart ${site} --update-env`);
    logs.push(restartResult.stdout);

    return { 
      success: true, 
      message: 'Site compilado e reiniciado com sucesso!', 
      logs: logs.join('\n\n--- PM2 LOGS ---\n\n') 
    };

  } catch (err: any) {
    console.error(`[irk:error]`, err);
    
    // Tratamento específico: Se o PM2 falhar (ex: processo não existe)
    // Retornamos o erro, mas avisamos que o Build pode ter funcionado
    const errorMessage = err.stderr || err.message || 'Erro desconhecido';
    
    throw createError({ 
      statusCode: 500, 
      message: errorMessage.includes('process or namespace not found') 
        ? 'Build ok, mas processo PM2 não encontrado. O site está rodando?' 
        : 'Falha no processo de publicação.',
      data: { error: errorMessage }
    });
  }
});