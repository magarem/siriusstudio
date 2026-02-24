// server/api/config.get.ts
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  console.log("🚀 ~ config:", config)
  
  // 1. Chaves internas do Nuxt que nunca devem ser enviadas
  const blacklistedKeys = ['public', 'app', 'nitro']
  
  const dynamicConfig = {}
  
  Object.keys(config).forEach(key => {
    // 2. Normalizamos a chave para minúsculo para garantir que 
    // "SECRET_KEY", "secretKey" ou "MySecret" sejam todos pegos pelo filtro
    const lowerKey = key.toLowerCase()

    // 3. Só adicionamos se não estiver na blacklist fixa E não contiver "secret"
    if (!blacklistedKeys.includes(key) && !lowerKey.includes('secret')) {
      dynamicConfig[key] = config[key]
    }
  })

  return dynamicConfig
})