// composables/useSiteEnv.ts
export const useSiteEnv = async () => {
  // O Nuxt guarda o resultado no cache (payload), então só busca uma vez
  const { data } = await useFetch('/api/config', {
    key: 'server-runtime-config'
  })
  return data
}