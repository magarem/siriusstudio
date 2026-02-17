export default defineNuxtRouteMiddleware((to, from) => {
  // 1. Lê o cookie (seu "crachá" de acesso)
  const siteContext = useCookie('cms_site_context');

  // 2. Define quais rotas são protegidas
  // Qualquer coisa que comece com /edit é restrita
  const isProtectedRoute = to.path.startsWith('/edit');

  // CASO 1: Tentou entrar no Editor SEM cookie -> Manda pro Login
  if (isProtectedRoute && !siteContext.value) {
    // AbortNavigation impede que a rota atual carregue antes do redirect
    return navigateTo('/login');
  }

  // CASO 2: Tentou entrar no Login JÁ TENDO cookie -> Manda pro Editor
  // (Melhora a experiência, evita login duplo)
  if (to.path === '/login' && siteContext.value) {
    return navigateTo('/editor?path=content');
  }
});