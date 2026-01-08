<template>
  <div class="admin-layout h-screen bg-slate-950 text-slate-200 flex overflow-hidden dark font-sans">
    <aside class="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 z-50 shrink-0 shadow-2xl">
      <button @click="setActiveView('files')" :class="['p-3 mb-2 transition-all duration-200 rounded-lg group relative', (activeView === 'files' && isSidebarOpen) ? 'text-indigo-400' : 'text-slate-500 hover:text-white']">
        <div v-if="activeView === 'files' && isSidebarOpen" class="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-indigo-500"></div>
        <i class="pi pi-copy text-xl"></i>
      </button>

      <button @click="setActiveView('images')" :class="['p-3 mb-2 transition-all duration-200 rounded-lg group relative', (activeView === 'images' && isSidebarOpen) ? 'text-indigo-400' : 'text-slate-500 hover:text-white']">
        <div v-if="activeView === 'images' && isSidebarOpen" class="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-indigo-500"></div>
        <i class="pi pi-images text-xl"></i>
      </button>

      <button @click="setActiveView('components')" :class="['p-3 mb-2 transition-all duration-200 rounded-lg group relative', (activeView === 'components' && isSidebarOpen) ? 'text-indigo-400' : 'text-slate-500 hover:text-white']" v-tooltip.right="'Componentes'">
        <div v-if="activeView === 'components' && isSidebarOpen" class="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-indigo-500"></div>
        <i class="pi pi-box text-xl"></i>
      </button>

      <button @click="setActiveView('pages')" :class="['p-3 mb-2 transition-all duration-200 rounded-lg group relative', (activeView === 'pages' && isSidebarOpen) ? 'text-indigo-400' : 'text-slate-500 hover:text-white']" v-tooltip.right="'Páginas'">
        <div v-if="activeView === 'pages' && isSidebarOpen" class="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-indigo-500"></div>
        <i class="pi pi-sitemap text-xl"></i>
      </button>

      <button @click="setActiveView('layouts')" :class="['p-3 mb-2 transition-all duration-200 rounded-lg group relative', (activeView === 'layouts' && isSidebarOpen) ? 'text-indigo-400' : 'text-slate-500 hover:text-white']" v-tooltip.right="'Layouts'">
        <div v-if="activeView === 'layouts' && isSidebarOpen" class="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-indigo-500"></div>
        <i class="pi pi-clone text-xl"></i>
      </button>

      <button @click="openPreview" class="p-3 mb-2 text-slate-500 hover:text-indigo-400 transition-all rounded-lg" title="Ver Site">
        <i class="pi pi-desktop text-xl"></i>
      </button>

      <div class="flex-1"></div>

      <button @click="logout" class="p-3 mb-2 text-slate-400 hover:text-red-400 transition-all rounded-lg group" title="Sair">
        <i class="pi pi-sign-out text-xl group-hover:translate-x-1 transition-transform"></i>
      </button>
    </aside>

    <aside :class="['bg-slate-900 border-r border-slate-800 flex flex-col h-screen transition-all duration-300 ease-in-out shrink-0', isSidebarOpen ? 'w-64' : 'w-0 border-none']">
      
      <div class="flex-1 overflow-hidden flex flex-col">
        <FileExplorer 
          v-if="activeView === 'files'" 
          base-path="content" 
          v-model="selectedFile" 
        />

        <FileExplorer 
          v-else-if="activeView === 'components'" 
          base-path="app/components" 
          v-model="selectedFile" 
        />

        <FileExplorer 
          v-else-if="activeView === 'images'" 
          base-path="images" 
          @select="selectImage"
          v-model="selectedImage"
        />

        <FileExplorer 
          v-else-if="activeView === 'pages'" 
          base-path="app/pages" 
          v-model="selectedFile"
        />

        <FileExplorer 
          v-else-if="activeView === 'layouts'" 
          base-path="app/layouts" 
          v-model="selectedFile"
        />
      </div>
    </aside>

    <main class="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
      <div v-if="viewMode === 'image' && selectedImage" class="flex-1 flex flex-col items-center justify-center p-8">
        <div class="relative max-w-4xl w-full text-center">
          <img :src="selectedImage.path" class="max-w-full max-h-[70vh] rounded-lg shadow-2xl border border-slate-800 mx-auto bg-slate-900" />
          <div class="mt-8 flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl max-w-2xl mx-auto">
            <div class="text-left flex-1 overflow-hidden">
              <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Caminho do Asset</p>
              <code class="text-indigo-400 font-mono text-sm block truncate">{{ selectedImage.path }}</code>
            </div>
            <div class="flex gap-2">
              <button @click="copyPath(selectedImage.path)" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2"><i class="pi pi-copy"></i> COPIAR URL</button>
              <button @click="deleteItem(selectedImage)" class="bg-red-900/40 hover:bg-red-600 text-red-200 px-3 py-2 rounded-lg border border-red-500/30 transition-all"><i class="pi pi-trash"></i></button>
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <header class="bg-slate-900 border-b border-slate-800 flex items-center justify-between pr-4 h-12">
          <div class="flex items-center h-full">
            <div v-if="selectedFile" class="bg-slate-950 border-t-2 border-indigo-500 px-6 h-full flex items-center gap-3 border-r border-slate-800">
              <i :class="[
                selectedFile.path.endsWith('.vue') ? 'pi pi-box text-blue-400' : 'pi pi-file-edit text-indigo-400', 
                'text-lg'
              ]"></i>
              
              <span class="text-[12px] font-mono font-medium text-slate-300">
                {{ selectedFile.path.split('/').pop() }}
              </span>
            </div>
          </div>

          <div v-if="pending || isUploading" class="flex items-center gap-2 text-[10px] font-mono text-indigo-400">
            <i class="pi pi-spin pi-spinner"></i><span>PROCESSANDO...</span>
          </div>
        </header>

        <section class="flex-1 relative flex flex-col overflow-hidden">
          <div class="relative flex-1 w-full overflow-hidden bg-slate-950">
            <div ref="highlightRef" class="absolute inset-0 p-8 font-mono text-[15px] leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-slate-500 z-0 overflow-y-auto scrollbar-hide" v-html="highlightedContent"></div>
            <textarea ref="textareaRef" v-model="rawText" @scroll="syncScroll" class="absolute inset-0 w-full h-full p-8 font-mono text-[15px] leading-relaxed border-none focus:ring-0 resize-none bg-transparent text-transparent caret-indigo-400 z-10 overflow-y-auto" spellcheck="false" :disabled="!selectedFile"></textarea>
            <div v-if="!selectedFile && !selectedImage" class="absolute inset-0 flex items-center justify-center text-slate-700 font-serif italic">Selecione um arquivo ou pasta para começar</div>
          </div>

          <footer class="bg-indigo-600 h-8 flex justify-between items-center px-4 text-white shrink-0 z-20">
            <div class="flex items-center gap-6 text-[11px] font-semibold">
              <span class="opacity-80">Nuxt 4 + Sirius Engine</span>
              <span v-if="selectedFile" class="opacity-50 font-mono">{{ selectedFile.path }}</span>
            </div>
            <div class="flex items-center h-full">
              <button @click="openPreview" class="bg-indigo-500 hover:bg-indigo-400 px-5 h-full text-[11px] font-bold flex items-center gap-2 border-l border-white/10"><i class="pi pi-eye"></i> PREVIEW</button>
              <button @click="saveFile" :disabled="isSaving || !selectedFile" class="bg-indigo-700 hover:bg-indigo-800 px-5 h-full text-[11px] font-bold flex items-center gap-2 border-l border-white/10"><i :class="isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-save'"></i> SALVAR</button>
              <button @click="publishSite" class="bg-emerald-600 hover:bg-emerald-700 px-5 h-full text-[11px] font-bold flex items-center gap-2 border-l border-white/10"><i class="pi pi-upload"></i> PUBLICAR</button>
            </div>
          </footer>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'auth' })

