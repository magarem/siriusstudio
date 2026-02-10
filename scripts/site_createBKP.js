import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const CURRENT_DIR = process.cwd();

// --- CONFIGURAÇÃO DE CAMINHOS ---
const TEMPLATE_SITE = path.join(CURRENT_DIR, '../sites/sirius_site_basedesigner'); 
const TEMPLATE_STORAGE = path.join(CURRENT_DIR, '../storage/sirius_site_basedesigner');
const SERVER_CORE = path.join(CURRENT_DIR, 'server'); 
const INFO_PATH = path.join(CURRENT_DIR, '../sites/info.json');

const TARGET_NAME = process.argv[2];

if (!TARGET_NAME) {
  console.error('❌ Erro: Forneça o nome do novo site.');
  process.exit(1);
}

const DEST_SITE = path.join(CURRENT_DIR, '../sites', TARGET_NAME);
const DEST_STORAGE = path.join(CURRENT_DIR, '../storage', TARGET_NAME);

async function generate() {
  try {
    console.log(`\n🚀 INICIANDO PROTOCOLO SIRIUS: ${TARGET_NAME}`);
    console.log('---------------------------------------------------');

    // 1. GESTÃO DE PORTA (info.json)
    console.log('📝 [1/8] Gerenciando manifesto info.json...');
    if (!await fs.pathExists(INFO_PATH)) {
      await fs.writeJson(INFO_PATH, { project: "Sirius Eco", last_port: 3000, sites: [] }, { spaces: 2 });
    }
    const infoData = await fs.readJson(INFO_PATH);
    const NEXT_PORT = infoData.last_port + 1;

    // 2. CÓPIA DE STORAGE
    console.log('🗄️  [2/8] Criando estrutura de Storage...');
    await fs.copy(TEMPLATE_STORAGE, DEST_STORAGE);
    
    const configPath = path.join(DEST_STORAGE, '_config.json');
    const storageConfig = {
      url: `http://localhost:${NEXT_PORT}/`,
      port: NEXT_PORT.toString(),
      preview: `localhost:${NEXT_PORT}`,
      urlprod: TARGET_NAME,
      dominio: `${TARGET_NAME}.siriusstudio.site`,
      name: TARGET_NAME,
      theme: "dark"
    };
    await fs.writeJson(configPath, storageConfig, { spaces: 2 });

    // 3. CÓPIA DO SITE
    console.log('🌍 [3/8] Criando estrutura do Site (Nuxt)...');
    await fs.copy(TEMPLATE_SITE, DEST_SITE, {
      filter: (src) => !['node_modules', '.git', '.nuxt', '.output', 'dist'].some(el => src.includes(el))
    });

    // 4. IDENTIDADE E .ENV
    console.log('🆔 [4/8] Configurando .env e Porta...');
    const envPath = path.join(DEST_SITE, '.env');
    const envContent = `NUXT_SITE_ID=${TARGET_NAME}\nPORT=${NEXT_PORT}\nNODE_ENV=production`;
    await fs.writeFile(envPath, envContent);

    // 5. LINKS SIMBÓLICOS
    console.log('🔗 [5/8] Criando Links Simbólicos...');
    const symlinks = [
      { link: path.join(DEST_SITE, 'content'), real: path.join(DEST_STORAGE, 'content') },
      { link: path.join(DEST_SITE, 'data'), real: path.join(DEST_STORAGE, 'data') },
      { link: path.join(DEST_SITE, 'db'), real: path.join(DEST_STORAGE, 'db') },
      { link: path.join(DEST_SITE, 'server'), real: SERVER_CORE }
    ];
    for (const { link, real } of symlinks) {
      await fs.remove(link);
      await fs.ensureSymlink(real, link);
    }

    // 6. INSTALAÇÃO E BUILD
    console.log('📦 [6/8] Instalando dependências e Buildando (Aguarde)...');
    execSync('npm install', { cwd: DEST_SITE, stdio: 'inherit' });
    execSync('npm run build', { cwd: DEST_SITE, stdio: 'inherit' });

    // 7. REGISTRO NO MANIFESTO
    console.log('💾 [7/8] Atualizando info.json...');
    infoData.sites.push({
      id: TARGET_NAME,
      port: NEXT_PORT,
      created_at: new Date().toISOString(),
      status: 'active'
    });
    infoData.last_port = NEXT_PORT;
    await fs.writeJson(INFO_PATH, infoData, { spaces: 2 });

    // ============================================================
    // PASSO 8: GERAÇÃO DO ECOSYSTEM E ATIVAÇÃO PM2
    // ============================================================
    console.log(`⚡ [8/8] Criando ecosystem.config.cjs e ativando no PM2...`);

    const pm2ProcessName = `${TARGET_NAME}:${NEXT_PORT}`;
    
    // Conteúdo do arquivo usando CommonJS (.cjs) para compatibilidade total com PM2
    const ecosystemContent = `
module.exports = {
  apps: [{
    name: "${pm2ProcessName}",
    script: "./.output/server/index.mjs",
    watch: false,
    env: {
      NODE_ENV: "production",
      PORT: ${NEXT_PORT},
      NUXT_SITE_ID: "${TARGET_NAME}"
    }
  }]
};`;

    // 1. Caminho onde o arquivo será salvo: dentro da pasta do novo site
    const ecosystemPath = path.join(DEST_SITE, 'ecosystem.config.cjs');

    // 2. Escreve o arquivo fisicamente
    await fs.writeFile(ecosystemPath, ecosystemContent);

    // 3. Comando PM2: Apontamos para o arquivo recém-criado
    // A flag --update-env garante que, se você rodar o script de novo para o mesmo site, 
    // o PM2 atualize as variáveis (como a porta) na memória.
    try {
        execSync(`pm2 start ecosystem.config.cjs --update-env`, { 
            cwd: DEST_SITE, 
            stdio: 'inherit' 
        });
        
        execSync('pm2 save');
        console.log(`\n✅ Site ativo via Ecosystem na porta: ${NEXT_PORT}`);
    } catch (pm2Err) {
        console.error('❌ Erro ao iniciar via ecosystem:', pm2Err);
    }


    console.log(`
✅ PROCESSO FINALIZADO COM SUCESSO!
---------------------------------------------
🌍 URL Local:   http://localhost:${NEXT_PORT}
🆔 Site ID:    ${TARGET_NAME}
📦 PM2 Name:   ${TARGET_NAME}
---------------------------------------------
O site já está ONLINE e monitorado pelo PM2.
    `);

  } catch (err) {
    console.error('❌ FALHA NO PROCESSO:', err);
  }
}

generate();