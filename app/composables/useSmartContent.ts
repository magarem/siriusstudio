import { parseMarkdown } from '#imports'

type SmartContentStatus =
  | 'loading'
  | 'collection'
  | 'disk'
  | 'error'

function normalizeContent(raw: any) {
  if (!raw) return null;

  // 1. Extraímos o frontmatter original. 
  // O Nuxt Content (Collection) coloca campos extras na raiz.
  // O parseMarkdown (Disk) coloca em .data.
  // Vamos unificar tudo em um objeto de "origem" de metadados.
  const rawData = raw.data || {};
  const source = { ...raw, ...rawData };

  // 2. Chaves que DEVEM ficar na raiz (Padrão Nuxt)
  const protectedKeys = [
    'body', 'bodyHtml', 'excerpt', 
    '_id', '_path', '_file', '_draft', '_type', '_extension', 
    'title', 'description'
  ];

  const normalized: any = {
    meta: {}
  };

  // 3. Varredura Total
  Object.keys(source).forEach(key => {
    // Ignora chaves internas de processamento
    if (key === 'data' || key === 'meta') return;

    if (protectedKeys.includes(key)) {
      // Vai para a raiz
      normalized[key] = source[key];
    } else {
      // TUDO o resto vai para o meta (incluindo cargaHoraria, programacao, etc.)
      normalized.meta[key] = source[key];
    }
  });

  // 4. Caso especial: se o 'raw' original já tinha um .meta (comum na collection v3)
  // vamos mesclar para não perder nada
  if (raw.meta && typeof raw.meta === 'object') {
    normalized.meta = { ...normalized.meta, ...raw.meta };
  }

  return normalized;
}

export async function useSmartContent(path: string) {
  const route = useRoute()
  const isPreview = computed(() => 'preview' in route.query)

  const data = ref<any>(null)
  const status = ref<SmartContentStatus>('loading')

  const config = useRuntimeConfig()
  const siteName = config.public.siteName

  /**
   * Fonte 1 — Collection
   */
  const fetchFromCollection = async () => {
    try {
      const { data: result } = await useAsyncData(
        `content:${path}`,
        () => queryCollection('content').path(path).first()
      )

      if (result.value) {
        data.value = normalizeContent(result.value)
        status.value = 'collection'
      }
    } catch (e) {
      console.error('❌ Erro ao ler da collection:', e)
      status.value = 'error'
    }
  }

  /**
   * Fonte 2 — Disco (preview)
   */
  const fetchFromDisk = async () => {
    try {
      const file = path.replace(/^\//, '') + '.md'

      const result: any = await $fetch('/api/admin/storage', {
        params: {
          site: siteName,
          folder: 'content',
          file,
          _v: Date.now()
        }
      })

      if (result?.content) {
        const parsed = await parseMarkdown(result.content)
        data.value = normalizeContent(parsed)
        status.value = 'disk'
      }
    } catch (e) {
      console.error('❌ Erro ao ler do disco:', e)
      status.value = 'error'
    }
  }

  /**
   * Orquestrador
   */
  if (isPreview.value) {
    await fetchFromDisk()
  } else {
    await fetchFromCollection()
  }

  return {
    data,
    isPreview,
    status
  }
}
