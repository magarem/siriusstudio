import fs from 'fs';
import path from 'path';
import { globSync } from 'glob'; // Vamos precisar instalar: npm install glob

// =============================================================================
// CONFIGURAÇÕES
// =============================================================================
const PROJECT_ROOT = path.resolve(process.cwd(), '..'); // Assume que roda em /apps/scripts
const API_DIR = path.join(PROJECT_ROOT, 'server/api');
const TRASH_DIR = path.join(PROJECT_ROOT, '_TRASH_API');

// Onde procurar por chamadas de API (Frontend + Server Middleware + Outros)
const SEARCH_DIRS = [
    path.join(PROJECT_ROOT, 'app'),
    path.join(PROJECT_ROOT, 'pages'),
    path.join(PROJECT_ROOT, 'components'),
    path.join(PROJECT_ROOT, 'composables'),
    path.join(PROJECT_ROOT, 'layouts'),
    path.join(PROJECT_ROOT, 'server'), // Inclui outras APIs chamando APIs
    path.join(PROJECT_ROOT, 'stores'),
];

// Extensões de arquivos para ler o conteúdo (onde o código está)
const EXTENSIONS = ['.vue', '.ts', '.js', '.mjs'];

// Cores
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    dim: "\x1b[2m"
};

// =============================================================================
// UTILITÁRIOS
// =============================================================================

// Converte caminho do arquivo físico em rota da API do Nuxt
// Ex: server/api/users/create.post.ts -> /api/users/create
function getApiRoute(filePath) {
    let relative = path.relative(API_DIR, filePath);
    
    // Remove extensão (.ts, .js)
    let route = relative.replace(/\.(ts|js|mjs)$/, '');
    
    // Remove sufixos de método HTTP (.get, .post, .put, .delete)
    route = route.replace(/\.(get|post|put|delete|patch|options|head)$/, '');
    
    // Trata 'index' (server/api/auth/index.ts -> /api/auth)
    if (route.endsWith('index')) {
        route = route.slice(0, -5); // remove 'index'
        if (route.endsWith('/')) route = route.slice(0, -1);
    }

    // Normaliza barras para garantir compatibilidade Windows/Linux
    route = route.split(path.sep).join('/');

    // Se for dinâmico (ex: [id]), avisamos que a detecção é imprecisa
    const isDynamic = route.includes('[');

    return {
        route: `/api/${route}`, // Rota final esperada no fetch
        originalPath: filePath,
        isDynamic
    };
}

// Lê todos os arquivos do projeto e concatena em uma memória gigante
function loadCodebase() {
    console.log(`${C.cyan}📡 Escaneando codebase...${C.reset}`);
    let content = "";
    let fileCount = 0;

    SEARCH_DIRS.forEach(dir => {
        if (!fs.existsSync(dir)) return;
        
        // Pega todos os arquivos recursivamente nas pastas de busca
        const files = globSync(`${dir}/**/*{${EXTENSIONS.join(',')}}`, { windowsPathsNoEscape: true });
        
        files.forEach(f => {
            // Ignora a própria pasta server/api para não contar a definição como uso
            if (f.includes('server/api')) return;
            
            try {
                content += fs.readFileSync(f, 'utf-8') + "\n";
                fileCount++;
            } catch (e) {}
        });
    });

    console.log(`${C.dim}   -> ${fileCount} arquivos analisados.${C.reset}`);
    return content;
}

// =============================================================================
// MAIN
// =============================================================================
async function main() {
    console.clear();
    console.log(`${C.green}🔍 AUDITORIA DE API DO SIRIUS STUDIO${C.reset}\n`);

    if (!fs.existsSync(API_DIR)) {
        console.error(`${C.red}❌ Pasta server/api não encontrada em: ${API_DIR}${C.reset}`);
        process.exit(1);
    }

    // 1. Carrega todo o código do projeto na memória
    const codebase = loadCodebase();

    // 2. Lista todos os endpoints existentes
    const apiFiles = globSync(`${API_DIR}/**/*{${EXTENSIONS.join(',')}}`, { windowsPathsNoEscape: true });
    
    console.log(`${C.cyan}🔎 Analisando ${apiFiles.length} endpoints...${C.reset}\n`);

    let unusedCount = 0;
    const unusedFiles = [];

    apiFiles.forEach(file => {
        const { route, isDynamic } = getApiRoute(file);
        
        // Se a rota for vazia (ex: apenas server/api/index.ts -> /api/), ajusta
        const searchPattern = route === '/api/' ? '/api' : route;

        // Verifica se a string da rota aparece no código
        // Ex: Procura por "/api/users/create"
        // CUIDADO: Isso não pega construções dinâmicas complexas como `/api/users/${id}` se a rota for [id]
        
        // Para rotas dinâmicas, somos mais permissivos: procuramos apenas o prefixo
        // Ex: server/api/users/[id].ts -> procura por "/api/users"
        let found = false;
        
        if (isDynamic) {
            // Pega o pai (ex: /api/users)
            const parentRoute = path.dirname(searchPattern);
            if (codebase.includes(parentRoute)) found = true;
        } else {
            if (codebase.includes(searchPattern)) found = true;
        }

        if (!found) {
            console.log(`${C.red}🗑️  SEM USO DETECTADO:${C.reset} ${path.basename(file)}`);
            console.log(`   ${C.dim}Rota: ${searchPattern}${C.reset}`);
            unusedFiles.push(file);
            unusedCount++;
        } else {
            // console.log(`${C.green}OK:${C.reset} ${searchPattern}`);
        }
    });

    // =========================================================================
    // RELATÓRIO E AÇÃO
    // =========================================================================
    console.log(`\n---------------------------------------------------`);
    if (unusedCount === 0) {
        console.log(`${C.green}✅ Parabéns! Todos os endpoints parecem estar em uso.${C.reset}`);
    } else {
        console.log(`${C.yellow}⚠️  Encontrados ${unusedCount} arquivos potencialmente inúteis.${C.reset}`);
        console.log(`\nOs arquivos listados acima não foram encontrados textualmente no seu código.`);
        console.log(`(Nota: Se você monta URLs dinamicamente no runtime, pode ser um falso positivo).`);

        console.log(`\n${C.green}O que deseja fazer?${C.reset}`);
        console.log(`1. Mover esses arquivos para a pasta ${path.basename(TRASH_DIR)} (Seguro)`);
        console.log(`2. Apenas sair (Não fazer nada)`);

        const readline = await import('readline');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        
        rl.question(`\nOpção: `, (answer) => {
            if (answer.trim() === '1') {
                console.log(`\n📦 Movendo arquivos...`);
                if (!fs.existsSync(TRASH_DIR)) fs.mkdirSync(TRASH_DIR);

                unusedFiles.forEach(src => {
                    const relative = path.relative(API_DIR, src);
                    const dest = path.join(TRASH_DIR, relative);
                    
                    fs.mkdirSync(path.dirname(dest), { recursive: true });
                    fs.renameSync(src, dest);
                    console.log(`   -> Movido: ${relative}`);
                });
                console.log(`\n✅ Limpeza concluída! Verifique a pasta _TRASH_API.`);
            } else {
                console.log(`\nOperação cancelada.`);
            }
            rl.close();
            process.exit(0);
        });
    }
}

main();