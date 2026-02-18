export default defineEventHandler((event) => {
  deleteCookie(event, 'cms_site_context')
  return { success: true }
})