// server/api/list.ts
import { promises as fs } from 'node:fs';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import yaml from 'js-yaml';

const DATA_ROOT = resolve(process.cwd(), 'server/data');

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  let section = query.section as string;

  if (!section) return [];

  // Remove prefixo "content/" e barras iniciais
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

    // --- LÓGICA DE ORDENAÇÃO: PREPARAÇÃO ---
    const orderFilePath = join(dirPath, '_order.yml');
    let orderMap = new Map<string, number>();

    if (existsSync(orderFilePath)) {
      try {
        const fileContent = readFileSync(orderFilePath, 'utf-8');
        const loaded = yaml.load(fileContent) as string[];

        if (Array.isArray(loaded)) {
          // Cria mapa: { 'nome-do-arquivo': index }
          // Removemos extensões (.md, .json) para garantir o match
          orderMap = new Map(loaded.map((name, index) => {
            const cleanName = name.replace(/\.[^/.]+$/, ""); 
            return [cleanName, index];
          }));
        }
      } catch (e) {
        console.warn(`Erro ao ler _order.yml em ${section}`, e);
      }
    }

    // 3. Lê o conteúdo dos arquivos
    const items = await Promise.all(jsonFiles.map(async (dirent) => {
      try {
        const content = await fs.readFile(join(dirPath, dirent.name), 'utf-8');
        const json = JSON.parse(content);
        
        const meta = { ...(json.data || {}), ...(json.meta || {}) };
        
        // Nome base do arquivo sem extensão
        const fileNameNoExt = dirent.name.replace('.json', ''); 
        const webPath = `/${section}/${fileNameNoExt}`.replace(/\/+/g, '/');

        return {
          title: meta.title || json.title || fileNameNoExt,
          description: meta.description || '',
          image: meta.images?.[0] || meta.topimages?.[0] || null,
          path: webPath,
          key: webPath,
          // Propriedade temporária para ordenação
          _fileName: fileNameNoExt 
        };
      } catch (e) {
        return null;
      }
    }));

    // Filtra nulos
    const validItems = items.filter((item): item is NonNullable<typeof item> => Boolean(item));

    // 4. APLICA A ORDENAÇÃO FINAL
    validItems.sort((a, b) => {
      // Tenta pegar o índice no mapa. Se não existir, define como 9999 (fim da fila)
      const indexA = orderMap.has(a._fileName) ? orderMap.get(a._fileName)! : 9999;
      const indexB = orderMap.has(b._fileName) ? orderMap.get(b._fileName)! : 9999;

      // 1º Critério: Ordem definida no YAML
      if (indexA !== indexB) {
        return indexA - indexB;
      }

      // 2º Critério (Empate ou itens fora do YAML): Ordem alfabética pelo Título
      const titleA = (a.title || "").toLowerCase();
      const titleB = (b.title || "").toLowerCase();
      return titleA.localeCompare(titleB);
    });

    // 5. Limpeza Final (Remove a propriedade auxiliar _fileName antes de enviar)
    return validItems.map(({ _fileName, ...rest }) => rest);

  } catch (error) {
    console.error("Erro no list.ts:", error);
    return [];
  }
});