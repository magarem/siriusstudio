import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process'; // <--- Módulo para rodar o seed

// --- 1. Configuração Inicial ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APPS_ROOT = path.resolve(__dirname, '..', '..');

const siteName = process.argv[2];

if (!siteName) {
  console.error('❌ Erro: Informe o nome do site.');
  process.exit(1);
}

const SITE_ROOT = path.join(APPS_ROOT, 'sites', siteName);

console.log(`🔧 Configurando ambiente para: ${siteName}`);

const links = [
  // Storage Links
  { dest: 'content', src: `storage/${siteName}/content` },
  { dest: 'data', src: `storage/${siteName}/data` },
  { dest: 'db', src: `storage/${siteName}/db` },
  
  // SiriusStudio Core Links
  { dest: 'server', src: 'siriusstudio/server' },

  // --- COMPONENTES ---
  { dest: 'app/components/content', src: 'siriusstudio/app/components/content' },
];

async function run() {
  try {
    // Garante que a raiz do site existe
    await fs.mkdir(SITE_ROOT, { recursive: true });

    // --- ETAPA 1: CRIAÇÃO DE LINKS E PASTAS ---
    for (const link of links) {
      const destPath = path.join(SITE_ROOT, link.dest);
      const srcPath = path.join(APPS_ROOT, link.src);

      // Garante pasta pai do destino
      const destParent = path.dirname(destPath);
      await fs.mkdir(destParent, { recursive: true });

      // Remove existente
      try {
        await fs.rm(destPath, { recursive: true, force: true });
      } catch (e) {}

      // Verifica/Cria Origem
      try {
        await fs.access(srcPath);
      } catch {
        if (link.src.startsWith('storage')) {
            await fs.mkdir(srcPath, { recursive: true });
            console.log(`   ↳ Pasta criada no Storage: ${link.src}`);
        } else {
            console.warn(`⚠️  Aviso: Pasta do Core não encontrada: ${link.src}`);
        }
      }

      // Linkagem com caminho relativo real
      const realDestParent = await fs.realpath(destParent);
      const relativeSrc = path.relative(realDestParent, srcPath);
      
      await fs.symlink(relativeSrc, destPath, 'dir');
      console.log(`✅ Link criado: ${link.dest} -> ${relativeSrc}`);
    }

    // --- ETAPA 2: CONFIGURAÇÃO DO BANCO DE DADOS (SEED) ---
    console.log('\n🌱 Inicializando banco de dados...');
    
    const seedScriptPath = path.join(__dirname, 'seed-db.mjs');
    
    try {
        // Executa: node scripts/seed-db.mjs [siteName]
        // stdio: 'inherit' faz com que os logs do seed apareçam aqui no console
        execSync(`node "${seedScriptPath}" "${siteName}"`, { stdio: 'inherit' });
        console.log('✅ Banco de dados configurado com sucesso.');
    } catch (err) {
        console.error('❌ Erro ao rodar o seed do banco de dados.');
        // Não damos throw aqui para não invalidar os links já criados, mas avisamos o erro
    }

    console.log('\n🚀 Ambiente configurado com sucesso!');

  } catch (error) {
    console.error('❌ Falha fatal:', error);
  }
}

run();