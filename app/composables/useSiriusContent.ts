import { parseMarkdown } from '#imports'

export const useSiriusContent = async (path: string) => {
  const route = useRoute()
  const siteCookie = useCookie('cms_site_context')
  
  // Controle de Estado
  const isPreview = computed(() => route.query.preview === 'true')
  const currentSite = siteCookie.value || ''
  const liveData = ref(null)
  const isSyncing = ref(false)

  // 1. BUSCA ESTÁTICA (Nuxt Content v3 - Rápido para Produção/SEO)
  const { data: staticData } = await useAsyncData(`static-${path}`, () => 
    queryCollection('content').path(`/${path}`).first()
  )

  // 2. BUSCA DO DISCO (Sirius Studio - Para Preview Real)
  const fetchFromDisk = async () => {
    if (!isPreview.value) return
    isSyncing.value = true
    try {
      const data = await $fetch('/api/admin/storage', {
        params: { 
          site: currentSite, 
          folder: 'content', 
          file: `${path.endsWith('.md') ? path : path + '.md'}`,
          _v: Date.now() 
        }
      })
      if (data?.content) {
        // Converte string markdown em Objeto AST para o ContentRenderer
        liveData.value = await parseMarkdown(data.content)
      }
    } catch (e) {
      console.error("[Sirius Studio] Erro na sincronização:", e)
    } finally {
      isSyncing.value = false
    }
  }

  // 3. CICLO DE VIDA E AUTO-REFRESH
  if (isPreview.value && process.client) {
    onMounted(() => {
      fetchFromDisk()
      
      // Opcional: Ouve o Sirius Studio salvando em outra aba
      const channel = new BroadcastChannel('sirius_updates')
      channel.onmessage = (event) => {
        if (event.data === 'refresh') fetchFromDisk()
      }
    })
  }

  // 4. PRIORIDADE DE CONTEÚDO
  const content = computed(() => {
    // Se o preview estiver ativo e o dado do disco chegou, ele manda na tela
    if (isPreview.value && liveData.value) {
      return {
        ...liveData.value.data,
        body: liveData.value.body,
        _is_live: true
      }
    }
    // Caso contrário, entrega a versão indexada (Produção)
    return staticData.value
  })

  return {
    content,
    isPreview,
    isSyncing,
    refresh: fetchFromDisk
  }
}