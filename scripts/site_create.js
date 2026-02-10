import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

// =====================================================================
// CONFIGURAÇÕES
// =====================================================================
const VPS_HOST = "maga@siriusstudio.site";
const VPS_BASE_PATH = "/home/maga"; 
const LOCAL_TEMPLATE_PATH = path.join(process.cwd(), '..', 'sites', 'sirius_site_basedesigner'); 
// =====================================================================

const siteName = process.argv[2];

const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    red: "\x1b[31m",
};

if (!siteName) {
  console.error(`${C.red}❌ Erro: Forneça o nome do novo projeto.${C.reset}`);
  process.exit(1);
}

const localProjectPath = path.join(process.cwd(), '..', 'sites', siteName);
const vpsAppsPath = `${VPS_BASE_PATH}/dev/apps`;
const vpsRepoPath = `${vpsAppsPath}/repos/${siteName}.git`;
const vpsStoragePath = `${vpsAppsPath}/storage/${siteName}`;
const vpsHookPath = `${vpsRepoPath}/hooks/post-receive`;
const gitRemoteUrl = `ssh://${VPS_HOST}${vpsRepoPath}`;

function run(command, cwd = process.cwd()) {
    try {
        execSync(command, { cwd, stdio: 'inherit' });
    } catch (error) {
        process.exit(1);
    }
}

function runSSH(sshCommand) {
    execSync(`ssh ${VPS_HOST} "${sshCommand}"`, { stdio: 'inherit' });
}

async function main() {
    console.log(`\n${C.green}🚀 TURBO CREATE: ${siteName.toUpperCase()}${C.reset}`);

    // --- FASE 1: CÓPIA ULTRA RÁPIDA ---
    console.log(`\n${C.yellow}📦 [1/4] Preparando cópia local...${C.reset}`);

    if (fs.existsSync(localProjectPath)) {
        console.error(`${C.red}❌ A pasta já existe.${C.reset}`);
        process.exit(1);
    }

    // Copia apenas o código fonte, ignorando TUDO que for pesado
    fs.copySync(LOCAL_TEMPLATE_PATH, localProjectPath, {
        filter: (src) => !['node_modules', '.nuxt', '.output', 'dist', '.git', '.log'].some(el => src.includes(el))
    });

    run('git init', localProjectPath);
    run('git branch -M main', localProjectPath);
    run('git add .', localProjectPath);
    run('git commit -m "Turbo deploy initial"', localProjectPath);

    
    
    // --- FASE 2: SETUP REMOTO (Versão Tanque) ---
    console.log(`\n${C.yellow}☁️  [2/4] Setup robusto no VPS...${C.reset}`);
    
    // Usamos comandos individuais para identificar exatamente onde para
    try {
        console.log("   -> Criando diretórios...");
        runSSH(`mkdir -p "${vpsRepoPath}" "${vpsStoragePath}"`);
        
        console.log("   -> Inicializando Git Bare...");
        runSSH(`git init --bare "${vpsRepoPath}"`);
        
        console.log("   -> Instalando Hook...");
        // Usamos aspas simples no printf para evitar que o Bash tente interpretar o $1 do script
        const hookCmd = `printf '#!/bin/bash\\n${vpsAppsPath}/bin/deploy-master.sh ${siteName}' > "${vpsHookPath}"`;
        runSSH(hookCmd);
        
        console.log("   -> Ativando permissões do Hook...");
        runSSH(`chmod +x "${vpsHookPath}"`);
        
    } catch (e) {
        console.error(`${C.red}❌ Falha no setup remoto.${C.reset}`);
        console.error(`${C.red}Dica: Tente rodar 'rm -rf ${vpsRepoPath}' no servidor e tente de novo.${C.reset}`);
        process.exit(1);
    }





    // --- FASE 3: DEPLOY ACELERADO ---
    console.log(`\n${C.yellow}🔗 [3/4] Enviando código...${C.reset}`);
    run(`git remote add origin ${gitRemoteUrl}`, localProjectPath);
    
    // O tempo aqui vai depender do seu deploy-master.sh usar o cache de node_modules
    run('git push -u origin main', localProjectPath);

    // --- FASE 4: FINALIZAÇÃO ---
    console.log(`\n${C.yellow}🔒 [4/4] Ativando SSL e Rotas...${C.reset}`);
    
    try {
        runSSH(`node ~/dev/apps/bin/refresh-caddy.mjs`);
        console.log(`${C.green}✅ Caddy ok!${C.reset}`);
    } catch (e) {
        console.error(`${C.red}⚠️ Erro Caddy.${C.reset}`);
    }

    console.log(`\n${C.green}✨ PROJETO NO AR: https://${siteName}.siriusstudio.site${C.reset}\n`);
}

main().catch(err => {
    process.exit(1);
});