// Removido: const toast = useToast()

// --- ESTADOS DE DADOS ---
const selectedFile = ref(null)
const rawText = ref('')
const isSaving = ref(false)
const pending = ref(false)
const imageList = ref([])
const selectedImage = ref(null)

// --- ESTADOS DE COMPONENTES ---
const componentList = ref([])
const componentSearch = ref('')
const isRefreshing = ref(false)

// --- ESTADOS DE UI & NAVEGAÇÃO ---
const activeView = ref('files')
const viewMode = ref('editor')
const imageViewMode = ref('grid')
const isSidebarOpen = ref(true)
const currentSubPath = ref('')
const isDragging = ref(false)
const isUploading = ref(false)
const textareaRef = ref(null)
const highlightRef = ref(null)

// --- MÉTODOS DE COMPONENTES ---
const fetchComponents = async () => {
  try {
    const data = await $fetch('/api/components-list')
    componentList.value = data
  } catch (e) {
    console.error('Erro ao buscar componentes:', e)
  }
}

const refreshComponents = async () => {
  isRefreshing.value = !isRefreshing.value 
}

const selectComponent = async (compName) => {
  selectedImage.value = null;
  viewMode.value = 'editor';
  selectedFile.value = {
    path: `app/components/${compName}.vue`,
    type: 'component'
  };
};

const filteredComponents = computed(() => {
  if (!componentSearch.value) return componentList.value
  const s = componentSearch.value.toLowerCase()
  return componentList.value.filter(c => c.toLowerCase().includes(s))
})

const copyComponentTag = (name) => {
  const tag = `::${name}\n::`
  navigator.clipboard.writeText(tag)
  console.log('Tag copiada:', tag)
}

