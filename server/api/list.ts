// server/api/list.ts
import { promises as fs } from 'node:fs';
import { existsSync, readFileSync } from 'node:fs'; // Importações síncronas para checagens rápidas
import { resolve, join } from 'node:path';
import yaml from 'js-yaml'; // <--- IMPORTANTE: Instalar js-yaml se não tiver tipos

const DATA_ROOT = resolve(process.cwd(), 'server/data');

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let section = query.section as string;

  if (!section) return [];

  // Remove prefixo "content/"
  section = section.replace(/^content\/?/, '').replace(/^\//, '');

  const dirPath = join(DATA_ROOT, section);

  try {
    // 1. Lê a pasta
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    // 2. Filtra apenas arquivos .json
    const jsonFiles = files.filter(dirent => 
      !dirent.isDirectory() && 
      dirent.name.endsWith('.json') && 
      dirent.name !== 'index.json'
    );

    // --- NOVA LÓGICA DE ORDENAÇÃO (INÍCIO) ---
    const orderFilePath = join(dirPath, '_order.yml');
    let orderMap = new Map<string, number>();

    if (existsSync(orderFilePath)) {
      try {
        const fileContent = readFileSync(orderFilePath, 'utf-8');
        const loaded = yaml.load(fileContent) as string[];

        if (Array.isArray(loaded)) {
          // Cria mapa: { 'nome-do-arquivo-sem-extensao': index }
          // Ex: se o YAML tem 'meu-post.md', salvamos a chave 'meu-post'
          orderMap = new Map(loaded.map((name, index) => {
            const cleanName = name.replace(/\.[^/.]+$/, ""); // Remove .md ou .json
            return [cleanName, index];
          }));
        }
      } catch (e) {
        console.warn(`Erro ao ler _order.yml em ${section}`, e);
      }
    }
    // --- NOVA LÓGICA DE ORDENAÇÃO (FIM) ---

    // 3. Lê o conteúdo
    const items = await Promise.all(jsonFiles.map(async (dirent) => {
      try {
        const content = await fs.readFile(join(dirPath, dirent.name), 'utf-8');
        const json = JSON.parse(content);
        
        const meta = { ...(json.data || {}), ...(json.meta || {}) };
        
        // Nome base do arquivo sem extensão (ex: 'festival-indiano')
        const fileNameNoExt = dirent.name.replace('.json', ''); 
        const webPath = `/${section}/${fileNameNoExt}`.replace(/\/+/g, '/');

        return {
          title: meta.title || json.title || fileNameNoExt,
          description: meta.description || '',
          image: meta.images?.[0] || meta.topimages?.[0] || null,
          path: webPath,
          key: webPath,
          _fileName: fileNameNoExt // Guardamos o nome puro para usar na ordenação
        };
      } catch (e) {
        return null;
      }
    }));

    const validItems = items.filter((item): item is NonNullable<typeof item> => Boolean(item));

    // 4. Aplica a Ordenação Final
    validItems.sort((a, b) => {
      // Busca a posição no mapa usando o nome do arquivo (sem extensão)
      const indexA = orderMap.has(a._fileName) ? orderMap.get(a._fileName)! : 9999;
      const indexB = orderMap.has(b._fileName) ? orderMap.get(b._fileName)! : 9999;

      // Se um deles tiver ordem definida no YAML, respeita
      if (indexA !== 9999 || indexB !== 9999) {
        return indexA - indexB;
      }

      // Fallback: Ordem alfabética pelo título ou nome do arquivo
      return a.title.localeCompare(b.title);
    });

    return validItems;

  } catch (error) {
    return [];
  }
});