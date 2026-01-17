// composables/useSmartContent.ts

interface NormalizedContent {
  title: string;
  body: any;
  // Mantemos o nome da chave "meta" no retorno para não quebrar seus templates atuais (v-if="page.meta.images")
  // Mas internamente não buscamos mais de 'raw.meta'
  meta: Record<string, any>; 
  path: string;
}

export async function useSmartContent(path: string) {
  const route = useRoute();
  const url = useRequestURL();
  
  // 1. LÓGICA DE DETECÇÃO (Preview vs Prod)
  const isPreviewSubdomain = url.hostname.startsWith('preview.');
  const isPreviewQuery = route.query.preview === 'true';
  const isPreview = isPreviewSubdomain || isPreviewQuery;

  const cleanPath = path === '/' ? 'index' : path.replace(/^\//, '').replace(/\/$/, '');
  
  // Endpoint dinâmico
  const endpoint = isPreview 
    ? `/api/preview/${cleanPath}` 
    : `/api/page/${cleanPath}`;

  // 2. FETCH
  const { data: rawData, status, error, refresh } = await useFetch(endpoint, {
    // Adicionei o hostname na chave para separar cache de Prod vs Preview
    key: `page-${url.hostname}-${cleanPath}`,
    // Cache Busting apenas no preview
    query: isPreview ? { v: new Date().getTime() } : {},
  });

  // 3. NORMALIZAÇÃO (Aqui fizemos a limpeza)
  const content = computed<NormalizedContent | null>(() => {
    if (!rawData.value) return null;
    const raw = rawData.value as any;
    
    // [LIMPEZA] 
    // O parser MDC retorna o frontmatter em 'raw.data'.
    // Seus JSONs compilados provavelmente também seguem isso ou estão na raiz.
    // Não precisamos mais checar 'raw.meta'.
    
    // Tenta pegar de 'data', se não existir, assume que o raw é o próprio objeto (fallback)
    const frontmatter = raw.data || raw;

    return {
      title: frontmatter.title || 'Sem Título',
      body: raw.body,
      // Continuamos retornando como 'meta' para manter compatibilidade com seus <template>
      // Ex: banner1.meta.full_banner_middle
      ...frontmatter,
      meta: frontmatter,
      path: raw._path || path,

    };
  });

  return { data: content, status, error, refresh };
}