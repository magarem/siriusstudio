import { promises as fs } from 'node:fs';
import { resolve, join } from 'node:path';

const DATA_ROOT = resolve(process.cwd(), 'server/data');

export default defineEventHandler(async (event) => {
  try {
    const metaPath = join(DATA_ROOT, '_meta.json');
    const content = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // Se não existir (primeira vez), retorna vazio
    return {};
  }
});