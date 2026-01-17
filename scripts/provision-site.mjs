import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- 1. Configuração Inicial ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// O script roda em apps/siriusstudio/scripts, então subimos 2 níveis para chegar em 'apps'
const APPS_ROOT = path.resolve(__dirname, '..', '..');

const siteName = process.argv[2];

if (!siteName) {
  console.error('❌ Erro: Informe o nome do site.');
  console.error('👉 Exemplo: npm run newsite meunovo.site');
  process.exit(1);
}

const SITE_ROOT = path.join(APPS_ROOT, 'sites', siteName);

console.log(`🔧 Configurando ambiente para: ${siteName}`);
console.log(`📂 Raiz dos Apps: ${APPS_ROOT}`);

// --- 2. Definição dos Mapeamentos ---
// Estrutura: { dest: 'caminho/no/site', src: 'caminho/origem' }
// Nota: A ordem importa! Links pais devem ser criados antes de links filhos.
const links = [
  // Storage Links
  { dest: 'content', src: `storage/${siteName}/content` },
  { dest: 'app/layouts', src: `storage/${siteName}/layouts` },
  { dest: 'app/pages', src: `storage/${siteName}/pages` },
  { dest: 'server/data', src: `storage/${siteName}/data` },
  
  // SiriusStudio Core Links
  { dest: 'app/composables', src: 'siriusstudio/app/composables' },
  { dest: 'server/api', src: 'siriusstudio/server/api' },
  { dest: 'server/routes', src: 'siriusstudio/server/routes' },
  { dest: 'server/utils', src: 'siriusstudio/server/utils' },

  // --- CASOS ESPECIAIS (Aninhados) ---
  // 1. Linkar a pasta de componentes do usuário (Storage)
  { dest: 'app/components', src: `storage/${siteName}/components` },
  
  // 2. Injetar componentes do Sirius DENTRO da pasta de componentes do usuário
  // Como 'app/components' agora aponta para o storage, isso vai criar um link 
  // simbólico dentro de apps/storage/[site]/components/content apontando para sirius
  { dest: 'app/components/content', src: 'siriusstudio/app/components/content' },
];

async function run() {
  try {
    // Garante que a pasta do site existe
    // await fs.mkdir(SITE_ROOT, { recursive: true });

    for (const link of links) {
      const destPath = path.join(SITE_ROOT, link.dest);
      const srcPath = path.join(APPS_ROOT, link.src);

      // 1. Garante que a pasta pai do destino existe
      const destParent = path.dirname(destPath);
      //await fs.mkdir(destParent, { recursive: true });

      // 2. Remove se já existir (arquivo, pasta ou link)
      try {
        await fs.rm(destPath, { recursive: true, force: true });
      } catch (e) {
        // Ignora erro se não existir
      }

      // 3. Verifica se a ORIGEM existe (opcional, mas bom para debug)
      try {
        await fs.access(srcPath);
      } catch {
        console.warn(`⚠️  Aviso: A origem não existe ainda: ${link.src}`);
        // Criamos a pasta de origem para evitar link quebrado, 
        // exceto se for código do sirius (que deveria existir)
        if (link.src.startsWith('storage')) {
            await fs.mkdir(srcPath, { recursive: true });
            console.log(`   ↳ Pasta de storage criada automaticamente.`);
        }
      }

      // 4. Cria o Link Simbólico
      // Calculamos o caminho relativo para o link ser portável
      const relativeSrc = path.relative(destParent, srcPath);
      
      await fs.symlink(relativeSrc, destPath, 'dir');
      console.log(`✅ Link criado: ${link.dest} -> ${link.src}`);
    }

    console.log('\n🚀 Ambiente configurado com sucesso!');

  } catch (error) {
    console.error('❌ Falha fatal:', error);
  }
}

run();