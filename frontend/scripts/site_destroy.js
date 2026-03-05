import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';

const VPS_HOST = "maga@siriusstudio.site";
const VPS_BASE_PATH = "/home/maga/dev/apps";
const siteName = process.argv[2];

const C = { reset: "\x1b[0m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m" };

if (!siteName) {
    console.error(`${C.red}❌ Erro: Qual site destruir?${C.reset}`);
    process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log(`\n${C.red}🚨 DESTRUIÇÃO: ${siteName.toUpperCase()} 🚨${C.reset}`);

rl.question(`Confirmar exclusão? (digite 'sim'): `, (ans) => {
    if (ans.toLowerCase() !== 'sim') process.exit(0);

    console.log(`\n${C.yellow}🔥 [1/3] Parando Processos e Apagando Arquivos...${C.reset}`);
    // Comando combo para limpar PM2 e Arquivos de uma vez
    const cleanCmd = `
        pm2 delete ${siteName} 2>/dev/null; 
        pm2 save; 
        rm -rf ${VPS_BASE_PATH}/sites/${siteName} ${VPS_BASE_PATH}/repos/${siteName}.git ${VPS_BASE_PATH}/storage/${siteName}
    `;
    try { execSync(`ssh ${VPS_HOST} "${cleanCmd}"`); } catch (e) {}

    console.log(`\n${C.yellow}📝 [2/3] Limpando Registros e Caddy...${C.reset}`);
    // AQUI ESTÁ A MUDANÇA: Chamamos o script especialista no servidor
    try {
        execSync(`ssh ${VPS_HOST} "node ${VPS_BASE_PATH}/bin/remove-site.mjs ${siteName}"`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`${C.red}Erro na limpeza remota.${C.reset}`);
    }

    console.log(`\n${C.yellow}💻 [3/3] Limpando Local...${C.reset}`);
    fs.removeSync(path.join(process.cwd(), '..', 'sites', siteName));

    console.log(`\n${C.green}✨ FEITO! O site ${siteName} não existe mais.${C.reset}\n`);
    process.exit(0);
});