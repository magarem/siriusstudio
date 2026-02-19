import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';

// =============================================================================
// CONFIGURAÇÕES GLOBAIS & CAMINHOS
// =============================================================================
const CURRENT_DIR = process.cwd();
const APPS_ROOT = path.resolve(CURRENT_DIR, '..'); // ~/dev/apps

const PATHS = {
    sites: path.join(APPS_ROOT, 'sites'),
    storage: path.join(APPS_ROOT, 'storage'),
    repos: path.join(APPS_ROOT, 'repos'),
    
    // Configurações do Caddy
    caddy_sites: path.join(APPS_ROOT, 'caddy', 'sites'),

    // Caminhos dos Templates
    template_site: path.join(APPS_ROOT, 'sites', 'template_0'), // Ou sirius_site_basedesigner
    template_storage: path.join(APPS_ROOT, 'storage', 'template_0'),
    
    // Manifesto Global
    info_json: path.join(APPS_ROOT, 'sites', 'info.json'),

    // --- CAMINHOS DO CORE (SIRIUS STUDIO ENGINE) ---
    core_server: path.join(APPS_ROOT, 'siriusstudio', 'server'),
    core_components: path.join(APPS_ROOT, 'siriusstudio', 'app', 'components', 'content')
};

// Cores para o Terminal
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    dim: "\x1b[2m"
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

// =============================================================================
// HELPER: CADDY RELOAD
// =============================================================================
function reloadCaddy() {
    console.log('🔄 Atualizando Caddy Server...');
    try {
        execSync('sudo systemctl reload caddy', { stdio: 'ignore' }); 
        console.log(`${C.green}   ✅ Caddy atualizado com sucesso.${C.reset}`);
    } catch (e) {
        console.log(`${C.yellow}   ⚠️  Não foi possível recarregar o Caddy automaticamente.${C.reset}`);
        console.log(`${C.dim}      Sugestão: Rode 'sudo systemctl reload caddy' manualmente.${C.reset}`);
    }
}

