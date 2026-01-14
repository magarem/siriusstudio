// composables/usePreview.ts
export const usePreview = () => {
  // Cria/Lê o cookie 'preview_mode'
  const previewCookie = useCookie('preview_mode', {
    maxAge: 60 * 60 * 24, // 24 horas
    path: '/'             // Vale para todo o site (Admin e Público)
  })

  const isEnabled = computed(() => !!previewCookie.value)

  // ATIVAR (Novo)
  const enable = () => {
    if (!previewCookie.value) {
      previewCookie.value = 'true'
      // Opcional: Log para debug
      console.log('🔌 Sirius Mode: Preview ativado automaticamente.')
    }
  }

  // DESATIVAR
  const disable = () => {
    previewCookie.value = null
    
    if (import.meta.client) {
      window.location.reload()
    }
  }

  return {
    isEnabled,
    enable,  // <--- Exportando a nova função
    disable
  }
}