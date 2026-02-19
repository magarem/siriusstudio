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
    sites: path.join(APPS_ROOT, 'sites'),       // (PRODUÇÃO) Apenas .output e dados
    builds: path.join(APPS_ROOT, 'builds'),     // (MONTAGEM) Código fonte, node_modules (pnpm)
    storage: path.join(APPS_ROOT, 'storage'),   // Dados persistentes
    repos: path.join(APPS_ROOT, 'repos'),       // Repositórios Git Bare
    
    // Configurações do Caddy
    caddy_sites: path.join(APPS_ROOT, 'caddy', 'sites'),

    // Caminhos dos Templates
    template_site: path.join(APPS_ROOT, 'sites', 'template_0'),
    template_storage: path.join(APPS_ROOT, 'storage', 'template_0'),
    
    // Manifesto Global
    info_json: path.join(APPS_ROOT, 'sites', 'info.json'),

    // --- CAMINHOS DO CORE (SIRIUS STUDIO ENGINE) ---
    core_server: path.join(APPS_ROOT, 'siriusstudio', 'server'),
    core_components: path.join(APPS_ROOT, 'siriusstudio', 'app', 'components', 'content')
};

// Cores para o Terminal
const C = {
    reset: "\x1b[0m", green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m", red: "\x1b[31m", cyan: "\x1b[36m", dim: "\x1b[2m"
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
        console.log(`${C.yellow}   ⚠️  Rode 'sudo systemctl reload caddy' manualmente.${C.reset}`);
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

    console.log(`${C.cyan}1.${C.reset} Criar novo site (Clean + pnpm)`);
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

    const destSite = path.join(PATHS.sites, targetName);     // Runtime (Limpo)
    const destBuild = path.join(PATHS.builds, targetName);   // Workspace (Pesado)
    const destStorage = path.join(PATHS.storage, targetName);
    const destRepo = path.join(PATHS.repos, `${targetName}.git`);

    if (fs.existsSync(destSite) || fs.existsSync(destBuild)) {
        throw new Error(`O site ou build '${targetName}' já existe.`);
    }

    // --- 1.1 GESTÃO DE PORTA ---
    const infoData = await fs.readJson(PATHS.info_json);
    const usedPorts = infoData.sites.map(s => s.port);
    let NEXT_PORT = Math.max(infoData.last_port, ...usedPorts) + 1;
    if (NEXT_PORT < 4000) NEXT_PORT = 4005;

    const DOMAIN = `${targetName}.siriusstudio.site`;

    // --- 1.2 STORAGE ---
    console.log('🗄️  Configurando Storage...');
    if (fs.existsSync(PATHS.template_storage)) {
        await fs.copy(PATHS.template_storage, destStorage);
    } else {
        await fs.ensureDir(path.join(destStorage, 'content'));
        await fs.ensureDir(path.join(destStorage, 'data'));
        await fs.ensureDir(path.join(destStorage, 'db'));
    }
    
    await fs.writeJson(path.join(destStorage, '_config.json'), {
        url: `https://${DOMAIN}`, port: NEXT_PORT.toString(), name: targetName, dominio: DOMAIN
    }, { spaces: 2 });

    // --- 1.3 BUILD WORKSPACE (Área de Montagem) ---
    console.log('⚙️  Preparando Área de Montagem (Build)...');
    await fs.ensureDir(destBuild);
    await fs.copy(PATHS.template_site, destBuild, {
        filter: (src) => !['node_modules', '.git', '.nuxt', '.output', 'dist', 'content', 'server'].some(el => src.includes(el))
    });

    // Links Simbólicos para o BUILD
    const buildLinks = [
        { dest: path.join(destBuild, 'content'), src: path.join(destStorage, 'content') },
        { dest: path.join(destBuild, 'server'), src: PATHS.core_server },
        { dest: path.join(destBuild, 'app', 'components', 'content'), src: PATHS.core_components }
    ];
    for (const link of buildLinks) {
        await fs.ensureDir(path.dirname(link.dest));
        if (fs.existsSync(link.src)) await fs.ensureSymlink(link.src, link.dest);
    }

    // --- 1.4 INSTALAÇÃO & HIDRATAÇÃO (USANDO PNPM) ---
    console.log('📦 Instalando dependências (pnpm link)...');
    try {
        execSync('pnpm install', { cwd: destBuild, stdio: 'ignore' });
    } catch (e) {
        console.warn(`${C.yellow}⚠️  Aviso: Falha no pnpm. Você instalou globalmente? (npm i -g pnpm). Tentando npm...${C.reset}`);
        execSync('npm install', { cwd: destBuild, stdio: 'ignore' });
    }

    const templateOutput = path.join(PATHS.template_site, '.output');
    if (fs.existsSync(templateOutput)) {
        console.log('⚡ [TURBO] Copiando Build pronto (.output)...');
        try { execSync(`cp -a "${templateOutput}" "${destBuild}/"`); } 
        catch (e) { execSync('pnpm run build', { cwd: destBuild, stdio: 'inherit' }); }
    } else {
        console.log('🛠️  Compilando...');
        execSync('pnpm run build', { cwd: destBuild, stdio: 'inherit' });
    }

    // --- 1.5 DEPLOY PARA PRODUÇÃO (Clean Runtime) ---
    console.log('🚀 Movendo .output para Área de Produção (Runtime)...');
    await fs.ensureDir(destSite);
    
    // Copia apenas o artefato compilado autossuficiente
    execSync(`cp -a "${path.join(destBuild, '.output')}/." "${destSite}/"`);

    // Gera os arquivos de ambiente
    await fs.writeFile(path.join(destSite, '.env'), `NUXT_SITE_ID=${targetName}\nPORT=${NEXT_PORT}\nNODE_ENV=production\nNUXT_PUBLIC_SITE_URL=https://${DOMAIN}`);
    const ecosystemContent = `module.exports = { apps: [{ name: "${targetName}:${NEXT_PORT}", script: "./server/index.mjs", env: { NODE_ENV: "production", PORT: ${NEXT_PORT}, NUXT_SITE_ID: "${targetName}" } }] };`;
    await fs.writeFile(path.join(destSite, 'ecosystem.config.cjs'), ecosystemContent);

    // Links Simbólicos para o RUNTIME (Apenas Dados)
    const runtimeLinks = [
        { dest: path.join(destSite, 'content'), src: path.join(destStorage, 'content') },
        { dest: path.join(destSite, 'data'), src: path.join(destStorage, 'data') },
        { dest: path.join(destSite, 'db'), src: path.join(destStorage, 'db') }
    ];
    for (const link of runtimeLinks) {
        if (fs.existsSync(link.src)) await fs.ensureSymlink(link.src, link.dest);
    }

    // --- 1.6 GIT REPO & HOOK INTELIGENTE ---
    console.log('🛡️  Criando Repositório Git Bare...');
    await fs.ensureDir(destRepo);
    execSync(`git init --bare "${destRepo}"`);

    const hookPath = path.join(destRepo, 'hooks', 'post-receive');
    const hookContent = `#!/bin/bash
SITE_DIR="${destSite}"
BUILD_DIR="${destBuild}"
GIT_DIR="${destRepo}"
STORAGE_DIR="${destStorage}"
CORE_SERVER="${PATHS.core_server}"
CORE_COMPONENTS="${PATHS.core_components}"

echo "🚀 [AUTO-DEPLOY] Recebido push para ${targetName}..."

# 1. Checkout no Workspace de Build
mkdir -p "$BUILD_DIR"
git --work-tree="$BUILD_DIR" --git-dir="$GIT_DIR" checkout -f main
cd "$BUILD_DIR"

# 2. Links necessários para o Build
rm -rf content server app/components/content
ln -sfn "$STORAGE_DIR/content" content
ln -sfn "$CORE_SERVER" server
mkdir -p app/components
ln -sfn "$CORE_COMPONENTS" app/components/content

# 3. Processo de Montagem (com pnpm)
echo "📦 Instalando dependências..."
pnpm install
echo "🛠️  Buildando aplicação..."
pnpm run build

# 4. Transfere para Produção Clean
echo "🚚 Movendo para Área de Produção..."
mkdir -p "$SITE_DIR"
rm -rf "$SITE_DIR/.output"
cp -a .output/. "$SITE_DIR/"

# 5. Reinicia a Aplicação
echo "🔄 Recarregando PM2..."
cd "$SITE_DIR"
pm2 reload "${targetName}:${NEXT_PORT}" || pm2 start ecosystem.config.cjs --update-env
echo "✅ Deploy concluído sem downtime!"
`;
    await fs.writeFile(hookPath, hookContent);
    execSync(`chmod +x "${hookPath}"`);

    // --- 1.7 PM2 SETUP INICIAL ---
    console.log('⚡ Configurando PM2...');
    try {
        execSync(`pm2 start ecosystem.config.cjs --update-env`, { cwd: destSite });
        execSync('pm2 save');
    } catch (e) { console.error("Erro no PM2:", e.message); }

    // --- 1.8 CADDY CONFIG ---
    console.log('🔒 Gerando Virtual Host no Caddy...');
    await fs.ensureDir(PATHS.caddy_sites);
    const logName = targetName.replace(/[^a-z0-9]/g, '_');
    const caddyFileContent = `${DOMAIN}, www.${DOMAIN} {const caddyFileContent = `${DOMAIN}, www.${DOMAIN} {
    import sirius_rules
    reverse_proxy localhost:${NEXT_PORT}
    log {
        output file /var/log/caddy/${logName}.log
    }
}
`;
    import sirius_rules
    reverse_proxy localhost:${NEXT_PORT}
    log { output file /var/log/caddy/${logName}.log }
}\n`;
    await fs.writeFile(path.join(PATHS.caddy_sites, `${targetName}.caddy`), caddyFileContent);
    reloadCaddy();

    // --- 1.9 REGISTRO ---
    infoData.sites.push({ id: targetName, port: NEXT_PORT, created_at: new Date().toISOString(), status: 'active', repo: destRepo });
    infoData.last_port = NEXT_PORT;
    await fs.writeJson(PATHS.info_json, infoData, { spaces: 2 });

    console.log(`${C.green}\n✅ Site ${targetName} criado com sucesso (Clean + pnpm)!${C.reset}`);
}

// =============================================================================
// 2. LISTAR SITES
// =============================================================================
async function listSites() {
    console.log(`\n${C.blue}--- LISTA DE SITES ---${C.reset}`);
    if (!fs.existsSync(PATHS.info_json)) return console.log("Nenhum site registrado.");

    const info = await fs.readJson(PATHS.info_json);
    let pm2Raw = "";
    try { pm2Raw = execSync('pm2 jlist').toString(); } catch(e){}
    const pm2List = pm2Raw ? JSON.parse(pm2Raw) : [];

    console.table(info.sites.map(s => {
        const pm2Proc = pm2List.find(p => p.name === `${s.id}:${s.port}`);
        return {
            ID: s.id,
            URL: s.id.includes('.') ? s.id : `${s.id}.siriusstudio.site`,
            PORT: s.port,
            STATUS_PM2: pm2Proc && pm2Proc.pm2_env.status === 'online' ? '🟢 Online' : '🔴 Parado'
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
    if ((await ask("Confirmar? (s/n): ")).toLowerCase() !== 's') return;

    try { execSync(`pm2 delete "${oldPM2Name}"`); } catch(e) {}

    const move = (base, oldN, newN) => {
        if (fs.existsSync(path.join(base, oldN))) fs.renameSync(path.join(base, oldN), path.join(base, newN));
    };
    move(PATHS.sites, oldName, newName);
    move(PATHS.builds, oldName, newName);
    move(PATHS.storage, oldName, newName);
    move(PATHS.repos, `${oldName}.git`, `${newName}.git`);

    const newSitePath = path.join(PATHS.sites, newName);
    const envPath = path.join(newSitePath, '.env');
    if (fs.existsSync(envPath)) {
        await fs.writeFile(envPath, (await fs.readFile(envPath, 'utf8')).replace(`NUXT_SITE_ID=${oldName}`, `NUXT_SITE_ID=${newName}`).replace(oldDomain, newDomain));
    }
    const ecoPath = path.join(newSitePath, 'ecosystem.config.cjs');
    if (fs.existsSync(ecoPath)) {
        await fs.writeFile(ecoPath, (await fs.readFile(ecoPath, 'utf8')).replace(oldPM2Name, newPM2Name).replace(`NUXT_SITE_ID: "${oldName}"`, `NUXT_SITE_ID: "${newName}"`));
    }
    const hookPath = path.join(PATHS.repos, `${newName}.git`, 'hooks', 'post-receive');
    if (fs.existsSync(hookPath)) {
        await fs.writeFile(hookPath, (await fs.readFile(hookPath, 'utf8')).replaceAll(oldName, newName));
    }

    const oldCaddyPath = path.join(PATHS.caddy_sites, `${oldName}.caddy`);
    if (fs.existsSync(oldCaddyPath)) {
        let caddyContent = await fs.readFile(oldCaddyPath, 'utf8');
        caddyContent = caddyContent.replace(new RegExp(oldDomain, 'g'), newDomain).replace(new RegExp(oldName.replace(/[^a-z0-9]/g, '_'), 'g'), newName.replace(/[^a-z0-9]/g, '_'));
        await fs.writeFile(path.join(PATHS.caddy_sites, `${newName}.caddy`), caddyContent);
        await fs.remove(oldCaddyPath);
        reloadCaddy();
    }

    info.sites[siteIndex].id = newName;
    info.sites[siteIndex].repo = path.join(PATHS.repos, `${newName}.git`);
    await fs.writeJson(PATHS.info_json, info, { spaces: 2 });

    try {
        execSync(`pm2 start ecosystem.config.cjs`, { cwd: newSitePath });
        execSync('pm2 save');
        console.log(`${C.green}✅ Site renomeado com sucesso!${C.reset}`);
    } catch(e) {}
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
    if (await ask("Deseja (1) Pausar ou (2) Retomar? ") === '1') {
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
    const name = await ask("Digite o nome do projeto para EXCLUIR: ");
    
    const info = await fs.readJson(PATHS.info_json);
    const index = info.sites.findIndex(s => s.id === name);
    if (index === -1) throw new Error("Site não encontrado.");
    
    if (await ask(`Tem certeza? Digite 'DELETAR': `) !== 'DELETAR') return;

    try { execSync(`pm2 delete "${name}:${info.sites[index].port}"`); execSync('pm2 save'); } catch(e) {}

    const caddyPath = path.join(PATHS.caddy_sites, `${name}.caddy`);
    if (fs.existsSync(caddyPath)) {
        await fs.remove(caddyPath);
        reloadCaddy();
    }

    console.log("Apagando arquivos de sistema...");
    await fs.remove(path.join(PATHS.sites, name));
    await fs.remove(path.join(PATHS.builds, name));
    await fs.remove(path.join(PATHS.storage, name));
    await fs.remove(path.join(PATHS.repos, `${name}.git`));

    info.sites.splice(index, 1);
    await fs.writeJson(PATHS.info_json, info, { spaces: 2 });
    console.log(`${C.green}🗑️  Site ${name} removido completamente.${C.reset}`);
}

main();