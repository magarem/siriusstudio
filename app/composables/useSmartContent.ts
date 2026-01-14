// composables/useSmartContent.ts

// Define os estados possíveis da requisição para controle de UI
type SmartContentStatus =
  | 'loading'
  | 'collection' // Veio do Cache/Banco (Rápido)
  | 'disk'       // Veio do Arquivo Real (Lento/Fresco)
  | 'error'

/**
 * NORMALIZADOR DE CONTEÚDO
 * Unifica a estrutura de dados vinda do Nuxt Content (Collection/DB) 
 * e do Sistema de Arquivos (Disk/API) para um formato padrão.
 * * Saída Padrão:
 * {
 * title: "...",
 * body: { ... },
 * path: "...",
 * meta: { images: [], topimages: [], category: "...", etc }
 * }
 */
function normalizeContent(raw: any) {
  if (!raw) return null;

  // No parseMarkdown (Disk), os dados frontmatter ficam dentro de 'data'.
  // No queryCollection (Prod), eles podem estar na raiz ou misturados.
  const rawData = raw.data || {};
  const source = { ...raw, ...rawData };

  // Chaves que o Nuxt Content usa na raiz e queremos manter lá
  const protectedKeys = [
    'body', 'bodyHtml', 'excerpt', 
    '_id', '_path', '_file', '_draft', '_type', '_extension', 
    'title', 'description', 'path', 'id', 'seo'
  ];

  const normalized: any = {
    meta: {} // Campos personalizados vão para cá
  };

  // Separa o joio do trigo
  Object.keys(source).forEach(key => {
    // Ignora as chaves originais de processamento para não duplicar
    if (key === 'data' || key === 'meta') return;

    if (protectedKeys.includes(key)) {
      normalized[key] = source[key];
    } else {
      // Campos customizados (topimages, icon, tags, etc)
      normalized.meta[key] = source[key];
    }
  });

  // Se já existia um objeto meta vindo da fonte, mescla para não perder nada
  if (raw.meta && typeof raw.meta === 'object') {
    normalized.meta = { ...normalized.meta, ...raw.meta };
  }

  return normalized;
}

export async function useSmartContent(path: string) {
  const config = useRuntimeConfig()
  const siteName = config.public.siteName
  
  // 1. INTEGRAÇÃO COM MODO PREVIEW
  // O composable usePreview (auto-importado) verifica o Cookie.
  // Também checamos a config global 'liveContent' para casos de SaaS puro.
  const { isEnabled } = usePreview()
  
  const isDiskMode = computed(() => 
    isEnabled.value === true || config.public.liveContent === true
  )

  const data = ref<any>(null)
  const status = ref<SmartContentStatus>('loading')

  /**
   * ----------------------------------------------------------------
   * ESTRATÉGIA A: COLLECTION (PRODUÇÃO / ISR)
   * Usa o banco de dados otimizado do Nuxt Content v3.
   * É muito rápido, mas requer build ou re-geração de cache.
   * ----------------------------------------------------------------
   */
  const fetchFromCollection = async () => {
    try {
      // queryCollection busca pelo campo 'path' no banco SQLite interno
      const result = await queryCollection('content').path(path).first()

      if (result) {
        data.value = normalizeContent(result)
        status.value = 'collection'
      } else {
        // Se não achou na collection, define erro (não tenta disco aqui para não misturar lógicas)
        status.value = 'error'
      }
    } catch (e) {
      console.error('❌ [SmartContent] Erro na Collection:', e)
      status.value = 'error'
    }
  }

  /**
   * ----------------------------------------------------------------
   * ESTRATÉGIA B: DISK (PREVIEW / LIVE MODE)
   * Lê o arquivo físico (.md) via API em tempo real.
   * Inclui lógica de fallback (Tenta arquivo -> Falha -> Tenta Index da pasta).
   * ----------------------------------------------------------------
   */
  const fetchFromDisk = async () => {
    try {
      // Limpeza do path: "/eventos/" vira "eventos"
      const cleanPath = path.replace(/^\//, '').replace(/\/$/, '')
      
      // TENTATIVA 1: Busca pelo arquivo exato (ex: "sobre" -> "sobre.md")
      let fileToFetch = `${cleanPath}.md`
      
      // Adiciona _v=Date.now() para burlar qualquer cache do navegador/proxy (Cache Busting)
      let result: any = await $fetch('/api/admin/storage', {
        params: {
          site: siteName,
          folder: 'content',
          file: fileToFetch,
          _v: Date.now() 
        }
      }).catch(() => null)

      // TENTATIVA 2: Fallback para Index (ex: "eventos" -> "eventos/index.md")
      // Se a primeira falhou, assume que é uma pasta e tenta pegar o index.
      if (!result?.content) {
        // Garante as barras corretas para não ficar "eventos//index.md"
        fileToFetch = `${cleanPath}/index.md`.replace(/\/+/g, '/')
        
        result = await $fetch('/api/admin/storage', {
          params: {
            site: siteName,
            folder: 'content',
            file: fileToFetch,
            _v: Date.now()
          }
        }).catch(() => null)
      }

      if (result?.content) {
        // O conteúdo vem como string do disco. 
        // parseMarkdown converte essa string em AST (JSON que o renderizador entende)
        const parsed = await parseMarkdown(result.content)
        data.value = normalizeContent(parsed)
        status.value = 'disk'
      } else {
        console.warn(`⚠️ [Preview] Arquivo não encontrado no disco: ${cleanPath}`)
        status.value = 'error'
      }
    } catch (e) {
      console.error('❌ [SmartContent] Erro crítico no disco:', e)
      status.value = 'error'
    }
  }

  /**
   * ORQUESTRADOR
   * Decide qual fonte de dados usar baseado no estado do Preview.
   */
  
  // Reinicia estado
  status.value = 'loading'
  data.value = null

  if (isDiskMode.value) {
    await fetchFromDisk()
  } else {
    await fetchFromCollection()
  }

  return {
    data,
    status,
    isDiskMode // Retorna para quem quiser saber a origem (ex: mostrar badge "Live")
  }
}