// --- MÉTODOS DE IMAGEM ---
const loadImages = async () => {
  try {
    imageList.value = await $fetch('/api/images', { query: { path: currentSubPath.value } })
  } catch (e) { 
    console.error('Erro ao carregar imagens:', e)
  }
}

const handleFolderClick = (folder) => {
  currentSubPath.value = folder.relativeSubPath
  loadImages()
}

const goBack = () => {
  const parts = currentSubPath.value.split('/').filter(Boolean)
  parts.pop()
  currentSubPath.value = parts.join('/')
  loadImages()
}

const selectImage = (img) => {
  selectedImage.value = img
  viewMode.value = 'image'
  selectedFile.value = null
}

const deleteItem = async (item) => {
  if (!confirm(`Deseja realmente eliminar ${item.name}?`)) return
  try {
    await $fetch('/api/images/delete', { method: 'DELETE', body: { path: item.path, isDirectory: item.isDirectory } })
    if (selectedImage.value?.path === item.path) { selectedImage.value = null; viewMode.value = 'editor' }
    loadImages()
  } catch (e) {
    console.error('Erro ao eliminar item:', e)
  }
}

const uploadFiles = async (files) => {
  if (!files.length) return
  isUploading.value = true
  const formData = new FormData()
  formData.append('targetPath', currentSubPath.value)
  for (const file of files) formData.append('files', file)
  try {
    await $fetch('/api/images/upload', { method: 'POST', body: formData })
    loadImages()
  } catch (e) { 
    console.error('Erro no upload:', e)
  } finally { isUploading.value = false; isDragging.value = false }
}

const handleDrop = (e) => uploadFiles(e.dataTransfer.files)
const handleFileSelect = (e) => uploadFiles(e.target.files)

const createFolder = async () => {
  const name = prompt(`Nova pasta em /images/${currentSubPath.value}:`)
  if (!name) return
  try {
    await $fetch('/api/images/create-folder', { method: 'POST', body: { name, path: currentSubPath.value } })
    loadImages()
  } catch (e) {
    console.error('Erro ao criar pasta:', e)
  }
}

// --- MÉTODOS DE ARQUIVO ---
const loadFile = async (file) => {
  if (!file?.path) return;
  pending.value = true;
  try {
    const data = await $fetch('/api/read', { 
      method: 'POST', 
      body: { filePath: file.path } 
    });
    rawText.value = data?.content || '';
  } catch (e) {
    console.error('Erro ao ler arquivo:', file.path, e);
  } finally {
    pending.value = false;
  }
};

const saveFile = async () => {
  if (!selectedFile.value) return
  isSaving.value = true
  try {
    await $fetch('/api/save', { method: 'POST', body: { filePath: selectedFile.value.path, content: rawText.value } })
    console.log('Arquivo salvo com sucesso!');
  } catch (e) {
    console.error('Erro ao salvar arquivo:', e)
  } finally { isSaving.value = false }
}

// --- UTILITÁRIOS ---
const setActiveView = (view) => {
  if (activeView.value === view && isSidebarOpen.value) {
    isSidebarOpen.value = false
  } else {
    activeView.value = view
    isSidebarOpen.value = true
  }
}

const copyPath = (path) => {
  const cleanPath = path.replace('/images', '')
  navigator.clipboard.writeText(cleanPath)
  console.log('Caminho copiado:', cleanPath)
}

const openPreview = () => window.open('/?preview=true', '_blank')
const syncScroll = (e) => { if (highlightRef.value) highlightRef.value.scrollTop = e.target.scrollTop }

const highlightedContent = computed(() => {
  if (!rawText.value) return ''
  if (selectedFile.value?.path.endsWith('.vue')) {
    let escaped = rawText.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    return escaped.replace(/(&lt;\/?[\w-]+.*?&gt;)/g, '<span class="text-indigo-400 font-bold">$1</span>')
  }
  const fmRegex = /^(---\n[\s\S]*?\n---)/
  let escaped = rawText.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return escaped.replace(fmRegex, (match) => `<span class="text-indigo-400 font-bold">${match}</span>`)
})

// --- WATCHERS ---
watch(selectedFile, (f) => {
  if (f && f.path) {
    viewMode.value = 'editor';
    selectedImage.value = null;
    loadFile(f);
  }
});

watch(activeView, (view) => { 
  if (view === 'images') loadImages() 
})

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveFile() }
  })
})

const publishSite = async () => {
  if (!confirm("Publicar alterações?")) return
  try { 
    await $fetch('/api/content/publish', { method: 'POST' }); 
    console.log('Site publicado!');
  } catch (e) {
    console.error('Erro ao publicar:', e)
  }
}

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/admin/login'
}
</script>

<style scoped>
textarea { outline: none !important; font-family: 'JetBrains Mono', monospace; line-height: 1.6; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
textarea::-webkit-scrollbar { width: 8px; }
textarea::-webkit-scrollbar-track { background: #020617; }
textarea::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>