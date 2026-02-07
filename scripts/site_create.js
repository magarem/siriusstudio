import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURAÇÃO DE AMBIENTE ---
const CURRENT_DIR = process.cwd();

// 1. Origens (Templates)
const TEMPLATE_SITE = path.join(CURRENT_DIR, '../sites/sirius_site_basedesigner'); 
const TEMPLATE_STORAGE = path.join(CURRENT_DIR, '../storage/sirius_site_basedesigner');
const SERVER_CORE = path.join(CURRENT_DIR, 'server'); // Origem do Server Compartilhado

// 2. Argumento (Nome do Site)
const TARGET_NAME = process.argv[2];

if (!TARGET_NAME) {
  console.error('❌ Erro: Forneça o nome do novo site (ex: node sirius.js cliente-cafe).');
  process.exit(1);
}

// 3. Destinos (Onde os arquivos serão criados)
const DEST_SITE = path.join(CURRENT_DIR, '../sites', TARGET_NAME);
const DEST_STORAGE = path.join(CURRENT_DIR, '../storage', TARGET_NAME);

async function generate() {
  try {
    console.log(`\n🚀 INICIANDO PROTOCOLO SIRIUS: ${TARGET_NAME}`);
    console.log('---------------------------------------------------');

    // ============================================================
    // PASSO 1: Copiar Storage (Dados)
    // ============================================================
    if (await fs.pathExists(TEMPLATE_STORAGE)) {
      console.log('🗄️  [1/6] Criando estrutura de Storage...');
      await fs.copy(TEMPLATE_STORAGE, DEST_STORAGE);

      // Configurar _config.json
      console.log('⚙️  [1.1/6] Ajustando configurações JSON...');
      const configPath = path.join(DEST_STORAGE, '_config.json');
      
      let storageConfig = {};
      if (await fs.pathExists(configPath)) {
        storageConfig = await fs.readJson(configPath);
      }

      // Regras de negócio solicitadas
      storageConfig = {
        ...storageConfig,
        url: "http://localhost:3001/",
        port: "3001",
        preview: "localhost:3001",
        urlprod: TARGET_NAME,
        dominio: TARGET_NAME,
        name: TARGET_NAME,
        theme: "dark"
      };

      await fs.writeJson(configPath, storageConfig, { spaces: 2 });
    } else {
      throw new Error(`Template de Storage não encontrado em: ${TEMPLATE_STORAGE}`);
    }

    // ============================================================
    // PASSO 2: Copiar Site (Front-end)
    // ============================================================
    if (await fs.pathExists(TEMPLATE_SITE)) {
      console.log('🌍 [2/6] Criando estrutura do Site (Nuxt)...');
      await fs.copy(TEMPLATE_SITE, DEST_SITE, {
        filter: (src) => {
          const ignore = ['node_modules', '.git', '.nuxt', '.output', 'dist'];
          return !ignore.some(el => src.includes(el));
        }
      });
    } else {
      throw new Error(`Template do Site não encontrado em: ${TEMPLATE_SITE}`);
    }

    // ============================================================
    // PASSO 3: Identidade do Projeto (package.json & .env)
    // ============================================================
    console.log('📝 [3/6] Atualizando identidade (package.json e .env)...');
    
    // package.json
    const pkgPath = path.join(DEST_SITE, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      pkg.name = TARGET_NAME;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    // .env
    const envPath = path.join(DEST_SITE, '.env');
    const envExamplePath = path.join(DEST_SITE, '.env.example');
    let envContent = '';
    
    if (await fs.pathExists(envPath)) envContent = await fs.readFile(envPath, 'utf-8');
    else if (await fs.pathExists(envExamplePath)) envContent = await fs.readFile(envExamplePath, 'utf-8');

    if (envContent.includes('NUXT_SITE_ID=')) {
      envContent = envContent.replace(/NUXT_SITE_ID=.*/, `NUXT_SITE_ID=${TARGET_NAME}`);
    } else {
      envContent += `\nNUXT_SITE_ID=${TARGET_NAME}`;
    }
    await fs.writeFile(envPath, envContent.trim() + '\n');

    // ============================================================
    // PASSO 4: Links Simbólicos (A Mágica da Estrutura)
    // ============================================================
    console.log('🔗 [4/6] Criando Links Simbólicos...');

    // Lista de links para criar: { link: Onde vai ficar o atalho, real: Onde está o arquivo }
    const symlinks = [
      { 
        link: path.join(DEST_SITE, 'content'), 
        real: path.join(DEST_STORAGE, 'content') 
      },
      { 
        link: path.join(DEST_SITE, 'data'), 
        real: path.join(DEST_STORAGE, 'data') 
      },
      { 
        link: path.join(DEST_SITE, 'db'), 
        real: path.join(DEST_STORAGE, 'db') 
      },
      { 
        link: path.join(DEST_SITE, 'server'), 
        real: SERVER_CORE 
      }
    ];

    for (const { link, real } of symlinks) {
      // 1. Remove a pasta física se ela veio do template (senão o symlink falha)
      await fs.remove(link);
      
      // 2. Verifica se o destino real existe antes de linkar
      if (await fs.pathExists(real)) {
        // 3. Cria o link (type: 'junction' é melhor para Windows, 'dir' para Unix)
        // ensureSymlink cuida disso automaticamente na maioria dos casos
        await fs.ensureSymlink(real, link);
        console.log(`   ✔️  Link criado: /sites/.../${path.basename(link)} -> .../${path.basename(real)}`);
      } else {
        console.warn(`   ⚠️  Alerta: Destino real não existe: ${real}`);
      }
    }

    // ============================================================
    // PASSO 5: Instalação e Git
    // ============================================================
    console.log('🔧 [5/6] Inicializando Git...');
    execSync('git init', { cwd: DEST_SITE });

    console.log('📦 [6/6] Instalando dependências (npm install)...');
    execSync('npm install', { cwd: DEST_SITE, stdio: 'inherit' });

    console.log(`
✅ SITE "${TARGET_NAME}" PRONTO!
---------------------------------------------
🌍 App Local:   apps/sites/${TARGET_NAME}
🗄️  Storage:     apps/storage/${TARGET_NAME}
🔗 Server Link: apps/siriusstudio/server (Compartilhado)
---------------------------------------------
Para iniciar:
> cd apps/sites/${TARGET_NAME}
> code .
> npm run dev
    `);

  } catch (err) {
    console.error('❌ FALHA CRÍTICA:', err);
  }
}

generate();