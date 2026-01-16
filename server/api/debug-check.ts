export default defineEventHandler(async () => {
  // Pede para o driver 'content' listar as chaves que ele vê
  const storage = useStorage('content');
  const keys = await storage.getKeys();
  
  return {
    total_files: keys.length,
    files: keys.slice(0, 5), // Mostra os 5 primeiros
    storage_base: process.env.STORAGE_PATH || 'Hardcoded in config'
  }
})