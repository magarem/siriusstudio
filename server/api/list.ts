import { promises as fs } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const DATA_ROOT = resolve(process.cwd(), 'server/data');

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let section = query.section as string;

  if (!section) return [];

  // Remove prefixo "content/" se vier (ex: "content/eventos" -> "eventos")
  section = section.replace(/^content\/?/, '').replace(/^\//, '');

  const dirPath = join(DATA_ROOT, section);

  try {
    // 1. Lê a pasta
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    // 2. Filtra apenas arquivos .json (ignorando index.json da própria pasta)
    const jsonFiles = files.filter(dirent => 
      !dirent.isDirectory() && 
      dirent.name.endsWith('.json') && 
      dirent.name !== 'index.json'
    );

    // 3. Lê o conteúdo de cada um para pegar Título e Imagem
    const items = await Promise.all(jsonFiles.map(async (dirent) => {
      try {
        const content = await fs.readFile(join(dirPath, dirent.name), 'utf-8');
        const json = JSON.parse(content);
        
        // Pega metadados (Frontmatter está em 'data' ou 'meta')
        const meta = { ...(json.data || {}), ...(json.meta || {}) };
        
        // Caminho web (ex: /eventos/festival-indiano)
        const slug = dirent.name.replace('.json', '');
        const webPath = `/${section}/${slug}`.replace(/\/+/g, '/');

        return {
          title: meta.title || json.title || slug,
          description: meta.description || '',
          // Normaliza imagem (pega a primeira disponível)
          image: meta.images?.[0] || meta.topimages?.[0] || null,
          path: webPath,
          key: webPath
        };
      } catch (e) {
        return null;
      }
    }));

    // Retorna filtrando nulos e limitando quantidade (se quiser, pode passar limit na query)
    return items.filter(Boolean);

  } catch (error) {
    // Se a pasta não existir ou estiver vazia
    return [];
  }
});