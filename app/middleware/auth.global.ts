// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const siteContext = useCookie('cms_site_context');
  
  // Captura o site de ?site= ou ?domain=
  const requestedSite = to.query.site || to.query.domain;
  const isProtectedRoute = to.path.startsWith('/editor');

  // ======================================================================
  // 1. CONFLITO DE SESSÃO (Logado em A, pediu B)
  // ======================================================================
  if (siteContext.value && requestedSite && requestedSite !== siteContext.value) {
    // "Mata" a sessão no front imediatamente
    siteContext.value = null; 
    
    // Trava de segurança: Se o redirecionamento já está indo para a tela de login
    // com o domínio do novo site (B), nós "deixamos passar" para evitar loop.
    if (to.path === '/login' && to.query.domain === requestedSite) {
        return; 
    }

    // Se não, forçamos o redirecionamento para o login do site novo
    return navigateTo({
      path: '/login',
      query: {
        domain: requestedSite,
        redirect: to.query.path || ''
      }
    });
  }

  // ======================================================================
  // 2. PROTEÇÃO DO EDITOR (Sem cookie -> Login)
  // ======================================================================
  if (isProtectedRoute && !siteContext.value) {
    return navigateTo({
      path: '/login',
      query: {
        domain: requestedSite,
        redirect: to.query.path || ''
      }
    });
  }

  // ======================================================================
  // 3. JÁ LOGADO (No Login -> Editor)
  // ======================================================================
  if (to.path === '/login' && siteContext.value) {
    // Só redirecionamos para o editor se o usuário NÃO estiver tentando
    // acessar especificamente um domínio diferente do que ele está logado.
    if (!requestedSite || requestedSite === siteContext.value) {
        const targetPath = to.query.redirect || 'content/_index.md';
        
        return navigateTo({
          path: '/editor',
          query: { 
            site: siteContext.value, // ERRO CORRIGIDO: antes estava 'domain:'
            path: targetPath 
          }
        });
    }
  }
});