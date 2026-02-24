#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';

// =============================================================================
// CONFIGURAÇÕES GLOBAIS & CAMINHOS (ABS)
// =============================================================================
const APPS_ROOT = '/home/maga/dev/apps'; 

const PATHS = {
    sites: path.join(APPS_ROOT, 'sites'),
    storage: path.join(APPS_ROOT, 'storage'),
    repos: path.join(APPS_ROOT, 'repos'),
    caddy_sites: path.join(APPS_ROOT, 'caddy', 'sites'),
    template_site: path.join(APPS_ROOT, 'sites', 'template_0'),
    template_storage: path.join(APPS_ROOT, 'storage', 'template_0'),
    info_json: path.join(APPS_ROOT, 'sites', 'info.json'),
    core_server: path.join(APPS_ROOT, 'siriusstudio', 'server'),
    core_components: path.join(APPS_ROOT, 'siriusstudio', 'app', 'components', 'content')
};

const C = {
    reset: "\x1b[0m", green: "\x1b[32m", yellow: "\x1b[33m", 
    blue: "\x1b[34m", red: "\x1b[31m", cyan: "\x1b[36m", dim: "\x1b[2m"
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

// =============================================================================
// HELPER: CADDY RELOAD (Blindado com cwd)
// =============================================================================
function reloadCaddy() {
    console.log('🔄 Atualizando Caddy Server...');
    try {
        execSync('sudo systemctl reload caddy', { stdio: 'inherit', timeout: 15000, cwd: APPS_ROOT }); 
        console.log(`${C.green}   ✅ Caddy atualizado com sucesso.${C.reset}`);
    } catch (e) {
        console.log(`${C.yellow}   ⚠️  Falha ao recarregar Caddy. Verifique logs: journalctl -u caddy -n 20${C.reset}`);
    }
}

// =============================================================================
// MOTOR PRINCIPAL
// =============================================================================
async function main() {
    console.clear();
    console.log(`${C.green}╔════════════════════════════════════════════════════╗`);
    console.log(`║        🌟 SIRIUS STUDIO ECOSYSTEM MANAGER          ║`);
    console.log(`╚════════════════════════════════════════════════════╝${C.reset}\n`);

    console.log(`${C.cyan}1.${C.reset} Criar novo site (Zero-Build + Bun Install)`);
    console.log(`${C.cyan}2.${C.reset} Listar sites ativos`);
    console.log(`${C.cyan}3.${C.reset} Mudar nome de um projeto`);
    console.log(`${C.cyan}4.${C.reset} Pausar/Retomar projeto`);
    console.log(`${C.cyan}5.${C.reset} Excluir projeto (Danger Zone)`);
    console.log(`${C.cyan}0.${C.reset} Sair`);

    const option = await ask(`\n${C.yellow}Escolha uma opção: ${C.reset}`);

    try {
        switch (option.trim()) {
            case '1': await createSite(); break;
            case '2': await listSites(); break;
            case '3': await renameSite(); break;
            case '4': await toggleStatus(); break;
            case '5': await deleteSite(); break;
            case '0': process.exit(0);
            default: console.log("Opção inválida.");
        }
    } catch (error) {
        console.error(`${C.red}\n❌ ERRO CRÍTICO:${C.reset}`, error.message);
    }

    console.log(`\n${C.dim}Pressione Enter para voltar ao menu...${C.reset}`);
    await ask('');
    main();
}

async function createSite() {
    console.log(`\n${C.blue}--- CRIAR NOVO PROJETO ---${C.reset}`);
    let targetName = await ask("Nome do projeto (ex: cliente-a): ");
    targetName = targetName.toLowerCase().replace(/\s+/g, '-');
    if (!targetName) return;

    const destSite = path.join(PATHS.sites, targetName);
    const destStorage = path.join(PATHS.storage, targetName);
    const destRepo = path.join(PATHS.repos, `${targetName}.git`);

    if (fs.existsSync(destSite)) throw new Error(`O site '${targetName}' já existe.`);

    // 0. Validação da Fonte (Skeleton)
    const templateOutput = path.join(PATHS.template_site, '.output');
    if (!fs.existsSync(templateOutput)) {
        throw new Error(`⚠️ A pasta .output não foi encontrada em ${PATHS.template_site}. Rode o build no template_0 primeiro!`);
    }

    // 1. Porta e Info
    const infoData = await fs.readJson(PATHS.info_json);
    const NEXT_PORT = Math.max(infoData.last_port, 4000) + 1;
    const DOMAIN = `${targetName}.siriusstudio.site`;

    // 2. Configurando Storage
    console.log('🗄️  Configurando Storage...');
    if (fs.existsSync(PATHS.template_storage)) {
        await fs.copy(PATHS.template_storage, destStorage);
    } else {
        await fs.ensureDir(path.join(destStorage, 'db'));
    }
    await fs.writeJson(path.join(destStorage, '_config.json'), { url: `https://${DOMAIN}`, port: NEXT_PORT.toString(), name: targetName }, { spaces: 2 });

    // 3. Preparando Área de Produção (Cópia Otimizada)
    console.log('⚡ Copiando arquivos do template (otimizado)...');
    await fs.copy(PATHS.template_site, destSite, {
        filter: (src) => {
            const basename = path.basename(src);
            // Ignora o repositório original e o node_modules (o Bun vai recriar!)
            if (basename === '.git' || basename === 'node_modules') return false; 
            return true;
        }
    });

    // 4. Criando Links Simbólicos (Sobrescrevendo as pastas base copiadas)
    console.log('🔗 Configurando Links Simbólicos (Storage e Core)...');
    const siteLinks = [
        // Links de Dados (Individuais do Cliente)
        { dest: path.join(destSite, 'content'), src: path.join(destStorage, 'content') },
        { dest: path.join(destSite, 'db'), src: path.join(destStorage, 'db') },
        { dest: path.join(destSite, 'data'), src: path.join(destStorage, 'data') },
        
        // Links Estruturais (Reaproveitados do Core)
        { dest: path.join(destSite, 'server'), src: PATHS.core_server },
        { dest: path.join(destSite, 'app', 'components', 'content'), src: PATHS.core_components }
    ];

    for (const link of siteLinks) {
        // Remove a pasta/arquivo se o fs.copy tiver trazido do template_0
        if (fs.existsSync(link.dest)) await fs.remove(link.dest);
        
        if (fs.existsSync(link.src)) {
            // Garante que o diretório pai existe (útil para app/components/content)
            await fs.ensureDir(path.dirname(link.dest));
            await fs.ensureSymlink(link.src, link.dest);
        } else {
            console.warn(`${C.yellow}   ⚠️  Aviso: Fonte não encontrada para link: ${link.src}${C.reset}`);
        }
    }

    // 5. Variáveis de Ambiente e Configuração PM2
    console.log('📝 Gerando Configurações Locais...');
    const envContent = `NUXT_SITE_ID=${targetName}
NUXT_PORT=${NEXT_PORT}
NUXT_NODE_ENV=production
NUXT_PUBLIC_SITE_URL=https://${DOMAIN}
NUXT_JWT_SECRET=uma_chave_muito_longa_e_aleatoria_123456
NUXT_SIRIUS_URL="https://siriusstudio.site"
NUXT_STORAGE_PATH=${APPS_ROOT}`;
    await fs.writeFile(path.join(destSite, '.env'), envContent);

    const eco = `module.exports = { 
  apps: [{ 
    name: "${targetName}:${NEXT_PORT}", 
    script: "bun ./.output/server/index.mjs", 
    cwd: "${destSite}", 
    env: { 
      NODE_ENV: "production", 
      PORT: ${NEXT_PORT}, 
      NUXT_SITE_ID: "${targetName}" 
    } 
  }] 
};`;
    await fs.writeFile(path.join(destSite, 'ecosystem.config.cjs'), eco);

    // 6. Dependências (A Mágica do Bun)
    console.log('📦 Instalando dependências ultra-rápido (Bun)...');
    execSync('bun install', { cwd: destSite, stdio: 'ignore' });

    // 7. Repositório Git e Hook Otimizado
    console.log('🛡️  Configurando Git Bare e Hooks...');
    await fs.ensureDir(destRepo);
    execSync(`git init --bare "${destRepo}"`);

    const hookContent = `#!/bin/bash
export PATH="/home/maga/.bun/bin:/home/maga/.local/share/pnpm:/home/maga/.nvm/versions/node/v24.12.0/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
SITE_DIR="${destSite}"
GIT_DIR="${destRepo}"
STORAGE_DIR="${destStorage}"
TEMPLATE_DIR="${PATHS.template_site}"
CORE_SERVER="${PATHS.core_server}"
CORE_COMPONENTS="${PATHS.core_components}"

echo "🚀 [AUTO-DEPLOY] Iniciando atualização do site..."
git --work-tree="$SITE_DIR" --git-dir="$GIT_DIR" checkout -f main
cd "$SITE_DIR"

echo "🔗 Restaurando elos estruturais do ecossistema..."
rm -rf content db data server app/components/content node_modules
ln -sfn "$STORAGE_DIR/content" content
ln -sfn "$STORAGE_DIR/data" data
ln -sfn "$STORAGE_DIR/db" db
ln -sfn "$CORE_SERVER" server
mkdir -p app/components
ln -sfn "$CORE_COMPONENTS" app/components/content

echo "📦 Reinstalando dependências (Bun)..."
bun install

echo "🔄 Reiniciando site no PM2..."
pm2 reload "${targetName}:${NEXT_PORT}" || pm2 start ecosystem.config.cjs --update-env
echo "✅ [AUTO-DEPLOY] Sucesso Total (Zero-Build)!"`;

    await fs.writeFile(path.join(destRepo, 'hooks', 'post-receive'), hookContent);
    execSync(`chmod +x "${path.join(destRepo, 'hooks', 'post-receive')}"`);

    // 8. POPULAR O REPOSITÓRIO (Sincronização)
    console.log('📤 Inicializando Repositório...');
    try {
        const gitOpts = { cwd: destSite, maxBuffer: 1024 * 1024 * 10 }; 
        execSync(`git init -b main`, gitOpts);
        execSync(`git config user.email "bot@siriusstudio.site"`, gitOpts);
        execSync(`git config user.name "Sirius Bot"`, gitOpts);
        execSync(`git add .`, gitOpts);
        execSync(`git commit -m "Initial Setup: ${targetName} (Symlinked & Bun)"`, gitOpts);
        try { execSync(`git remote add origin "${destRepo}"`, gitOpts); } catch(e) {}
        execSync(`git push -u origin main`, gitOpts);
    } catch(e) {
        console.warn(`${C.yellow}   ⚠️  Erro no Git: ${e.message}${C.reset}`);
    }

    // 9. Iniciar PM2 e Caddy
    console.log('🚀 Iniciando Servidor...');
    execSync(`pm2 start ecosystem.config.cjs`, { cwd: destSite });
    execSync('pm2 save', { cwd: APPS_ROOT });

    const logName = targetName.replace(/[^a-z0-9]/g, '_');
    const caddyContent = `${DOMAIN}, www.${DOMAIN} {\n    import sirius_rules\n    reverse_proxy localhost:${NEXT_PORT}\n    log {\n        output file /var/log/caddy/${logName}.log\n    }\n}\n`;
    await fs.writeFile(path.join(PATHS.caddy_sites, `${targetName}.caddy`), caddyContent);
    reloadCaddy();

    // 10. Atualizar Info JSON (Adicionado a URL)
    infoData.sites.push({ 
        id: targetName, 
        port: NEXT_PORT, 
        url: `https://${DOMAIN}`,
        created_at: new Date().toISOString(),
        status: "active"
    });
    infoData.last_port = NEXT_PORT;
    await fs.writeJson(PATHS.info_json, infoData, { spaces: 2 });

    console.log(`${C.green}\n✅ Tudo pronto em tempo recorde! Para clonar localmente:${C.reset}`);
    console.log(`${C.cyan}git clone maga@siriusstudio.site:${destRepo}${C.reset}`);
}

async function listSites() {
    const info = await fs.readJson(PATHS.info_json);
    console.table(info.sites.map(s => ({ ID: s.id, PORT: s.port, URL: s.url || `${s.id}.siriusstudio.site` })));
}

async function renameSite() { console.log("Em breve..."); }
async function toggleStatus() { console.log("Em breve..."); }

async function deleteSite() {
    console.log(`\n${C.red}--- EXCLUIR PROJETO (DANGER ZONE) ---${C.reset}`);
    const info = await fs.readJson(PATHS.info_json);
    
    if (info.sites.length === 0) {
        console.log("Nenhum site para excluir.");
        return;
    }

    info.sites.forEach((s, i) => console.log(`${C.cyan}${i + 1}.${C.reset} ${s.id} (Porta: ${s.port})`));
    const indexStr = await ask(`\n${C.yellow}Digite o número do site para EXCLUIR DEFINITIVAMENTE: ${C.reset}`);
    const index = parseInt(indexStr) - 1;

    if (isNaN(index) || !info.sites[index]) {
        console.log("Opção inválida.");
        return;
    }

    const target = info.sites[index];
    const confirm = await ask(`${C.red}Tem certeza que deseja apagar TUDO de '${target.id}'? (digite 'sim' para confirmar): ${C.reset}`);
    
    if (confirm.toLowerCase() !== 'sim') {
        console.log("Operação cancelada.");
        return;
    }

    console.log(`\n🗑️  Iniciando limpeza de ${target.id}...`);

    try {
        console.log('🛑 Parando processo PM2...');
        try {
            execSync(`pm2 delete "${target.id}:${target.port}"`, { stdio: 'ignore', cwd: APPS_ROOT });
            execSync('pm2 save', { cwd: APPS_ROOT });
        } catch (e) { console.log(C.dim + "   (Processo PM2 não encontrado ou já parado)" + C.reset); }

        const folders = [
            path.join(PATHS.sites, target.id),
            path.join(PATHS.repos, `${target.id}.git`),
            path.join(PATHS.storage, target.id) 
        ];

        for (const folder of folders) {
            if (fs.existsSync(folder)) {
                await fs.remove(folder);
                console.log(`   ✅ Removido: ${path.basename(folder)}`);
            }
        }

        const caddyFile = path.join(PATHS.caddy_sites, `${target.id}.caddy`);
        if (fs.existsSync(caddyFile)) {
            await fs.remove(caddyFile);
            console.log(`   ✅ Removido: Configuração Caddy`);
            reloadCaddy();
        }

        const logFile = `/var/log/caddy/${target.id.replace(/[^a-z0-9]/g, '_')}.log`;
        try { execSync(`sudo rm -f ${logFile}`); } catch(e) {}

        info.sites.splice(index, 1);
        await fs.writeJson(PATHS.info_json, info, { spaces: 2 });

        console.log(`${C.green}\n✨ '${target.id}' foi completamente removido do ecossistema.${C.reset}`);

    } catch (error) {
        console.error(`${C.red}Erro durante a exclusão:${C.reset}`, error.message);
    }
}

main();