import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Em ES Modules, precisamos simular o __dirname se necessário, 
// mas aqui usaremos caminhos absolutos baseados no argumento
const targetDir = process.argv[2];

if (!targetDir) {
    console.error('❌ Erro: Você precisa informar o caminho da pasta.');
    console.log('Uso: node migrate-content.js <caminho-da-pasta-content>');
    process.exit(1);
}

const contentDir = path.resolve(targetDir);

function migrateDirectory(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // Recursão para subpastas
            migrateDirectory(fullPath);
        } else if (item.endsWith('.md')) {
            // Ignora o que já é index ou arquivos de configuração
            if (item.startsWith('_index.md') || item.startsWith('index.md')) {
                if (item === 'index.md') {
                    const newIndexPath = path.join(dir, '_index.md');
                    fs.renameSync(fullPath, newIndexPath);
                    console.log(`- Padronizado: index.md -> _index.md em ${dir}`);
                }
                return;
            }

            // Lógica de transformação de arquivo para pasta
            const fileName = item.replace('.md', '');
            const newFolderPath = path.join(dir, fileName);
            const targetFilePath = path.join(newFolderPath, '_index.md');

            // 1. Cria a pasta com o nome do arquivo (se não existir)
            if (!fs.existsSync(newFolderPath)) {
                fs.mkdirSync(newFolderPath, { recursive: true });
            }

            // 2. Move o arquivo para dentro da pasta como _index.md
            try {
                fs.renameSync(fullPath, targetFilePath);
                console.log(`✓ Migrado: ${item} -> ${fileName}/_index.md`);
            } catch (err) {
                console.error(`❌ Falha ao mover ${item}:`, err.message);
            }
        }
    });
}

console.log(`🚀 Iniciando migração no diretório: ${contentDir}`);

if (fs.existsSync(contentDir)) {
    migrateDirectory(contentDir);
    console.log('\n✨ Migração concluída com sucesso!');
} else {
    console.error(`❌ Erro: O caminho "${contentDir}" não existe.`);
}