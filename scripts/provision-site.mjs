import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  { dest: 'public/images', src: `storage/${siteName}/images` },
  { dest: 'app/layouts', src: `storage/${siteName}/layouts` },
  { dest: 'app/pages', src: `storage/${siteName}/pages` },
  { dest: 'server/data', src: `storage/${siteName}/data` },
  
  // SiriusStudio Core Links
  { dest: 'app/composables', src: 'siriusstudio/app/composables' },
  { dest: 'server/api', src: 'siriusstudio/server/api' },
  { dest: 'server/routes', src: 'siriusstudio/server/routes' },
  { dest: 'server/utils', src: 'siriusstudio/server/utils' },

  // --- COMPONENTES (A Ordem Importa) ---
  // 1. Linka a pasta geral para o Storage
  { dest: 'app/components', src: `storage/${siteName}/components` },
  
  // 2. Linka o conteúdo do Sirius DENTRO da pasta do Storage (via link aninhado)
  { dest: 'app/components/content', src: 'siriusstudio/app/components/content' },
];

async function run() {
  try {
    // Garante que a raiz do site existe
    await fs.mkdir(SITE_ROOT, { recursive: true });

    for (const link of links) {
      const destPath = path.join(SITE_ROOT, link.dest);
      const srcPath = path.join(APPS_ROOT, link.src);

      // 1. Garante que a pasta pai do destino existe
      const destParent = path.dirname(destPath);
      await fs.mkdir(destParent, { recursive: true });

      // 2. Remove se já existir
      try {
        await fs.rm(destPath, { recursive: true, force: true });
      } catch (e) {}

      // 3. Verifica/Cria a ORIGEM
      try {
        await fs.access(srcPath);
      } catch {
        if (link.src.startsWith('storage')) {
            await fs.mkdir(srcPath, { recursive: true });
            console.log(`   ↳ Storage criado: ${link.src}`);
        } else {
            console.warn(`⚠️  Aviso: Origem do Core não encontrada: ${link.src}`);
        }
      }

      // --- CORREÇÃO DO CÁLCULO RELATIVO ---
      // Resolvemos o caminho REAL da pasta pai.
      // Se 'app/components' for um link para 'storage/...', isso retorna o caminho do storage.
      const realDestParent = await fs.realpath(destParent);
      
      // Calculamos a distância entre o LOCAL FÍSICO REAL e a ORIGEM
      const relativeSrc = path.relative(realDestParent, srcPath);
      
      await fs.symlink(relativeSrc, destPath, 'dir');
      console.log(`✅ Link criado: ${link.dest} -> ${relativeSrc}`);
    }

    console.log('\n🚀 Ambiente configurado com sucesso!');

  } catch (error) {
    console.error('❌ Falha fatal:', error);
  }
}

run();