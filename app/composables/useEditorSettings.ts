// composables/useEditorSettings.ts
import { reactive, computed, watch } from 'vue'

// Configurações padrão (Fallback)
const defaultSettings = {
  fontSize: 14,
  fontFamily: "'Fira Code', 'Consolas', monospace",
  lineHeight: 1.5,
  tabSize: 2,
  wordWrap: true,
  theme: 'one-dark'
}

export const useEditorSettings = () => {
  const siteContext = useCookie("cms_site_context")
  
  // Estado reativo global para as configurações
  const state = useState('sirius_editor_settings', () => reactive({ ...defaultSettings }))
  const isLoading = useState('sirius_editor_loading', () => false)

  // Computed para gerar o CSS Style
  const editorStyles = computed(() => ({
    fontSize: `${state.value.fontSize}px`,
    fontFamily: state.value.fontFamily,
    lineHeight: state.value.lineHeight,
  }))

  // Função para carregar as configurações do servidor
  const loadSettings = async () => {
    if (isLoading.value) return
    isLoading.value = true

    try {
      // Busca o arquivo _config.json na raiz (".")
      const data = await $fetch('/api/admin/storage', {
        params: { 
          site: siteContext.value, 
          folder: '.', 
          file: '_config.json' 
        }
      })

      if (data && data.content) {
        const config = JSON.parse(data.content)
        // Se existir a chave "editor", mistura com o estado atual
        if (config.editor) {
          Object.assign(state.value, { ...defaultSettings, ...config.editor })
        }
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do editor:", error)
    } finally {
      isLoading.value = false
    }
  }

  // Função para salvar uma alteração específica
  // Ex: updateSetting('fontSize', 18)
  const updateSetting = async (key: string, value: any) => {
    // 1. Atualiza visualmente primeiro (otimista)
    state.value[key] = value

    // 2. Lê o config atual para não perder outras configs (url, title, etc)
    try {
      const currentFile = await $fetch('/api/admin/storage', {
        params: { site: siteContext.value, folder: '.', file: '_config.json' }
      })

      let fullConfig = {}
      if (currentFile && currentFile.content) {
        try { fullConfig = JSON.parse(currentFile.content) } catch (e) {}
      }

      // 3. Atualiza apenas a seção do editor
      fullConfig.editor = { ...state.value }

      // 4. Salva o arquivo de volta
      await $fetch('/api/admin/storage', {
        method: 'POST',
        body: {
          site: siteContext.value,
          folder: '.',
          file: '_config.json',
          content: JSON.stringify(fullConfig, null, 2) // Pretty print
        }
      })
      
    } catch (error) {
      console.error("Erro ao salvar configuração:", error)
      // Opcional: Reverter estado em caso de erro
    }
  }

  return {
    settings: state,
    editorStyles,
    loadSettings,
    updateSetting
  }
}