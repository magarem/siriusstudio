import fs from 'node:fs/promises'
import path from 'node:path'
import { resolve, join, dirname } from 'node:path';
import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { site, folder, schema } = getQuery(event)

  // Validação básica
  if (!site || !schema) {
    return { types: {}, mapping: {} }
  }

  const APPS_ROOT = config.storagePath ? resolve(config.storagePath) : process.cwd();
  const siteRoot = join(APPS_ROOT, 'storage', String(site));
  
  const schemaStr = String(schema);

  // --- LÓGICA NOVA: CAMINHO DIRETO ---
  // Verifica se o schema passado já é um path completo (tem barras ou termina em .json)
  if (schemaStr.includes('/') || schemaStr.endsWith('.json')) {
    
    // Remove a barra inicial se houver (para o join funcionar corretamente com siteRoot)
    // Transforma "/content/..." em "content/..."
    const relativePath = schemaStr.startsWith('/') ? schemaStr.substring(1) : schemaStr;
    
    // Garante a extensão .json caso não tenha
    const finalPath = relativePath.endsWith('.json') ? relativePath : `${relativePath}.json`;
    
    const absoluteSchemaPath = join(siteRoot, finalPath);

    try {
      console.log('🎯 Buscando schema por caminho direto:', absoluteSchemaPath);
      const fileContent = await fs.readFile(absoluteSchemaPath, 'utf-8');
      const parsedSchema = JSON.parse(fileContent);
      return parsedSchema;
    } catch (e) {
      console.error('❌ Erro ao ler schema direto:', e.message);
      return { types: {}, mapping: {}, error: 'Schema not found at specific path' };
    }
  }

  // --- LÓGICA ANTIGA: BUBBLING UP (HIERARQUIA) ---
  // Só executa se o schema for apenas um nome simples (ex: "default")
  
  // 1. Define o ponto de partida. 
  let currentPath = String(folder).replace("/_index.md", "");
  let foundSchema = null;

  // 2. Loop de busca ascendente
  while (currentPath !== '.' && currentPath !== '/') {
    
    // Constrói o caminho potencial: .../storage/site/pasta/_schemas/tipo.json
    const potentialSchemaPath = join(siteRoot, currentPath, '_schemas', schemaStr + '.json');
    
    try {
      // Tenta ler o status do arquivo
      await fs.stat(potentialSchemaPath);
      
      // Se existe, lê e retorna
      const fileContent = await fs.readFile(potentialSchemaPath, 'utf-8');
      foundSchema = JSON.parse(fileContent);
      console.log('✅ Schema encontrado na hierarquia em:', potentialSchemaPath);
      break; 

    } catch (e) {
      // Sobe um nível
      const parent = dirname(currentPath);

      if (parent === currentPath) break;
      if (!currentPath.includes('content') && parent !== 'content') break;

      currentPath = parent;
    }
  }

  // 3. Retorno da busca hierárquica
  if (foundSchema) {
    return foundSchema;
  } else {
    console.log('❌ Schema não encontrado em nenhum nível pai.');
    return { types: {}, mapping: {}, error: 'Schema not found in hierarchy' };
  }
})