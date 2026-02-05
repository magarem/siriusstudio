<script setup>
// Imports composables do Nuxt (assumindo auto-import)
const route = useRoute()
const router = useRouter()
const { isEnabled } = usePreview() // Seu composable de preview existente

const logoPath = '/images/logo_sirius.png'

// Estados locais
const canEdit = ref(false)
const editBtnLabel = ref('Editar Página')
const editBtnIcon = ref('pi pi-file-edit')
const isSending = ref(false)

// 1. Tenta ler o estado global definido na página (caso a página tenha setado manualmente)
const currentFilePath = useState('sirius-current-file')

onMounted(() => {
  // Verifica se existe uma janela pai (o CMS) aberta
  if (window.opener && !window.opener.closed) {
    canEdit.value = true
  }
})

const editInCMS = () => {
  if (!window.opener || window.opener.closed) {
    alert("A conexão com a aba do Sirius foi perdida. Por favor, reabra o painel.")
    canEdit.value = false
    return
  }

  isSending.value = true

  // 2. LÓGICA DE CAMINHO INTELIGENTE
  let filepath = ''

  if (currentFilePath.value) {
    // A. Se a página definiu o arquivo explicitamente
    filepath = currentFilePath.value
  } else {
    // B. Fallback baseado na rota (URL)
    const currentPath = route.path
    
    if (currentPath === '/' || currentPath === '') {
      // Home Page geralmente é _index.md
      filepath = '_index.md'
    } else {
      // Remove barra final se existir
      const cleanPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath
      // Assume que é um arquivo markdown normal
      filepath = `${cleanPath}.md`
    }
  }

  // 3. Normalização: Garante que começa com 'content/'
  // Remove barra inicial se tiver (ex: "/blog/post.md" -> "blog/post.md")
  if (filepath.startsWith('/')) filepath = filepath.substring(1)
  
  // Adiciona o prefixo content se não tiver
  if (!filepath.startsWith('content/')) {
    filepath = `content/${filepath}`
  }
  
  // Debug
  console.log("[SIRIUS PREVIEW] Solicitando edição de:", filepath);

  // 4. Envia a mensagem para o Editor V2
  window.opener.postMessage({
    type: 'SIRIUS_EDIT_REQUEST',
    filepath: filepath
  }, '*')

  // Tenta focar na aba do CMS
  try { window.opener.focus() } catch (e) {}

  // 5. Feedback Visual no Botão
  const originalLabel = 'Editar Página'
  const originalIcon = 'pi pi-file-edit'
  
  editBtnLabel.value = 'Enviado!'
  editBtnIcon.value = 'pi pi-check'
  
  setTimeout(() => {
    editBtnLabel.value = originalLabel
    editBtnIcon.value = originalIcon
    isSending.value = false
  }, 2000)
}

// --- AÇÃO: SAIR DO PREVIEW ---
const handleExit = () => {
  // Remove query param e recarrega para limpar cache/estado
  const newQuery = { ...route.query }
  delete newQuery.preview
  
  // external: true força um reload real da página
  navigateTo({ path: route.path, query: newQuery }, { external: true })
}
</script>

<template>
  <div v-if="isEnabled" class="sirius-bar">
    <div class="wrapper">
      
      <div class="brand-area">
        <!-- <img :src="logoPath" alt="Sirius" class="logo-img" @error="$event.target.style.display='none'" /> -->
        
        <div class="brand-text">
          <span class="brand-name">SIRIUS</span>
          <span class="brand-suffix">STUDIO</span>
        </div>
        
        <div class="vertical-divider"></div>
        
        <div class="mode-badge">
          PREVIEW
        </div>
      </div>

      <div class="status-area">
        <span class="pulse-dot"></span>
        <span class="status-text">Conexão em Tempo Real Ativa</span>
      </div>

      <div class="actions-area">
        
        <button 
          v-if="canEdit" 
          @click="editInCMS" 
          class="action-btn edit-btn" 
          :class="{ 'sending': isSending }"
          :disabled="isSending"
          :title="'Editar ' + route.path"
        >
          <i :class="editBtnIcon"></i>
          <span>{{ editBtnLabel }}</span>
        </button>

        <div v-if="canEdit" class="divider-small"></div>

        <button @click="handleExit" class="action-btn exit-btn" title="Sair do modo Preview">
          <i class="pi pi-power-off"></i>
          <span>Sair</span>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* CONFIGURAÇÃO GERAL DA BARRA */
.sirius-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background-color: #0f172a; /* Slate 900 */
  border-bottom: 1px solid #1e293b;
  color: #e2e8f0;
  z-index: 99999;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
}

.wrapper {
  width: 100%;
  max-width: 1400px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

/* ÁREA DA MARCA */
.brand-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  height: 24px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-size: 0.85rem;
  line-height: 1;
  display: flex;
  gap: 4px;
}

.brand-name { font-weight: 800; color: #fff; letter-spacing: 0.05em; }
.brand-suffix { font-weight: 300; color: #94a3b8; }

.vertical-divider {
  width: 1px;
  height: 16px;
  background-color: #334155;
}

.mode-badge {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  letter-spacing: 0.05em;
}

/* ÁREA CENTRAL (STATUS) */
.status-area {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

@media (max-width: 850px) {
  .status-area { display: none; }
}

.status-text {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pulse-green 2s infinite;
}

/* ÁREA DE AÇÕES (DIREITA) */
.actions-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.divider-small {
  width: 1px;
  height: 20px;
  background-color: #334155;
}

.action-btn {
  background: transparent;
  border: 1px solid transparent;
  padding: 0 14px;
  height: 30px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn i { font-size: 0.85rem; }

/* Botão EDITAR */
.edit-btn {
  color: #a3e635; /* Verde Limão Sirius */
  border-color: rgba(163, 230, 53, 0.2);
  background-color: rgba(163, 230, 53, 0.05);
}
.edit-btn:hover:not(:disabled) {
  background-color: rgba(163, 230, 53, 0.15);
  border-color: #a3e635;
  color: #bef264;
  transform: translateY(-1px);
}
.edit-btn.sending {
  background-color: rgba(163, 230, 53, 0.3);
  color: #fff;
  cursor: default;
}

/* Botão SAIR */
.exit-btn {
  color: #cbd5e1;
  border-color: #334155;
}
.exit-btn:hover {
  background-color: #dc2626;
  border-color: #dc2626;
  color: white;
}

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}
</style>