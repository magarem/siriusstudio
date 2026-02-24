// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // 1. Lê o cookie (seu "crachá" de acesso público)
  const siteContext = useCookie('cms_site_context');
  
  // 2. Verifica se a URL está pedindo um site específico (vindo do atalho)
  const requestedSite = to.query.domain;

  // ======================================================================
  // NOVO CASO: Conflito de Sessão (Tentou editar o Site B estando logado no Site A)
  // ======================================================================
  if (siteContext.value && requestedSite && requestedSite !== siteContext.value) {
    console.warn(`[Auth] Sessão do ${siteContext.value} invalidada. Redirecionando para login do ${requestedSite}`);
    
    // Limpa o crachá atual do frontend
    siteContext.value = null;

    // Redireciona para o login passando o novo domínio
    return navigateTo({
      path: '/login',
      query: {
        domain: requestedSite,             // Passa o nome para preencher o input do login
        redirect: to.query.path || ''      // Salva o arquivo que ele queria editar
      }
    });
  }

  // ======================================================================
  // CASO 1: Tentou entrar no Editor SEM cookie -> Manda pro Login
  // ======================================================================
  const isProtectedRoute = to.path.startsWith('/editor');
  
  if (isProtectedRoute && !siteContext.value) {
    return navigateTo({
      path: '/login',
      query: {
        domain: requestedSite,        // Se veio do atalho, repassa para o form
        redirect: to.query.path || '' // Repassa o path
      }
    });
  }

  // ======================================================================
  // CASO 2: Tentou entrar no Login JÁ TENDO cookie -> Manda pro Editor
  // ======================================================================
  if (to.path === '/login' && siteContext.value) {
    // Como ele já está logado, garantimos que a URL mostre o site correto do cookie
    return navigateTo({
      path: '/editor',
      query: { 
        site: siteContext.value, 
        path: to.query.redirect || 'content/_index.md' // Usa redirect se existir, senão default
      }
    });
  }
});