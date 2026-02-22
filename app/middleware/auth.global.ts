export default defineNuxtRouteMiddleware((to, from) => {
  // 1. Lê o cookie (seu "crachá" de acesso)
  const siteContext = useCookie('cms_site_context');

  // 2. Define quais rotas são protegidas
  const isProtectedRoute = to.path.startsWith('/edit');

  // CASO 1: Tentou entrar no Editor SEM cookie -> Manda pro Login
  if (isProtectedRoute && !siteContext.value) {
    // 🚀 A MÁGICA ACONTECE AQUI: Repassa a query original para o Login
    return navigateTo({
      path: '/login',
      query: to.query // Mantém o ?site=... e o ?path=... vivos!
    });
  }

  // CASO 2: Tentou entrar no Login JÁ TENDO cookie -> Manda pro Editor
  if (to.path === '/login' && siteContext.value) {
    // Se ele já estava tentando ir para um caminho específico, respeita.
    // Senão, manda para a raiz do content.
    const targetPath = to.query.path || 'content';
    
    return navigateTo({
      path: '/editor',
      query: { path: targetPath }
    });
  }
});