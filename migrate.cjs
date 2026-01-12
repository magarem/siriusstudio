const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 1. Captura o argumento passado no terminal
const targetDirInput = process.argv[2];

// 2. Validação simples
if (!targetDirInput) {
  console.error('\n❌ Erro: Você precisa informar o caminho da pasta content.');
  console.error('👉 Exemplo de uso: node migrate.js ./apps/sites/indiasagrada/content\n');
  process.exit(1);
}

// Resolve para caminho absoluto para evitar erros
const contentDir = path.resolve(targetDirInput);

if (!fs.existsSync(contentDir)) {
  console.error(`\n❌ Erro: O diretório não existe: ${contentDir}\n`);
  process.exit(1);
}

// --- Funções Auxiliares (Mesma lógica anterior) ---

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function migrateFiles() {
  console.log(`\n🔍 Iniciando varredura em: ${contentDir}`);
  
  try {
    const files = getAllFiles(contentDir);
    let count = 0;
    let skipped = 0;

    files.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');

      // Regex para separar Frontmatter
      const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

      if (!match) return;

      const rawYaml = match[1];
      const body = match[2];

      let frontmatter;
      try {
        frontmatter = yaml.load(rawYaml);
      } catch (e) {
        console.error(`⚠️ Erro ao ler YAML de ${path.basename(filePath)}`);
        return;
      }

      // VERIFICAÇÃO: Só altera se tiver 'params_data'
      if (frontmatter && frontmatter.params_data) {
        const oldData = frontmatter.params_data;
        const newFrontmatter = {};

        // 1. Migrar Campos Simples (Title, Desc, etc)
        if (oldData.title) newFrontmatter.title = oldData.title;
        if (oldData.description) newFrontmatter.description = oldData.description;
        
        // Mantém topimage mesmo se for null, se existia antes
        if (oldData.hasOwnProperty('topimage')) {
            newFrontmatter.topimage = oldData.topimage;
        }

        // 2. Consolidar Imagens Laterais (sideimage, sideimage_1...)
        const imagesList = [];

        // Verifica a sideimage original
        if (oldData.sideimage) imagesList.push(oldData.sideimage);

        // Verifica as variações sideimage_X
        Object.keys(oldData).forEach(key => {
            if (key.startsWith('sideimage_') && oldData[key]) {
                imagesList.push(oldData[key]);
            }
        });

        if (imagesList.length > 0) {
          newFrontmatter.images = imagesList;
        }

        // Se houver outros campos no params_data que não mapeamos,
        // você pode querer copiá-los também, mas por enquanto pegamos só esses.

        // 3. Gerar o novo conteúdo
        const newYaml = yaml.dump(newFrontmatter, { lineWidth: -1 });
        const newContent = `---\n${newYaml}---\n${body}`;

        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Atualizado: ${path.basename(filePath)}`);
        count++;
      } else {
        skipped++;
      }
    });

    console.log('------------------------------------------------');
    console.log(`🎉 Processo finalizado!`);
    console.log(`📝 Arquivos alterados: ${count}`);
    console.log(`⏭️  Arquivos ignorados (já atualizados ou sem params): ${skipped}`);

  } catch (error) {
    console.error('❌ Erro fatal:', error);
  }
}

migrateFiles();