// =============================================================================
// MOTOR PRINCIPAL (MENU)
// =============================================================================
async function main() {
    console.clear();
    console.log(`${C.green}╔════════════════════════════════════════════════════╗`);
    console.log(`║        🌟 SIRIUS STUDIO ECOSYSTEM MANAGER        ║`);
    console.log(`╚════════════════════════════════════════════════════╝${C.reset}\n`);

    console.log(`${C.cyan}1.${C.reset} Criar novo site (Deploy + Git + PM2 + Caddy)`);
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

// =============================================================================
// 1. CRIAR NOVO SITE
// =============================================================================
async function createSite() {
    console.log(`\n${C.blue}--- CRIAR NOVO PROJETO ---${C.reset}`);
    let targetName = await ask("Nome do projeto (sem espaços, ex: cliente-a): ");
    targetName = targetName.toLowerCase().replace(/\s+/g, '-');

    if (!targetName) return console.log("Nome inválido.");

    const destSite = path.join(PATHS.sites, targetName);
    const destStorage = path.join(PATHS.storage, targetName);
    const destRepo = path.join(PATHS.repos, `${targetName}.git`);

    if (fs.existsSync(destSite)) throw new Error(`O site '${targetName}' já existe.`);

    // --- 1.1 GESTÃO DE PORTA DINÂMICA ---
    console.log(`${C.dim}📝 Lendo info.json...${C.reset}`);
    if (!await fs.pathExists(PATHS.info_json)) {
        await fs.writeJson(PATHS.info_json, { project: "Sirius Eco", last_port: 4000, sites: [] }, { spaces: 2 });
    }
    const infoData = await fs.readJson(PATHS.info_json);
    
    const usedPorts = infoData.sites.map(s => s.port);
    let NEXT_PORT = Math.max(infoData.last_port, ...usedPorts) + 1;
    if (NEXT_PORT < 4000) NEXT_PORT = 4005; // Margem de segurança

    // Define domínio (Pode ser ajustado depois se for domínio próprio)
    const DOMAIN = `${targetName}.siriusstudio.site`;

    // --- 1.2 STORAGE ---
    console.log('🗄️  Clonando Storage...');
    if (fs.existsSync(PATHS.template_storage)) {
        await fs.copy(PATHS.template_storage, destStorage);
    } else {
        await fs.ensureDir(path.join(destStorage, 'content'));
        await fs.ensureDir(path.join(destStorage, 'data'));
        await fs.ensureDir(path.join(destStorage, 'db'));
    }
    
    const storageConfig = {
        url: `https://${DOMAIN}`, 
        port: NEXT_PORT.toString(),
        name: targetName,
        dominio: DOMAIN
    };
    await fs.writeJson(path.join(destStorage, '_config.json'), storageConfig, { spaces: 2 });

    // --- 1.3 SITE (TEMPLATE CODE) ---
    console.log('🌍 Clonando Template Nuxt...');
    if (!fs.existsSync(PATHS.template_site)) throw new Error(`Template não encontrado em: ${PATHS.template_site}`);
    
    await fs.copy(PATHS.template_site, destSite, {
        filter: (src) => !['node_modules', '.git', '.nuxt', '.output', 'dist', 'content', 'server'].some(el => src.includes(el))
    });

    await fs.writeFile(path.join(destSite, '.env'), `NUXT_SITE_ID=${targetName}\nPORT=${NEXT_PORT}\nNODE_ENV=production\nNUXT_PUBLIC_SITE_URL=https://${DOMAIN}`);

    // --- 1.4 LINKS SIMBÓLICOS (Limpa Trilhos) ---
    console.log('🔗 Configurando Arquitetura de Links...');
    const symlinks = [
        { dest: path.join(destSite, 'content'), src: path.join(destStorage, 'content') },
        { dest: path.join(destSite, 'data'), src: path.join(destStorage, 'data') },
        { dest: path.join(destSite, 'db'), src: path.join(destStorage, 'db') },
        { dest: path.join(destSite, 'server'), src: PATHS.core_server },
        { dest: path.join(destSite, 'app', 'components', 'content'), src: PATHS.core_components }
    ];

    for (const link of symlinks) {
        await fs.ensureDir(path.dirname(link.dest));
        if (fs.existsSync(link.dest)) await fs.remove(link.dest);
        if (fs.existsSync(link.src)) {
            await fs.ensureSymlink(link.src, link.dest);
        } else {
            console.warn(`   ⚠️  Origem não encontrada: ${link.src}`);
        }
    }

    // --- 1.5 GIT REPO & HOOK ---
    console.log('🛡️  Criando Repositório Git Bare...');
    await fs.ensureDir(destRepo);
    execSync(`git init --bare "${destRepo}"`);

    const hookPath = path.join(destRepo, 'hooks', 'post-receive');
    const hookContent = `#!/bin/bash
TARGET="${destSite}"
GIT_DIR="${destRepo}"
STORAGE_DIR="${destStorage}"
CORE_SERVER="${PATHS.core_server}"
CORE_COMPONENTS="${PATHS.core_components}"

echo "🚀 [AUTO-DEPLOY] Recebido push para ${targetName}..."
mkdir -p "$TARGET"
git --work-tree="$TARGET" --git-dir="$GIT_DIR" checkout -f main
cd "$TARGET"

echo "🔗 [DEPLOY] Garantindo links..."
rm -rf content data db server app/components/content
ln -sfn "$STORAGE_DIR/content" content
ln -sfn "$STORAGE_DIR/data" data
ln -sfn "$STORAGE_DIR/db" db
ln -sfn "$CORE_SERVER" server
mkdir -p app/components
ln -sfn "$CORE_COMPONENTS" app/components/content

echo "📦 Instalando dependências..."
npm install --no-audit
echo "🛠️  Buildando..."
npm run build
echo "🔄 Recarregando PM2..."
pm2 reload "${targetName}:${NEXT_PORT}" || pm2 start ecosystem.config.cjs --update-env
echo "✅ Deploy concluído!"
`;
    await fs.writeFile(hookPath, hookContent);
    execSync(`chmod +x "${hookPath}"`);

    // --- 1.6 HIDRATAÇÃO (TURBO COPY) ---
    console.log('⚡ [TURBO] Hidratando aplicação...');
    const templateModules = path.join(PATHS.template_site, 'node_modules');
    const templateOutput = path.join(PATHS.template_site, '.output');

    if (fs.existsSync(templateModules)) {
        try { execSync(`cp -a "${templateModules}" "${destSite}/"`); } 
        catch (e) { execSync('npm install', { cwd: destSite, stdio: 'ignore' }); }
    } else {
        execSync('npm install', { cwd: destSite, stdio: 'ignore' });
    }

    if (fs.existsSync(templateOutput)) {
        try { execSync(`cp -a "${templateOutput}" "${destSite}/"`); } 
        catch (e) { execSync('npm run build', { cwd: destSite, stdio: 'inherit' }); }
    } else {
        execSync('npm run build', { cwd: destSite, stdio: 'inherit' });
    }

    // --- 1.7 PM2 SETUP ---
    console.log('⚡ Configurando PM2...');
    const pm2Name = `${targetName}:${NEXT_PORT}`;
    const ecosystemContent = `module.exports = {
  apps: [{
    name: "${pm2Name}",
    script: "./.output/server/index.mjs",
    env: { NODE_ENV: "production", PORT: ${NEXT_PORT}, NUXT_SITE_ID: "${targetName}" }
  }]
};`;
    await fs.writeFile(path.join(destSite, 'ecosystem.config.cjs'), ecosystemContent);
    
    try {
        execSync(`pm2 start ecosystem.config.cjs --update-env`, { cwd: destSite });
        execSync('pm2 save');
    } catch (e) {
        console.error("Erro ao iniciar PM2:", e.message);
    }

    // --- 1.8 CONFIGURAÇÃO DO CADDY ---
    console.log('🔒 Gerando Virtual Host no Caddy...');
    await fs.ensureDir(PATHS.caddy_sites);
    
    const logName = targetName.replace(/[^a-z0-9]/g, '_');
    const caddyFileContent = `${DOMAIN}, www.${DOMAIN} {
    import sirius_rules
    reverse_proxy localhost:${NEXT_PORT}
    log {
        output file /var/log/caddy/${logName}.log
    }
}
`;
    const caddyFilePath = path.join(PATHS.caddy_sites, `${targetName}.caddy`);
    await fs.writeFile(caddyFilePath, caddyFileContent);
    reloadCaddy();

    // --- 1.9 REGISTRO FINAL ---
    infoData.sites.push({ 
        id: targetName, 
        port: NEXT_PORT, 
        created_at: new Date().toISOString(),
        status: 'active', 
        repo: destRepo 
    });
    infoData.last_port = NEXT_PORT;
    await fs.writeJson(PATHS.info_json, infoData, { spaces: 2 });

    console.log(`${C.green}\n✅ Site ${targetName} criado com sucesso!${C.reset}`);
    console.log(`📡 URL Pública: https://${DOMAIN}`);
    console.log(`📦 Repo Git: ${destRepo}`);
}

// =============================================================================
// 2. LISTAR SITES
// =============================================================================
async function listSites() {
    console.log(`\n${C.blue}--- LISTA DE SITES ---${C.reset}`);
    
    if (!fs.existsSync(PATHS.info_json)) {
        console.log("Nenhum site registrado.");
        return;
    }

    const info = await fs.readJson(PATHS.info_json);
    let pm2Raw = "";
    try { pm2Raw = execSync('pm2 jlist').toString(); } catch(e){}
    const pm2List = pm2Raw ? JSON.parse(pm2Raw) : [];

    console.table(info.sites.map(s => {
        const pm2Proc = pm2List.find(p => p.name === `${s.id}:${s.port}`);
        const realStatus = pm2Proc ? pm2Proc.pm2_env.status : 'stopped';
        
        // Verifica se é domínio próprio (tem ponto no ID) para exibição correta
        const domainUrl = s.id.includes('.') ? s.id : `${s.id}.siriusstudio.site`;

        return {
            ID: s.id,
            URL: domainUrl,
            PORT: s.port,
            STATUS_PM2: realStatus === 'online' ? '🟢 Online' : '🔴 ' + realStatus
        };
    }));
}

// =============================================================================
// 3. RENOMEAR SITE
// =============================================================================
async function renameSite() {
    console.log(`\n${C.blue}--- RENOMEAR SITE ---${C.reset}`);
    const oldName = await ask("Nome ATUAL do projeto: ");
    const newName = await ask("NOVO nome do projeto: ");

    if (!oldName || !newName) return;

    const info = await fs.readJson(PATHS.info_json);
    const siteIndex = info.sites.findIndex(s => s.id === oldName);
    
    if (siteIndex === -1) throw new Error("Site não encontrado.");
    const siteData = info.sites[siteIndex];

    const oldPM2Name = `${oldName}:${siteData.port}`;
    const newPM2Name = `${newName}:${siteData.port}`;
    const oldDomain = oldName.includes('.') ? oldName : `${oldName}.siriusstudio.site`;
    const newDomain = newName.includes('.') ? newName : `${newName}.siriusstudio.site`;

    console.log(`${C.yellow}⚠️  Isso vai parar o site, mover pastas, alterar DNS e reiniciar.${C.reset}`);
    const confirm = await ask("Confirmar? (s/n): ");
    if (confirm.toLowerCase() !== 's') return;

    // 1. Parar PM2
    try { execSync(`pm2 delete "${oldPM2Name}"`); } catch(e) {}

    // 2. Renomear Pastas Físicas
    const move = (base, oldN, newN) => {
        if (fs.existsSync(path.join(base, oldN))) {
            fs.renameSync(path.join(base, oldN), path.join(base, newN));
        }
    };

    move(PATHS.sites, oldName, newName);
    move(PATHS.storage, oldName, newName);
    move(PATHS.repos, `${oldName}.git`, `${newName}.git`);

    // 3. Atualizar Arquivos Internos (Nuxt & PM2)
    const newSitePath = path.join(PATHS.sites, newName);
    
    const envPath = path.join(newSitePath, '.env');
    if (fs.existsSync(envPath)) {
        let env = await fs.readFile(envPath, 'utf8');
        env = env.replace(`NUXT_SITE_ID=${oldName}`, `NUXT_SITE_ID=${newName}`);
        env = env.replace(oldDomain, newDomain);
        await fs.writeFile(envPath, env);
    }

    const ecoPath = path.join(newSitePath, 'ecosystem.config.cjs');
    if (fs.existsSync(ecoPath)) {
        let eco = await fs.readFile(ecoPath, 'utf8');
        eco = eco.replace(oldPM2Name, newPM2Name).replace(`NUXT_SITE_ID: "${oldName}"`, `NUXT_SITE_ID: "${newName}"`);
        await fs.writeFile(ecoPath, eco);
    }

    const hookPath = path.join(PATHS.repos, `${newName}.git`, 'hooks', 'post-receive');
    if (fs.existsSync(hookPath)) {
        let hook = await fs.readFile(hookPath, 'utf8');
        hook = hook.replaceAll(oldName, newName); 
        await fs.writeFile(hookPath, hook);
    }

    // 4. Renomear e Atualizar Configuração do Caddy
    const oldCaddyPath = path.join(PATHS.caddy_sites, `${oldName}.caddy`);
    const newCaddyPath = path.join(PATHS.caddy_sites, `${newName}.caddy`);
    
    if (fs.existsSync(oldCaddyPath)) {
        let caddyContent = await fs.readFile(oldCaddyPath, 'utf8');
        caddyContent = caddyContent.replace(new RegExp(oldDomain, 'g'), newDomain);
        caddyContent = caddyContent.replace(new RegExp(oldName.replace(/[^a-z0-9]/g, '_'), 'g'), newName.replace(/[^a-z0-9]/g, '_'));
        
        await fs.writeFile(newCaddyPath, caddyContent);
        await fs.remove(oldCaddyPath);
        reloadCaddy();
    }

    // 5. Atualizar JSON
    info.sites[siteIndex].id = newName;
    info.sites[siteIndex].repo = path.join(PATHS.repos, `${newName}.git`);
    await fs.writeJson(PATHS.info_json, info, { spaces: 2 });

    // 6. Reiniciar PM2
    try {
        execSync(`pm2 start ecosystem.config.cjs`, { cwd: newSitePath });
        execSync('pm2 save');
        console.log(`${C.green}✅ Site renomeado para ${newName}!${C.reset}`);
    } catch(e) {
        console.error("Erro ao reiniciar PM2:", e.message);
    }
}

// =============================================================================
// 4. PAUSAR / RETOMAR
// =============================================================================
async function toggleStatus() {
    const name = await ask("Nome do projeto: ");
    const info = await fs.readJson(PATHS.info_json);
    const site = info.sites.find(s => s.id === name);
    if (!site) throw new Error("Site não encontrado.");

    const pm2Name = `${site.id}:${site.port}`;
    
    const action = await ask("Deseja (1) Pausar ou (2) Retomar? ");
    
    if (action === '1') {
        try { execSync(`pm2 stop "${pm2Name}"`); } catch(e) {}
        site.status = 'paused';
        console.log("⏸️  Site pausado.");
    } else {
        try { execSync(`pm2 start "${pm2Name}"`); } catch(e) {}
        site.status = 'active';
        console.log("▶️  Site retomado.");
    }

    await fs.writeJson(PATHS.info_json, info, { spaces: 2 });
    execSync('pm2 save');
}

// =============================================================================
// 5. EXCLUIR SITE
// =============================================================================
async function deleteSite() {
    console.log(`\n${C.red}!!! ZONA DE PERIGO !!!${C.reset}`);
    const name = await ask("Digite o nome do projeto para EXCLUIR PERMANENTEMENTE: ");
    
    const info = await fs.readJson(PATHS.info_json);
    const index = info.sites.findIndex(s => s.id === name);
    
    if (index === -1) throw new Error("Site não encontrado.");
    
    const confirm = await ask(`Tem certeza que quer apagar ${name}? Digite 'DELETAR': `);
    if (confirm !== 'DELETAR') return console.log("Operação cancelada.");

    const siteData = info.sites[index];
    const pm2Name = `${siteData.id}:${siteData.port}`;

    // 1. Remove PM2
    console.log("Tirando do PM2...");
    try { execSync(`pm2 delete "${pm2Name}"`); execSync('pm2 save'); } catch(e) {}

    // 2. Remove Configuração do Caddy e Aplica
    const caddyPath = path.join(PATHS.caddy_sites, `${name}.caddy`);
    if (fs.existsSync(caddyPath)) {
        await fs.remove(caddyPath);
        console.log("🔒 Limpando regras SSL e Virtual Host...");
        reloadCaddy();
    }

    // 3. Remove Pastas Físicas
    console.log("Apagando arquivos de sistema e dados...");
    await fs.remove(path.join(PATHS.sites, name));
    await fs.remove(path.join(PATHS.storage, name));
    await fs.remove(path.join(PATHS.repos, `${name}.git`));

    // 4. Remove do Manifesto
    info.sites.splice(index, 1);
    await fs.writeJson(PATHS.info_json, info, { spaces: 2 });

    console.log(`${C.green}🗑️  Site ${name} removido completamente do servidor.${C.reset}`);
}

// Inicia
main();