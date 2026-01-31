import fs from 'fs';
import path from 'path';

const targetContentDir = process.argv[2];
const sourceAssetsDir = process.argv[3];

if (!targetContentDir || !sourceAssetsDir) {
    console.error('❌ Erro: Informe os caminhos.');
    console.log('Uso: node migrate-v4.js <content-path> <assets-source-path>');
    process.exit(1);
}

const contentDir = path.resolve(targetContentDir);
const assetsDir = path.resolve(sourceAssetsDir);

// REGEX ATUALIZADO V4:
// Agora aceita caminhos com OU sem /images/
// Grupo 1: O contexto (- , : , src=, ]()
// Grupo 2: O arquivo (pode começar com /images/, images/, ou direto o nome do arquivo, mas tem que ter extensão de imagem)
const globalImageRegex = /(!\[.*?\]\(|src=["']|- |: )((?:\/?images\/)?.*?\.(jpg|jpeg|png|gif|webp|svg))/gi;

function migrateDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        let fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            migrateDirectory(fullPath);
        } else if (item.endsWith('.md')) {
            // Lógica de migração de pasta (mantida igual)
            const isIndex = item === '_index.md' || item === 'index.md';
            let workingDir = dir;
            
            if (!isIndex) {
                const folderName = item.replace('.md', '');
                const newFolderPath = path.join(dir, folderName);
                if (!fs.existsSync(newFolderPath)) fs.mkdirSync(newFolderPath, { recursive: true });
                const newFilePath = path.join(newFolderPath, '_index.md');
                try {
                    fs.renameSync(fullPath, newFilePath);
                    fullPath = newFilePath;
                    workingDir = newFolderPath;
                } catch (e) {
                    console.log(`  Info: ${item} já parece ter sido movido ou erro de acesso.`);
                }
            } else if (item === 'index.md') {
                const newPath = path.join(dir, '_index.md');
                fs.renameSync(fullPath, newPath);
                fullPath = newPath;
            }

            // --- LÓGICA DE IMAGENS REFINADA ---
            let content = fs.readFileSync(fullPath, 'utf8');
            let match;
            let hasChanges = false;
            
            globalImageRegex.lastIndex = 0;

            while ((match = globalImageRegex.exec(content)) !== null) {
                const fullMatch = match[0]; // ex: "- 123.jpg" ou "- /images/123.jpg"
                const prefix = match[1];    // ex: "- "
                const rawPath = match[2];   // ex: "123.jpg" ou "/images/123.jpg"

                if (!rawPath) continue;

                // 1. Normalização: Independente se veio "/images/foto.jpg" ou "foto.jpg",
                // nós pegamos apenas "foto.jpg" para procurar na pasta de origem.
                const fileName = path.basename(rawPath).split('?')[0]; 
                const sourceFile = path.join(assetsDir, fileName);
                
                // Verifica se o arquivo existe na pasta de origem de imagens
                if (fs.existsSync(sourceFile)) {
                    const destFile = path.join(workingDir, fileName);

                    // Copia para a pasta do conteúdo
                    if (!fs.existsSync(destFile)) {
                        try {
                            fs.copyFileSync(sourceFile, destFile);
                            console.log(`  📸 Recuperado: ${fileName} (estava em ${rawPath})`);
                        } catch (e) {
                            console.error(`  ❌ Erro copia ${fileName}:`, e.message);
                        }
                    }

                    // ATUALIZAÇÃO DO TEXTO
                    // Se o caminho original já era apenas o nome do arquivo, tecnicamente não mudou nada,
                    // mas garantimos que fique padronizado sem "/images/"
                    if (rawPath !== fileName) {
                        const newString = `${prefix}${fileName}`;
                        // Replace apenas na ocorrência exata
                        content = content.replace(fullMatch, newString);
                        hasChanges = true;
                    }
                } else {
                    // Opcional: Logar apenas se parecer um caminho quebrado real
                    // console.warn(`  ⚠️  Arquivo não encontrado na origem: ${fileName}`);
                }
            }

            if (hasChanges) {
                fs.writeFileSync(fullPath, content);
                console.log(`  💾 Atualizado: ${path.basename(fullPath)}`);
            }
        }
    });
}

console.log(`🚀 Script V4: O Caçador Universal`);
console.log(`📂 Content: ${contentDir}`);
console.log(`🖼️ Assets: ${assetsDir}`);

migrateDirectory(contentDir);
console.log('\n✨ Concluído!');