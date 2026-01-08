import { ref, computed, watch } from 'vue'
import { parseMarkdown } from '#imports'

export const useContentSource = async (path: string, isPreview: boolean = false) => {
  const config = useRuntimeConfig()
  const siteName = config.public.siteName

  // 1. Definição das fontes de dados
  // Task Estática: Busca do cache do Nuxt Content (usado no build/produção)
  const staticTask = useAsyncData(`${path}-static`, () => 
    queryCollection('content').path(`/${path}`).first()
  )

  // Task Raw: Busca direta da nossa API de Storage (usado no Preview em tempo real)
  const rawTask = useFetch('/api/admin/storage', {
    query: { 
      site: siteName, 
      folder: 'content', 
      file: `${path}.md` 
    },
    immediate: isPreview,
    key: `raw-${path}-${Date.now()}` // Chave dinâmica
  })

  // Executa ambas as chamadas simultaneamente
  const [{ data: staticPage }, { data: rawData, refresh: refreshRaw }] = await Promise.all([
    staticTask,
    rawTask
  ])
  

  // 2. Estado para o conteúdo processado (AST)
  // O MDCRenderer precisa de uma árvore de objetos (body), não de uma string HTML.
  const parsedContent = ref(null)

  // Função interna para transformar string Markdown em AST
  const processMarkdown = async (mdText: string) => {
    if (!mdText) return
    try {
      // Importante: parseMarkdown é o que permite componentes Vue no MD
      parsedContent.value = await parseMarkdown(mdText)
    } catch (e) {
      console.error("Erro ao processar Markdown no Preview:", e)
    }
  }

  // 3. Lógica de Inicialização e Reatividade
  if (isPreview && rawData.value?.content) {
    // Processa o conteúdo na primeira carga
    await processMarkdown(rawData.value.content)
  }

  // VIGIA: Se o conteúdo mudar na API (quando você salva no Sirius), 
  // o preview atualiza automaticamente sem Refresh da página.
  watch(() => rawData.value?.content, async (newText) => {
    if (isPreview && newText) {
      await processMarkdown(newText)
    }
  })

  // 4. Resultado Final Unificado
  const content = computed(() => {
    if (isPreview && parsedContent.value) {
      return {
        ...parsedContent.value.data, // Frontmatter (title, etc)
        body: parsedContent.value.body, // O "corpo" em formato de árvore para o renderer
        isPreview: true
      }
    }
    
    // Se não for preview, retorna o que o Nuxt Content gerou no build
    return staticPage.value ? { ...staticPage.value, isPreview: false } : null
  })

  return {
    content,      // O que você vai usar no template
    staticPage,   // Referência original para o ContentRenderer (se necessário)
    refreshRaw    // Função para forçar atualização manual
  }
}