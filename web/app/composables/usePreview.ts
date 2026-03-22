// composables/usePreview.ts

export const usePreview = () => {
  // 1. Pega a URL atual (Funciona no Server e no Client)
  const url = useRequestURL(); 
  
  // 2. O ESTADO (Computed)
  // O preview está ativo se o hostname começar com "preview."
  // Também mantivemos suporte a query param ?preview=true como fallback
  const isEnabled = computed(() => {
    return url.hostname.startsWith('preview.') || url.searchParams.get('preview') === 'true';
  });

  // 3. ATIVAR (Redireciona para o subdomínio)
  const enable = () => {
    // Só roda no navegador
    if (import.meta.client) {
      const currentHost = window.location.hostname;

      // Se já estiver no preview, não faz nada
      if (currentHost.startsWith('preview.')) return;

      // Monta a nova URL (mantém porta, path e query)
      // Remove 'www.' para evitar 'preview.www.'
      const cleanHost = currentHost.replace(/^www\./, '');
      const newHost = `preview.${cleanHost}`;
      
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const path = window.location.pathname;
      const search = window.location.search;

      // Redirecionamento total (Reload)
      window.location.href = `${protocol}//${newHost}${port}${path}${search}`;
    }
  };

  // 4. DESATIVAR (Remove o subdomínio)
  const disable = () => {
    if (import.meta.client) {
      const currentHost = window.location.hostname;

      // Se não estiver no preview, não faz nada
      if (!currentHost.startsWith('preview.')) return;

      // Remove o prefixo "preview."
      const newHost = currentHost.replace(/^preview\./, '');
      
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const path = window.location.pathname;
      const search = window.location.search;

      window.location.href = `${protocol}//${newHost}${port}${path}${search}`;
    }
  };

  return {
    isEnabled,
    enable, 
    disable
  };
}