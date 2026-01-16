// server/api/content.get.ts
export default defineEventHandler(async (event) => {
  // Acessa via useNuxtApp()
  const { $content } = useNuxtApp()
  
  const content = await $content.query()
    .find()
  
  return content
})