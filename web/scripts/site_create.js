import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';

// =====================================================================
// CONFIGURAÇÕES
// =====================================================================
const VPS_HOST = "maga@siriusstudio.site";
const VPS_BASE_PATH = "/home/maga"; 

// Caminhos Locais Relativos
// Estrutura assumida:
// /apps/scripts (onde este arquivo roda)
// /apps/sites/[site]
// /apps/storage/[site]
// /apps/siriusstudio (Core)

const TEMPLATE_NAME = 'sirius_site_basedesigner';
const LOCAL_ROOT = path.join(process.cwd(), '..'); // /apps
const LOCAL_SITES_ROOT = path.join(LOCAL_ROOT, 'sites');
const LOCAL_STORAGE_ROOT = path.join(LOCAL_ROOT, 'storage');
const LOCAL_CORE_ROOT = path.join(LOCAL_ROOT, 'siriusstudio'); // Caminho do Core

const LOCAL_SITE_TEMPLATE = path.join(LOCAL_SITES_ROOT, TEMPLATE_NAME);
const LOCAL_STORAGE_TEMPLATE = path.join(LOCAL_STORAGE_ROOT, TEMPLATE_NAME);
// =====================================================================

const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    red: "\x1b[31m",
    dim: "\x1b[2m",
    bold: "\x1b[1m"
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

// Variáveis Globais
let siteName = process.argv[2];

// Caminhos Locais Finais
let localProjectPath = "";     // .../sites/[sitename]
let localStoragePath = "";     // .../storage/[sitename]

// Caminhos Remotos
let vpsAppsPath = `${VPS_BASE_PATH}/dev/apps`;
let vpsRepoPath = "";
let vpsStoragePath = "";
let vpsHookPath = "";
let gitRemoteUrl = "";

function run(command, cwd = process.cwd()) {
    try { execSync(command, { cwd, stdio: 'ignore' }); } catch (e) { /* ignore */ }
}

function runSSH(sshCommand) {
    execSync(`ssh ${VPS_HOST} "${sshCommand}"`, { stdio: 'inherit' });
}

async function main() {
    console.clear();
    console.log(`${C.green}${C.bold}🚀 SIRIUS STUDIO - CLI MANAGER (Linked Architecture)${C.reset}\n`);

    // 1. OBTER E CONFIRMAR NOME
    if (!siteName) {
        siteName = await ask(`${C.yellow}Digite o nome do projeto (slug): ${C.reset}`);
    }
    
    siteName = siteName.toLowerCase().replace(/\s+/g, '-');
    
    const confirm = await ask(`Confirma o nome "${C.cyan}${siteName}${C.reset}"? [Enter para Sim / n para cancelar]: `);
    if (confirm.toLowerCase() === 'n') process.exit(0);

    // Define caminhos
    localProjectPath = path.join(LOCAL_SITES_ROOT, siteName);
    localStoragePath = path.join(LOCAL_STORAGE_ROOT, siteName);
    
    vpsRepoPath = `${vpsAppsPath}/repos/${siteName}.git`;
    vpsStoragePath = `${vpsAppsPath}/storage/${siteName}`; 
    vpsHookPath = `${vpsRepoPath}/hooks/post-receive`;
    gitRemoteUrl = `ssh://${VPS_HOST}${vpsRepoPath}`;

    // 2. MENU
    console.log(`\n${C.bold}O que deseja fazer?${C.reset}`);
    console.log(`${C.cyan}[1]${C.reset} 🏠 Apenas Local (Site + Storage + Links + Install + Seed)`);
    console.log(`${C.cyan}[2]${C.reset} 🚀 Full Deploy (Local + Envia Storage + Git Push)`);
    console.log(`${C.cyan}[3]${C.reset} ☁️  Deploy Remoto (Sobe storage existente + Git Push)`);
    
    const option = await ask(`\n${C.yellow}Escolha uma opção [1-3]: ${C.reset}`);
    rl.close();

    console.log("\n---------------------------------------------------");

    switch (option.trim()) {
        case '1':
            await createLocalEnv();
            break;
        case '2':
            await createLocalEnv();
            await setupRemoteEnv();
            await pushCode();
            await refreshCaddy();
            break;
        case '3':
            await setupRemoteEnv();
            await pushCode();
            await refreshCaddy();
            break;
        default:
            console.error(`${C.red}Opção inválida.${C.reset}`);
            process.exit(1);
    }

    console.log(`\n${C.green}✨ PROCESSO FINALIZADO!${C.reset}`);
    if (option !== '1') {
        console.log(`${C.cyan}🔗 Link: https://${siteName}.siriusstudio.site${C.reset}`);
    }
}

// =====================================================================
// FUNÇÕES DE AÇÃO
// =====================================================================

