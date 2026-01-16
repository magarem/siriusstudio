export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = getHeader(event, 'authorization')
  const config = useRuntimeConfig(event)
  
  // Validar token
  if (token !== `Bearer ${config.webhookSecret}`) {
    throw createError({ 
      statusCode: 401,
      message: 'Não autorizado' 
    })
  }
  
  const { path, paths } = body
  
  // Aceita um path ou múltiplos paths
  const pathsToInvalidate = paths || (path ? [path] : [])
  
  if (pathsToInvalidate.length === 0) {
    throw createError({ 
      statusCode: 400,
      message: 'Path ou paths são obrigatórios' 
    })
  }
  
  const results = []
  
  try {
    // Pegar storage do cache
    const cacheStorage = useStorage('cache')
    
    for (const p of pathsToInvalidate) {
      try {
        // Diferentes formatos de chave de cache que podem existir
        const cacheKeys = [
          `nitro:routes:${p}.html`,
          `nitro:routes:${p}`,
          `nitro:handlers:${p}.html`,
          `nitro:handlers:${p}`,
          `content:parsed:${p}.md`,
          `content:${p}`,
        ]
        
        let removedCount = 0
        
        // Tentar remover todas as variações
        for (const key of cacheKeys) {
          try {
            await cacheStorage.removeItem(key)
            removedCount++
          } catch (e) {
            // Ignora se a chave não existir
          }
        }
        
        results.push({ 
          path: p, 
          success: true,
          invalidated: true,
          keysRemoved: removedCount
        })
        
        console.log(`✅ Cache invalidado: ${p} (${removedCount} chaves removidas)`)
        
      } catch (error) {
        results.push({ 
          path: p, 
          success: false, 
          error: error.message 
        })
        
        console.error(`❌ Erro ao invalidar ${p}:`, error)
      }
    }
    
    // IMPORTANTE: Também limpar cache do Content
    try {
      const contentStorage = useStorage('content')
      await contentStorage.clear()
      console.log('✅ Cache do Content limpo')
    } catch (e) {
      console.warn('⚠️  Não foi possível limpar cache do Content:', e.message)
    }
    
    return { 
      success: true,
      results,
      total: results.length,
      invalidated: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: `Erro ao invalidar cache: ${error.message}`
    })
  }
})