import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const INFO_PATH = path.join(process.cwd(), '../sites/info.json');

async function listSites() {
  try {
    if (!await fs.pathExists(INFO_PATH)) {
      console.log('⚠️  Manifesto info.json não encontrado.');
      return;
    }

    const infoData = await fs.readJson(INFO_PATH);
    
    // Pegamos a lista de processos do PM2 em formato JSON para comparar
    let pm2List = [];
    try {
      const stdout = execSync('pm2 jlist', { encoding: 'utf8' });
      pm2List = JSON.parse(stdout);
    } catch (e) {
      console.warn('⚠️  Não foi possível conectar ao PM2.');
    }

    console.log('\n🛰️  SIRIUS ECOSYSTEM - SITES ATIVOS');
    console.log('='.repeat(70));
    console.log(`${'ID / NOME'.padEnd(25)} | ${'PORTA'.padEnd(8)} | ${'STATUS PM2'.padEnd(12)} | ${'CRIADO EM'}`);
    console.log('-'.repeat(70));

    infoData.sites.forEach(site => {
      // Procura o site no PM2 (pelo nome que agora inclui a porta ou só ID)
      const pm2Process = pm2List.find(p => p.name.startsWith(site.id));
      const status = pm2Process ? pm2Process.pm2_env.status.toUpperCase() : 'OFFLINE';
      
      // Formata a data para algo legível
      const date = new Date(site.created_at).toLocaleDateString('pt-BR');

      // Cores básicas no terminal (opcional)
      const statusColor = status === 'ONLINE' ? '\x1b[32m' : '\x1b[31m';
      const resetColor = '\x1b[0m';

      console.log(
        `${site.id.padEnd(25)} | ` +
        `${site.port.toString().padEnd(8)} | ` +
        `${statusColor}${status.padEnd(12)}${resetColor} | ` +
        `${date}`
      );
    });

    console.log('='.repeat(70));
    console.log(`Total de sites: ${infoData.sites.length} | Última porta: ${infoData.last_port}\n`);

  } catch (err) {
    console.error('❌ Erro ao listar sites:', err);
  }
}

listSites();