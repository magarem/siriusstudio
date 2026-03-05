export default defineNuxtRouteMiddleware((to, from) => {
  // ======================================================================
  // O SEGREDO DO NUXT 3: Forçar a leitura como texto (evita quebra de JSON)
  // ======================================================================
  const siteContext = useCookie('cms_site_context', {
    decode: (value) => decodeURIComponent(value)
  });
  
  const authToken = useCookie('auth_token', {
    decode: (value) => decodeURIComponent(value)
  });

  const requestedSite = to.query.site as string;
  const isProtectedRoute = to.path.startsWith('/editor');

  // ======================================================================
  // 1. PROTEÇÃO DO EDITOR (Sem cookie -> Login)
  // ======================================================================
  if (isProtectedRoute && (!siteContext.value || !authToken.value)) {
    return navigateTo({
      path: '/login',
      query: {
        site: requestedSite || '',
        redirect: to.query.path || ''
      }
    });
  }

  // ======================================================================
  // 2. CONFLITO DE SESSÃO (Logado em A, pediu B)
  // ======================================================================
  if (siteContext.value && requestedSite && requestedSite !== siteContext.value) {
    if (to.path === '/login') return; 

    // Mata a sessão se tentou invadir outro site
    siteContext.value = null; 
    authToken.value = null;
    
    return navigateTo({
      path: '/login',
      query: {
        site: requestedSite,
        redirect: to.query.path || ''
      }
    });
  }

  // ======================================================================
  // 3. JÁ LOGADO (No Login -> Editor)
  // ======================================================================
  if (to.path === '/login' && siteContext.value && authToken.value) {
    if (!requestedSite || requestedSite === siteContext.value) {
        const targetPath = to.query.redirect || 'content';
        
        return navigateTo({
          path: '/editor',
          query: { 
            site: siteContext.value, 
            path: targetPath 
          }
        });
    }
  }
});