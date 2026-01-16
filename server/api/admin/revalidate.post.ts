// server/api/revalidate.post.ts
export default defineEventHandler(async (event) => {
  const { path, secret } = await readBody(event)

  // Segurança básica (use env var no seu CMS)
  // if (secret !== process.env.REVALIDATE_SECRET) {
  //   throw createError({ statusCode: 401, message: 'Unauthorized' })
  // }

  // Tenta limpar cache da rota específica (funciona com nitro cache fs)
  const nitro = useNitroApp()
  await nitro.hooks.callHook('nitro:cache:clear', { key: `route:${path}` })

  // Ou force uma requisição interna pra popular o cache novo
  await $fetch(path, { baseURL: 'http://localhost:3001' }) // ajuste porta

  return { revalidated: true, path }
})