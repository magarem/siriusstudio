import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import matter from 'gray-matter'; // Adicione esta importação

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  
  const site = query.site ? String(query.site) : null;
  const folder = query.folder ? String(query.folder) : null;
  const file = query.file ? String(query.file) : null;

  if (!site || !folder) {
    throw createError({
      statusCode: 400,
      statusMessage: `Parâmetros inválidos. Recebido site: ${site}, folder: ${folder}`,
    });
  }

  // const APPS_ROOT = resolve('/Users/marceloamagalhaes/desenv/apps');
  // const APPS_ROOT = resolve(config.storagePath)
  // const targetDir = join(APPS_ROOT, 'storage', site, folder);

// Verifica se a config existe, se não, usa o diretório atual como fallback
  const APPS_ROOT = config.storagePath ? resolve(config.storagePath) : process.cwd();
  console.log('APPS_ROOT definido como:', APPS_ROOT);
  // Sua lógica de join está perfeita
  const targetDir = join(APPS_ROOT, 'storage', site, folder);


  if (!existsSync(targetDir)) {
    return [];
  }

  try {
    // CASO A: Leitura de um arquivo específico (Modo Edição/Detalhe)
    if (file) {
      const filePath = join(targetDir, file);
      if (!existsSync(filePath)) throw new Error('Arquivo não encontrado');
      
      const content = readFileSync(filePath, 'utf-8');
      return {
        name: file,
        content: content
      };
    }

    // CASO B: Listagem de Diretório (O que o List.vue usa)
    const items = readdirSync(targetDir, { withFileTypes: true });
    
    return items
      .filter(item => !item.name.startsWith('.') && item.name !== 'index.md')
      .map(item => {
        const isDirectory = item.isDirectory();
        let metadata = {};

        // Se for um arquivo Markdown, abrimos para ler as imagens do frontmatter
        if (!isDirectory && item.name.endsWith('.md')) {
          try {
            const filePath = join(targetDir, item.name);
            const fileRaw = readFileSync(filePath, 'utf-8');
            
            // O gray-matter extrai o title, imagens, etc.
            const { data } = matter(fileRaw);
            
            metadata = {
              title: data.title || item.name.replace('.md', ''),
              // Aqui está o ajuste das imagens que você pediu:
              images: data.images || (data.image ? [data.image] : []),
              description: data.description || ''
            };
          } catch (e) {
            console.error(`Erro ao ler metadados de ${item.name}`);
          }
        }

        return {
          name: item.name,
          isDirectory,
          data: metadata // O componente List.vue agora terá acesso a file.data.images
        };
      });

  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao acessar o storage: ' + error.message,
    });
  }
});