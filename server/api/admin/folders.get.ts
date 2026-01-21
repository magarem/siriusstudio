import { readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

export default defineEventHandler(async (event) => {
  const { site } = getQuery(event);
  if (!site) return [];

  const APPS_ROOT = resolve(process.cwd(), '..');
  const baseDir = join(APPS_ROOT, 'storage', site as string);

  
  // Função recursiva para varrer pastas
  const getAllDirs = (dirPath: string, base = '') => {
    let results: string[] = [];
    
    try {
      const items = readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.')) {
          const relativePath = base ? `${base}/${item.name}` : item.name;
          results.push(relativePath);
          
          // Entra na subpasta para procurar mais (Recursão)
          const subDirs = getAllDirs(join(dirPath, item.name), relativePath);
          results = results.concat(subDirs);
        }
      }
    } catch (e) {
      console.error("Erro ao ler diretório:", dirPath);
    }
    
    return results;
  };

  return getAllDirs(baseDir).sort();
});