export async function useSmartContent(path: string) {
  const route = useRoute();
  const url = useRequestURL();
  // Verifica se o hostname começa com 'preview.'
  // Ex: preview.localhost ou preview.meusite.com
  const isPreviewSubdomain = url.hostname.startsWith('preview.');
  
  // Mantemos a query string como fallback (opcional)
  const isPreviewQuery = route.query.preview === 'true';

  // O modo Preview está ativo se vier pelo subdomínio OU pela query
  const isPreview = isPreviewSubdomain || isPreviewQuery;

  const cleanPath = path === '/' ? 'index' : path.replace(/^\//, '').replace(/\/$/, '');
  const key = `page-${cleanPath}-${isPreview ? 'preview' : 'prod'}`;

  // DECISÃO DE ROTA:
  // Preview -> Vai buscar o MD lá no storage e compilar agora.
  // Prod -> Busca o JSON já pronto na pasta do servidor.
  const endpoint = isPreview 
    ? `/api/preview/${cleanPath}` 
    : `/api/page/${cleanPath}`;

  const { data: rawData, status, error, refresh } = await useFetch(endpoint, {
    key: `page-${cleanPath}-${new Date().getTime()}`,
    // Cache Busting: No preview, sempre queremos a versão mais recente (timestamp)
    // Em produção, deixamos o cache padrão ou controlamos via build id
    query: isPreview ? { v: new Date().getTime() } : {},
  });

  const content = computed<NormalizedContent | null>(() => {
    if (!rawData.value) return null;
    const raw = rawData.value as any;
    
    // Mescla dados (O parser do preview retorna igual ao do compile-all)
    const frontmatter = { ...(raw.data || {}), ...(raw.meta || {}) };

    return {
      title: frontmatter.title || raw.title || 'Sem Título',
      body: raw.body,
      meta: frontmatter,
      path: raw._path || path
    };
  });

  return { data: content, status, error, refresh };
}