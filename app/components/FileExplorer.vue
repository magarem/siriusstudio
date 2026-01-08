<template>
  <div 
    class="flex flex-col h-full bg-slate-950/20 relative"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <div v-if="isDragging" class="absolute inset-0 z-50 bg-indigo-600/20 backdrop-blur-sm border-2 border-dashed border-indigo-500 flex items-center justify-center pointer-events-none">
      <div class="bg-slate-900 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3 border border-indigo-500/50">
        <i class="pi pi-cloud-upload text-4xl text-indigo-400 animate-bounce"></i>
        <div class="text-center">
          <p class="text-[11px] font-bold text-white uppercase tracking-widest">Solte para enviar</p>
          <p class="text-[9px] text-slate-400 mt-1 font-mono">{{ basePath }}/{{ currentPath }}</p>
        </div>
      </div>
    </div>

    <div class="px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center shrink-0">
      <div class="flex items-center gap-2">
        <i :class="[sectionInfo.icon, 'text-indigo-400 text-sm']"></i>
        <h2 class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200">
          {{ sectionInfo.title }}
        </h2>
      </div>
      
      <button @click="$refs.fileInput.click()" class="text-slate-500 hover:text-emerald-400 p-1 transition-colors group" title="Upload de arquivos">
        <i :class="['pi text-xs group-hover:scale-110 transition-transform', isUploading ? 'pi-spin pi-spinner' : 'pi-plus']"></i>
      </button>
      <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileSelect" />
    </div>

    <div class="p-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0">
      <div class="flex items-center gap-1">
        <button @click="refresh" class="p-2 hover:bg-slate-800 rounded text-slate-400" title="Atualizar">
          <i :class="['pi pi-refresh text-[10px]', pending ? 'pi-spin' : '']"></i>
        </button>
        <div class="w-px h-3 bg-slate-700 mx-1"></div>
        <button @click="viewMode = 'list'" :class="['p-2 rounded transition-colors', viewMode === 'list' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500']">
          <i class="pi pi-list text-[10px]"></i>
        </button>
        <button @click="viewMode = 'grid'" :class="['p-2 rounded transition-colors', viewMode === 'grid' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500']">
          <i class="pi pi-th-large text-[10px]"></i>
        </button>
      </div>
      
      <span class="text-[9px] font-mono text-slate-600 truncate max-w-[120px]" :title="currentPath">
        /{{ currentPath || '' }}
      </span>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
      <div :class="viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-0.5'">
        
        <div v-if="currentPath" @click="goBack" 
             class="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-800/50 rounded text-slate-500 text-[11px] border border-transparent hover:border-slate-700 group">
          <i class="pi pi-arrow-up text-[10px] group-hover:-translate-y-0.5 transition-transform"></i> 
          <span class="font-mono">..</span>
        </div>

        <div v-for="item in files" :key="item.path" 
             @click="handleItemClick(item)"
             :class="[
               'group relative rounded border transition-all cursor-pointer overflow-hidden',
               viewMode === 'grid' ? 'flex flex-col items-center p-3 text-center min-h-[110px] justify-center' : 'flex items-center gap-3 px-3 py-2',
               modelValue?.path === item.path ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-transparent hover:bg-slate-800/40 hover:border-slate-800'
             ]">
          
          <div :class="viewMode === 'grid' ? 'mb-2 h-14 w-full flex items-center justify-center' : 'shrink-0 w-5 flex justify-center'">
            
            <template v-if="item.isDirectory">
              <div v-if="viewMode === 'grid'" class="relative flex flex-col items-center">
                <i class="pi pi-folder text-4xl text-amber-500/80 drop-shadow-md"></i>
                <i class="pi pi-plus absolute -bottom-1 -right-1 text-[10px] bg-slate-900 rounded-full p-0.5 text-amber-200 border border-amber-500/30"></i>
              </div>
              <i v-else class="pi pi-folder-fill text-amber-500 text-base"></i>
            </template>

            <template v-else-if="isImage(item.name)">
              <img v-if="viewMode === 'grid'" :src="item.path" class="w-full h-12 object-cover rounded bg-slate-900 shadow-inner border border-slate-800" />
              <i v-else class="pi pi-image text-indigo-400 text-sm"></i>
            </template>

            <template v-else>
              <i :class="[getFileIcon(item.name), viewMode === 'grid' ? 'text-3xl' : 'text-sm']"></i>
            </template>
          </div>

          <div class="flex-1 min-w-0">
            <p :class="[
              'truncate transition-colors',
              viewMode === 'grid' ? 'text-[10px] w-full' : 'text-[13px]',
              item.isDirectory ? 'font-bold text-slate-300' : 'text-slate-400 group-hover:text-slate-200'
            ]">
              {{ formatLabel(item.name) }}
            </p>
          </div>

          <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 bg-slate-900/95 backdrop-blur-sm rounded border border-slate-700 p-0.5 shadow-xl transition-all translate-y-1 group-hover:translate-y-0">
            <button @click.stop="renameItem(item)" class="p-1.5 hover:text-indigo-400 text-slate-500 transition-colors" title="Renomear">
              <i class="pi pi-pencil text-[9px]"></i>
            </button>
            <button @click.stop="deleteItem(item)" class="p-1.5 hover:text-red-400 text-slate-500 transition-colors" title="Excluir">
              <i class="pi pi-trash text-[9px]"></i>
            </button>
          </div>
        </div>

        <div v-if="files.length === 0 && !pending" class="py-12 text-center opacity-20 flex flex-col items-center">
          <i class="pi pi-inbox text-3xl mb-2"></i>
          <p class="text-[9px] uppercase tracking-[0.3em]">Diretório Vazio</p>
        </div>
      </div>
    </div>

    <div v-if="isUploading" class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
      <div class="h-full bg-indigo-500 animate-progress w-full"></div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  basePath: { type: String, required: true }, // 'content', 'app/components' ou 'public/images'
  modelValue: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'select']);