async function createLocalEnv() {
    console.log(`${C.yellow}📦 [LOCAL] Preparando arquivos...${C.reset}`);

    // 1. Copia Template do SITE (SEM node_modules)
    if (fs.existsSync(localProjectPath)) {
        console.log(`${C.dim}   ℹ️  Pasta do SITE já existe.${C.reset}`);
    } else {
        // CORREÇÃO: 'node_modules' adicionado ao filtro
        fs.copySync(LOCAL_SITE_TEMPLATE, localProjectPath, {
            filter: (src) => !['node_modules', '.nuxt', 'dist', '.git', '.log', '.env', 'content', 'server'].some(el => src.includes(el))
        });
        console.log(`   ✅ Site copiado (sem dependências).`);

        // CORREÇÃO: Roda npm install
        console.log(`   📦 Instalando dependências (isso pode demorar um pouco)...`);
        try {
            execSync('npm install', { cwd: localProjectPath, stdio: 'inherit' });
            console.log(`   ✅ Dependências instaladas com sucesso.`);
        } catch (e) {
            console.error(`${C.red}   ❌ Erro ao instalar dependências. Rode 'npm install' manualmente.${C.reset}`);
        }
    }

    // 2. Copia Template do STORAGE
    if (fs.existsSync(localStoragePath)) {
        console.log(`${C.dim}   ℹ️  Pasta de STORAGE já existe.${C.reset}`);
    } else {
        if (fs.existsSync(LOCAL_STORAGE_TEMPLATE)) {
            fs.copySync(LOCAL_STORAGE_TEMPLATE, localStoragePath);
            console.log(`   ✅ Storage copiado.`);
        } else {
            fs.ensureDirSync(path.join(localStoragePath, 'content'));
            fs.ensureDirSync(path.join(localStoragePath, 'data'));
            fs.ensureDirSync(path.join(localStoragePath, 'db'));
            console.log(`   ⚠️ Template de storage não encontrado. Estrutura vazia criada.`);
        }
    }

    // 3. Atualiza _config.json
    const configPath = path.join(localStoragePath, '_config.json');
    try {
        if (fs.existsSync(configPath)) {
            const config = fs.readJsonSync(configPath);
            config.url = `http://site.localhost:3001`; 
            config.siteName = siteName;
            fs.writeJsonSync(configPath, config, { spaces: 2 });
            console.log(`   ✅ _config.json atualizado.`);
        }
    } catch (e) {
        console.error(`${C.red}   ❌ Erro ao editar _config.json: ${e.message}${C.reset}`);
    }

    // 4. Cria .env Local
    const envContent = `STORAGE_PATH=${localStoragePath}\nNUXT_SITE_NAME=${siteName}\nNUXT_SITE_ID=${siteName}\nNUXT_PUBLIC_SITE_URL=http://localhost:3001`;
    fs.writeFileSync(path.join(localProjectPath, '.env'), envContent);
    console.log(`   ✅ .env Local gerado.`);

    // =================================================================
    // 5. CRIAÇÃO DE LINKS SIMBÓLICOS
    // =================================================================
    console.log(`\n${C.yellow}🔗 [LINKS] Configurando Symlinks...${C.reset}`);
    
    const links = [
        // Storage Links (Apontam para ../storage/[site]/...)
        { dest: 'content', src: path.join(localStoragePath, 'content') },
        { dest: 'data', src: path.join(localStoragePath, 'data') },
        { dest: 'db', src: path.join(localStoragePath, 'db') },
        
        // Core Links (Apontam para ../siriusstudio/...)
        { dest: 'server', src: path.join(LOCAL_CORE_ROOT, 'server') },
        { dest: 'app/components/content', src: path.join(LOCAL_CORE_ROOT, 'app/components/content') },
    ];

    for (const link of links) {
        const destPath = path.join(localProjectPath, link.dest);
        const srcPath = link.src;

        if (!fs.existsSync(srcPath)) {
            if (srcPath.includes('storage')) {
                fs.ensureDirSync(srcPath);
                console.log(`${C.dim}      ↳ Criando pasta de origem faltante: ${path.basename(srcPath)}${C.reset}`);
            } else {
                console.warn(`${C.red}      ⚠️  ALERTA: Origem do Core não encontrada: ${srcPath}${C.reset}`);
                continue;
            }
        }

        fs.removeSync(destPath);
        fs.ensureDirSync(path.dirname(destPath));

        // Link Relativo (Importante para portabilidade)
        const relativeSrc = path.relative(path.dirname(destPath), srcPath);
        
        try {
            fs.symlinkSync(relativeSrc, destPath, 'dir'); 
            console.log(`   ✅ Link: ${link.dest} -> ${relativeSrc}`);
        } catch (e) {
            console.error(`${C.red}   ❌ Falha no link ${link.dest}: ${e.message}${C.reset}`);
        }
    }

    // =================================================================
    // 6. SEED DB (Inicializa o SQLite)
    // =================================================================
    console.log(`\n${C.yellow}🌱 [DB] Populando banco de dados...${C.reset}`);
    const seedScriptPath = path.join(process.cwd(), 'seed-db.mjs');
    
    if (fs.existsSync(seedScriptPath)) {
        try {
            execSync(`node "${seedScriptPath}" "${siteName}"`, { stdio: 'inherit' });
            console.log(`   ✅ Banco configurado.`);
        } catch (e) {
            console.error(`${C.red}   ❌ Erro no Seed: ${e.message}${C.reset}`);
        }
    } else {
        console.warn(`${C.dim}   ⚠️  Script seed-db.mjs não encontrado.${C.reset}`);
    }

    // 7. Git Init
    if (!fs.existsSync(path.join(localProjectPath, '.git'))) {
        run('git init', localProjectPath);
        run('git branch -M main', localProjectPath);
        run('git add .', localProjectPath);
        run('git commit -m "Initial commit with symlinks"', localProjectPath);
        console.log(`\n   ✅ Git inicializado.`);
    }
}