const viewMode = ref('list'); // Pode ser 'grid' ou 'list'
const currentPath = ref('');



const isDragging = ref(false);
const isUploading = ref(false);
const fileInput = ref(null);

const uploadFiles = async (files) => {
  if (!files.length) return;
  isUploading.value = true;

  const formData = new FormData();
  
  // AQUI: Você está passando 'public/images' ou 'content', etc.
  formData.append('basePath', props.basePath); 
  
  // AQUI: Você está passando a subpasta (ex: 'galeria/viagens')
  formData.append('currentPath', currentPath.value);
  
  for (const file of files) {
    formData.append('files', file);
  }

  try {
    // Note que sua rota aqui é /api/fs/upload
    // Certifique-se de que o arquivo que criamos tenha esse nome ou ajuste a URL
    await $fetch('/api/fs/upload', {
      method: 'POST',
      body: formData
    });
    refresh(); 
  } catch (e) {
    alert("Erro no upload dos arquivos.");
  } finally {
    isUploading.value = false;
    isDragging.value = false;
  }
};

const handleDrop = (e) => {
  isDragging.value = false;
  uploadFiles(e.dataTransfer.files);
};

const handleFileSelect = (e) => uploadFiles(e.target.files);


const sectionInfo = computed(() => {
  const path = props.basePath.toLowerCase();
  
  if (path.includes('content')) {
    return { title: 'Conteúdo (Markdown)', icon: 'pi pi-file-edit' };
  }
  if (path.includes('components')) {
    return { title: 'Componentes Vue', icon: 'pi pi-box' };
  }
  if (path.includes('pages')) {
    return { title: 'Páginas / Rotas', icon: 'pi pi-sitemap' };
  }
  if (path.includes('layouts')) {
    return { title: 'Layouts', icon: 'pi pi-clone' };
  }
  if (path.includes('images') || path.includes('public')) {
    return { title: 'Banco de Imagens', icon: 'pi pi-images' };
  }
  
  return { title: 'Arquivos', icon: 'pi pi-folder' };
});

// Fetch automático dos arquivos baseado no basePath e no subpath atual
const { data: filesData, pending, refresh } = await useFetch('/api/fs/list', {
  query: { 
    base: props.basePath, 
    sub: currentPath 
  },
  watch: [currentPath] // Recarrega sempre que mudar de pasta
});

const files = computed(() => filesData.value || []);

const handleItemClick = (item) => {
  if (item.isDirectory) {
    currentPath.value = currentPath.value ? `${currentPath.value}/${item.name}` : item.name;
  } else {
    emit('update:modelValue', item);
    emit('select', item);
  }
};

const goBack = () => {
  const parts = currentPath.value.split('/').filter(Boolean);
  parts.pop();
  currentPath.value = parts.join('/');
};

// Helpers de Interface
const isImage = (name) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name);

const getFileIcon = (name) => {
  if (name.endsWith('.vue')) return 'pi pi-code text-emerald-400';
  if (name.endsWith('.md')) return 'pi pi-file-edit text-indigo-400';
  if (name.endsWith('.json')) return 'pi pi-database text-amber-400';
  return 'pi pi-file text-slate-500';
};

const formatLabel = (name) => {
  return name.replace('.md', '').replace('.vue', '');
};

// --- AÇÕES DE ARQUIVO ---
const deleteItem = async (item) => {
  if (!confirm(`Tem certeza que deseja excluir "${item.name}"?`)) return;
  try {
    await $fetch('/api/fs/delete', { 
      method: 'POST', 
      // MUDANÇA AQUI: Enviamos o physicalPath
      body: { path: item.physicalPath, isDirectory: item.isDirectory } 
    });
    refresh();
  } catch (e) {
    alert("Erro ao excluir arquivo.");
  }
};

const renameItem = async (item) => {
  const newName = prompt('Novo nome (inclua a extensão se for arquivo):', item.name);
  if (newName && newName !== item.name) {
    try {
      await $fetch('/api/fs/rename', { 
        method: 'POST', 
        // MUDANÇA AQUI: Enviamos o physicalPath
        body: { oldPath: item.physicalPath, newName } 
      });
      refresh();
    } catch (e) {
      alert("Erro ao renomear.");
    }
  }
};

defineExpose({ refresh });
</script>

<style scoped>
  @keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-progress {
  animation: progress 1.5s infinite linear;
}
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
</style>