async function setupRemoteEnv() {
    console.log(`\n${C.yellow}☁️  [VPS] Configurando servidor...${C.reset}`);
    
    try {
        // 1. Criar pastas base
        console.log(`   -> Criando estrutura remota...`);
        const commands = [
            `mkdir -p "${vpsAppsPath}/repos"`,
            `mkdir -p "${vpsAppsPath}/storage"`,
            `mkdir -p "${vpsRepoPath}"`,
        ];
        for (const cmd of commands) runSSH(cmd);

        // 2. ENVIAR STORAGE (SCP)
        console.log(`   -> Uploading Storage Folder...`);
        try {
            const parentRemoteStorage = `${vpsAppsPath}/storage/`;
            execSync(`scp -r "${localStoragePath}" ${VPS_HOST}:"${parentRemoteStorage}"`, { stdio: 'inherit' });
            console.log(`   ✅ Storage enviado.`);
        } catch (e) {
            console.error(`${C.red}   ❌ Erro no upload do storage. Verifique SSH.${C.reset}`);
            throw e;
        }

        // 3. Ajustar Config Remota
        console.log(`   -> Ajustando URL no _config.json remoto...`);
        const updateJsonCmd = `node -e '
            const fs = require("fs");
            const p = "${vpsStoragePath}/_config.json";
            if(fs.existsSync(p)) {
                const c = JSON.parse(fs.readFileSync(p));
                c.url = "https://${siteName}.siriusstudio.site";
                fs.writeFileSync(p, JSON.stringify(c, null, 2));
            }
        '`;
        runSSH(updateJsonCmd);

        // 4. Git Bare & Hook
        runSSH(`git init --bare "${vpsRepoPath}"`);
        const hookCmd = `printf '#!/bin/bash\\n${vpsAppsPath}/bin/deploy-master.sh ${siteName}' > "${vpsHookPath}"`;
        runSSH(hookCmd);
        runSSH(`chmod +x "${vpsHookPath}"`);

        // 5. Env Local -> Prod
        const prodEnv = `STORAGE_PATH=${vpsStoragePath}\nSITE_NAME=${siteName}\nNUXT_PUBLIC_SITE_URL=https://${siteName}.siriusstudio.site`;
        fs.writeFileSync(path.join(localProjectPath, '.env'), prodEnv);
        console.log(`   ✅ .env de Produção configurado.`);

    } catch (e) {
        console.error(`${C.red}❌ Erro no setup remoto: ${e.message}${C.reset}`);
        process.exit(1);
    }
}

async function pushCode() {
    console.log(`\n${C.yellow}🔗 [GIT] Enviando código...${C.reset}`);
    try { run(`git remote add origin ${gitRemoteUrl}`, localProjectPath); } catch(e) {}
    run('git add .env', localProjectPath);
    try { run('git commit -m "Config: Production setup"', localProjectPath); } catch(e) {}
    try {
        execSync('git push -u origin main', { cwd: localProjectPath, stdio: 'inherit' });
    } catch(e) {
        console.error(`${C.red}❌ Erro ao fazer push.${C.reset}`);
        process.exit(1);
    }
}

async function refreshCaddy() {
    console.log(`\n${C.yellow}🔒 [CADDY] Atualizando SSL...${C.reset}`);
    try { runSSH(`node ~/dev/apps/bin/refresh-caddy.mjs`); } catch (e) {}
}

main();