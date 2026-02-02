<script setup>
import { useToast } from "primevue/usetoast";
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';

// --- PROPS & EMITS ---
const props = defineProps({
  // A pasta onde o editor está aberto (ex: "content/atrativos/bistro")
  initialFolder: { type: String, default: 'content' } 
});

const emit = defineEmits(['select', 'close']);

const toast = useToast();
const siteContext = useCookie('cms_site_context');
const viewMode = useCookie('cms_media_view_mode', { default: () => 'grid' });

// Estado da pasta atual (começa na pasta do arquivo sendo editado)
const folder = ref(props.initialFolder); 

// Estado de UI
const loadingAction = ref(false);
const showRename = ref(false);
const renameValue = ref('');
const itemToRename = ref(null);

const showMove = ref(false);
const itemToMove = ref(null);

const showZoom = ref(false);
const zoomedFileIndex = ref(0);

// --- DRAG AND DROP STATES ---
const isDragging = ref(false);
const isUploading = ref(false);

// --- DATA FETCHING ---
const { data: files, refresh } = await useFetch('/api/admin/storage', {
  query: { site: siteContext, folder: folder },
  watch: [folder]
});

// --- COMPUTEDS AUXILIARES ---

const subDirectories = computed(() => {
  return files.value ? files.value.filter(f => f.isDirectory && f.name !== itemToMove.value?.name) : [];
});

const imageFiles = computed(() => {
  return files.value ? files.value.filter(f => !f.isDirectory) : [];
});

const currentZoomedFile = computed(() => {
  if (!imageFiles.value.length) return null;
  return imageFiles.value[zoomedFileIndex.value];
});

const breadcrumbs = computed(() => {
  const cleanPath = folder.value.replace(/^\/|\/$/g, '');
  if (!cleanPath) return [];
  const parts = cleanPath.split('/');
  let currentAccumulator = '';
  return parts.map(part => {
    currentAccumulator = currentAccumulator ? `${currentAccumulator}/${part}` : part;
    return { name: part, path: currentAccumulator };
  });
});

const uploadUrl = computed(() => {
  // URL usada pelo componente FileUpload do PrimeVue (botão do header)
  return `/api/admin/upload?site=${siteContext.value}&folder=${encodeURIComponent(folder.value)}`;
});

// --- HELPER DE URL ---
const getPublicUrl = (fileName) => {
  const cleanFolder = folder.value.replace(/^content\/?/, '');
  return `/assets/${cleanFolder}/${fileName}`.replace(/\/+/g, '/');
};

// --- NAVEGAÇÃO ---
const enterFolder = (name) => {
  folder.value = folder.value.endsWith('/') ? `${folder.value}${name}` : `${folder.value}/${name}`;
};

const navigateTo = (path) => { folder.value = path; };

const goBack = () => {
  const parts = folder.value.split('/');
  if (parts.length > 1) {
    parts.pop();
    folder.value = parts.join('/');
  }
};

// --- AÇÃO PRINCIPAL: SELECIONAR IMAGEM ---
const selectImage = (name) => {
  if (folder.value === props.initialFolder) {
      emit('select', name);
  } else {
      emit('select', getPublicUrl(name));
  }
  toast.add({ severity: 'success', summary: 'Imagem Selecionada', life: 1000 });
};

// --- ZOOM & PREVIEW ---
const openZoom = (file) => {
  const index = imageFiles.value.findIndex(f => f.name === file.name);
  if (index !== -1) {
    zoomedFileIndex.value = index;
    showZoom.value = true;
  }
};

const nextImage = () => {
  if (zoomedFileIndex.value < imageFiles.value.length - 1) zoomedFileIndex.value++;
  else zoomedFileIndex.value = 0; 
};

const prevImage = () => {
  if (zoomedFileIndex.value > 0) zoomedFileIndex.value--;
  else zoomedFileIndex.value = imageFiles.value.length - 1; 
};

const handleKeydown = (e) => {
  if (!showZoom.value) return;
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'Escape') showZoom.value = false;
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

// --- FILESYSTEM ACTIONS ---

const confirmCreateFolder = async () => {
  const name = prompt("Nome da nova pasta:");
  if (!name) return;
  const safeName = name.trim().replace(/\s+/g, '-').toLowerCase();
  try {
    await $fetch('/api/admin/mkdir', {
      method: 'POST',
      body: { site: siteContext.value, folder: folder.value, name: safeName }
    });
    refresh();
    toast.add({ severity: 'success', summary: 'Pasta criada', life: 2000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar pasta.' });
  }
};

// Callback do componente FileUpload (Header)
const onUpload = () => {
  refresh();
  toast.add({ severity: 'success', summary: 'Upload concluído!', life: 2000 });
};

// --- LÓGICA DE DRAG & DROP ---
const handleDrop = async (e) => {
    isDragging.value = false;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        await uploadDroppedFiles(files);
    }
};

const uploadDroppedFiles = async (fileList) => {
    isUploading.value = true;
    try {
        const formData = new FormData();
        let hasImage = false;

        // Adiciona todos os arquivos válidos ao FormData
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.type.startsWith('image/')) {
                formData.append('file', file); // A API lê isso como array
                hasImage = true;
            }
        }

        if (!hasImage) {
            toast.add({ severity: 'warn', summary: 'Arquivo inválido', detail: 'Apenas imagens são permitidas.' });
            return;
        }

        // Envia para a API usando QUERY STRING para site e folder
        await $fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
            params: {
                site: siteContext.value,
                folder: folder.value // Envia para a pasta atual do Explorer
            }
        });

        toast.add({ severity: 'success', summary: 'Upload concluído', life: 2000 });
        refresh(); // Atualiza a lista visualmente
    } catch (e) {
        console.error(e);
        toast.add({ severity: 'error', summary: 'Erro no Upload', detail: 'Falha ao enviar arquivos.' });
    } finally {
        isUploading.value = false;
    }
};

const copyImageUrl = (name) => {
  const url = getPublicUrl(name); 
  navigator.clipboard.writeText(url).then(() => {
    toast.add({ severity: 'info', summary: 'Link copiado!', detail: url, life: 2000 });
  });
};

const deleteItem = async (fileName, isDir) => {
  if (!confirm(`Tem certeza que deseja apagar ${fileName}?`)) return;
  try {
    await $fetch('/api/admin/storage', { 
      method: 'DELETE', 
      body: { site: siteContext.value, folder: folder.value, file: fileName } 
    });
    refresh();
    toast.add({ severity: 'warn', summary: 'Item excluído', life: 2000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir item.' });
  }
};

// --- RENOMEAR & MOVER (Mantido Igual) ---
const openRenameModal = (file) => {
  itemToRename.value = file;
  renameValue.value = file.name;
  showRename.value = true;
};

const handleRename = async () => {
  if (!renameValue.value || renameValue.value === itemToRename.value.name) return;
  loadingAction.value = true;
  try {
    await $fetch('/api/admin/rename', {
      method: 'POST',
      body: { 
          oldname: `${folder.value}/${itemToRename.value.name}`, 
          newname: `${folder.value}/${renameValue.value}` 
      }
    });
    showRename.value = false;
    toast.add({ severity: 'success', summary: 'Renomeado!', life: 2000 });
    refresh();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao renomear.' });
  } finally {
    loadingAction.value = false;
  }
};

const openMoveModal = (file) => {
  itemToMove.value = file;
  showMove.value = true;
};

const handleMove = async (destinationSubFolder) => {
  const fileName = itemToMove.value.name;
  const oldPathFull = `${folder.value}/${fileName}`;
  let newPathFull = '';

  if (destinationSubFolder === '..') {
    const parts = folder.value.split('/');
    parts.pop(); 
    const parentPath = parts.join('/');
    newPathFull = parentPath ? `${parentPath}/${fileName}` : fileName;
  } else {
    newPathFull = `${folder.value}/${destinationSubFolder}/${fileName}`;
  }

  try {
    await $fetch('/api/admin/rename', {
      method: 'POST',
      body: { oldname: oldPathFull, newname: newPathFull }
    });
    showMove.value = false;
    toast.add({ severity: 'success', summary: 'Movido!', life: 2000 });
    refresh();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao mover.' });
  }
};
</script>

<template>
  <div class="image-explorer-component flex flex-col gap-0 bg-[#0a0c0b] text-slate-200 h-full w-full">
    <Toast :baseZIndex="10000" position="top-right" :life="2000" />
    
    <header class="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-[#141b18]">
      
      <div class="flex items-center gap-3 overflow-hidden flex-1 mr-4">
        <Button 
            v-if="folder !== 'content' && folder.includes('/')" 
            icon="pi pi-arrow-left" text rounded 
            @click="goBack" class="text-[#6f942e] shrink-0 !w-8 !h-8" v-tooltip.bottom="'Voltar'" 
        />
        
        <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 leading-none">
          <i class="pi pi-home text-slate-500 hover:text-white cursor-pointer transition-colors" @click="navigateTo('content')"></i>
          <span class="text-slate-600 font-bold">/</span>
          <div v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center gap-2 whitespace-nowrap">
            <span class="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-[#6f942e] transition-colors"
                  :class="index === breadcrumbs.length - 1 ? 'text-white' : 'text-slate-500'"
                  @click="navigateTo(crumb.path)">
              {{ crumb.name }}
            </span>
            <span v-if="index < breadcrumbs.length - 1" class="text-slate-600 font-bold">/</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="flex items-center bg-black/30 rounded border border-white/5 p-0.5">
           <Button 
             icon="pi pi-th-large" text rounded size="small"
             class="!w-7 !h-7"
             :class="viewMode === 'grid' ? 'text-[#6f942e] bg-white/5' : 'text-slate-500 hover:text-white'" 
             @click="viewMode = 'grid'" v-tooltip.bottom="'Grade'"
           />
           <Button 
             icon="pi pi-list" text rounded size="small"
             class="!w-7 !h-7"
             :class="viewMode === 'list' ? 'text-[#6f942e] bg-white/5' : 'text-slate-500 hover:text-white'" 
             @click="viewMode = 'list'" v-tooltip.bottom="'Lista'"
           />
        </div>
        <div class="w-px h-6 bg-white/10 mx-1"></div>
        <Button icon="pi pi-folder-plus" text rounded class="text-slate-400 hover:text-white !w-8 !h-8" @click="confirmCreateFolder" v-tooltip.bottom="'Nova Pasta'" />
        
        <div class="relative overflow-hidden group">
            <FileUpload 
              mode="basic" name="demo[]" :url="uploadUrl" :key="folder"
              accept="image/*" :auto="true" @upload="onUpload" 
              chooseLabel="UPLOAD" class="p-button-sm custom-upload-btn" 
            />
        </div>
        <div class="w-px h-6 bg-white/10 mx-1"></div>
        <Button 
            icon="pi pi-times" 
            text rounded size="small" 
            @click="$emit('close')" 
            class="text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors !w-8 !h-8" 
            v-tooltip.bottom="'Fechar'"
        />
      </div>
    </header>

    <section 
        class="flex-1 overflow-y-auto custom-scrollbar p-4 content-start relative h-[60vh]"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
    >
      
      <div 
        v-if="isDragging" 
        class="absolute inset-0 z-50 bg-[#6f942e]/10 border-2 border-dashed border-[#6f942e] flex items-center justify-center backdrop-blur-sm m-2 rounded-xl pointer-events-none"
      >
        <div class="bg-[#141b18] px-6 py-3 rounded-full border border-[#6f942e] text-[#6f942e] font-bold shadow-xl flex items-center gap-3 animate-bounce">
            <i class="pi pi-cloud-upload text-xl"></i>
            SOLTE ARQUIVOS AQUI
        </div>
      </div>

      <div v-if="isUploading" class="absolute inset-0 z-50 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
         <i class="pi pi-spin pi-spinner text-5xl text-[#6f942e] mb-4"></i>
         <span class="text-white font-mono text-sm tracking-widest animate-pulse">ENVIANDO...</span>
      </div>

      <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="file in files" :key="file.name" 
             class="bg-[#1a1d1c] p-2 rounded-xl border border-white/5 hover:border-[#6f942e] transition-all group relative overflow-hidden h-40 cursor-pointer"
             @click="file.isDirectory ? enterFolder(file.name) : openZoom(file)"
        >
          <div class="w-full h-full overflow-hidden rounded-lg bg-[#0a0c0b] flex items-center justify-center relative">
            <div v-if="file.isDirectory" class="flex flex-col items-center justify-center w-full h-full hover:bg-white/5 transition-colors">
              <i class="pi pi-folder text-5xl text-amber-600 mb-2"></i>
              <span class="text-[10px] text-amber-600/70 font-bold uppercase tracking-widest truncate w-full text-center px-2">{{ file.name }}</span>
            </div>
            
            <img v-else
              :src="getPublicUrl(file.name)" 
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              @error="(e) => e.target.src = 'https://placehold.co/200?text=Indisponivel'"
            />
          </div>
          
          <div class="absolute inset-0 bg-[#0f1110]/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 gap-2">
              <div v-if="!file.isDirectory" class="flex gap-2">
                 <Button icon="pi pi-eye" severity="secondary" rounded size="small" class="!w-8 !h-8 !p-0" @click.stop="openZoom(file)" v-tooltip.top="'Zoom'" />
                 <Button icon="pi pi-check" severity="success" rounded size="small" class="!w-8 !h-8 !p-0" @click.stop="selectImage(file.name)" v-tooltip.top="'Selecionar'" />
              </div>
              <div class="flex gap-2 mt-1">
                 <Button icon="pi pi-pencil" severity="warning" text rounded size="small" class="!w-7 !h-7 !p-0" @click.stop="openRenameModal(file)" />
                 <Button icon="pi pi-arrow-right-arrow-left" severity="help" text rounded size="small" class="!w-7 !h-7 !p-0" @click.stop="openMoveModal(file)" />
                 <Button icon="pi pi-trash" severity="danger" text rounded size="small" class="!w-7 !h-7 !p-0" @click.stop="deleteItem(file.name, file.isDirectory)" />
              </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-2">
         <div v-for="file in files" :key="file.name" 
              class="flex items-center justify-between p-2 bg-[#1a1d1c] rounded-xl border border-white/5 hover:border-[#6f942e] hover:bg-white/5 transition-all group cursor-pointer"
              @click="file.isDirectory ? enterFolder(file.name) : openZoom(file)"
         >
            <div class="flex items-center gap-4 flex-1 min-w-0">
               <div class="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-black/20 border border-white/5 flex items-center justify-center">
                  <i v-if="file.isDirectory" class="pi pi-folder text-xl text-amber-500"></i>
                  <img v-else :src="getPublicUrl(file.name)" class="w-full h-full object-cover" loading="lazy" />
               </div>
               
               <div class="flex flex-col truncate">
                  <span class="text-sm font-bold text-slate-200 truncate group-hover:text-[#6f942e] transition-colors">{{ file.name }}</span>
               </div>
            </div>

            <div class="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
               <template v-if="!file.isDirectory">
                  <Button icon="pi pi-eye" severity="secondary" text rounded class="!w-8 !h-8" @click.stop="openZoom(file)" />
                  <Button icon="pi pi-check" severity="success" text rounded class="!w-8 !h-8" @click.stop="selectImage(file.name)" />
                  <div class="w-px h-4 bg-white/20 mx-1"></div>
               </template>
               
               <Button icon="pi pi-pencil" severity="warning" text rounded class="!w-8 !h-8" @click.stop="openRenameModal(file)" />
               <Button icon="pi pi-trash" severity="danger" text rounded class="!w-8 !h-8" @click.stop="deleteItem(file.name, file.isDirectory)" />
            </div>
         </div>
      </div>

      <div v-if="files && files.length === 0" class="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
        <i class="pi pi-folder-open text-6xl mb-4 text-slate-600"></i>
        <p class="text-sm uppercase tracking-widest text-slate-500 font-bold">Pasta Vazia</p>
        <p class="text-[10px] text-slate-600 mt-2">Arraste imagens para cá</p>
      </div>

    </section>

    <Dialog 
      v-model:visible="showZoom" 
      modal 
      :dismissableMask="true" 
      :showHeader="false" 
      :style="{ width: '100vw', height: '100vh', maxHeight: '100vh', margin: 0, overflow: 'hidden' }" 
      class="bg-transparent shadow-none p-0" 
      :contentStyle="{ padding: 0, background: 'transparent', height: '100%', width: '100%' }"
    >
      <div class="relative flex flex-col items-center justify-center bg-[#020302]/95 backdrop-blur-md w-full h-full p-4 overflow-hidden select-none" v-if="currentZoomedFile">
        
        <Button icon="pi pi-times" text rounded class="!absolute top-4 right-4 text-white/60 hover:text-white z-50 !w-12 !h-12 !text-xl" @click="showZoom = false" />
        
        <div class="flex items-center justify-between w-full gap-4 h-full relative max-w-7xl mx-auto">
          <div class="h-full flex items-center px-4 absolute left-0 z-10 cursor-pointer group" @click="prevImage">
             <Button icon="pi pi-chevron-left" text rounded class="text-white/40 group-hover:text-[#6f942e] !w-16 !h-16 !text-4xl transition-all scale-90 group-hover:scale-105" />
          </div>
          
          <div class="relative flex-1 flex flex-col items-center justify-center h-full w-full px-16">
            <img :src="getPublicUrl(currentZoomedFile.name)" class="max-h-[80vh] max-w-full object-contain animate-fade-in shadow-2xl rounded-sm" />
            
            <div class="absolute bottom-6 flex flex-col items-center gap-3 bg-[#1a1d1c] border border-white/10 p-4 rounded-2xl shadow-xl">
               <div class="text-slate-400 font-mono text-xs flex items-center gap-2">
                  <i class="pi pi-image text-[#6f942e]"></i>
                  <span class="opacity-70">{{ getPublicUrl(currentZoomedFile.name) }}</span>
               </div>
               <div class="flex gap-2">
                  <Button label="Inserir Imagem" size="small" icon="pi pi-check" class="bg-[#6f942e] border-none text-black font-bold hover:brightness-110" @click="selectImage(currentZoomedFile.name); showZoom = false" />
                  <Button label="Copiar Link" size="small" severity="secondary" icon="pi pi-copy" @click="copyImageUrl(currentZoomedFile.name)" />
               </div>
            </div>
          </div>
          
          <div class="h-full flex items-center px-4 absolute right-0 z-10 cursor-pointer group" @click="nextImage">
            <Button icon="pi pi-chevron-right" text rounded class="text-white/40 group-hover:text-[#6f942e] !w-16 !h-16 !text-4xl transition-all scale-90 group-hover:scale-105" />
          </div>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="showRename" modal header="Renomear Item" :style="{ width: '350px' }" class="bg-[#141b18]">
      <div class="flex flex-col gap-4 pt-2">
        <label class="text-xs font-bold uppercase text-slate-500">Novo Nome</label>
        <InputText v-model="renameValue" class="w-full bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e]" autofocus @keyup.enter="handleRename" />
        <Button label="Salvar" @click="handleRename" :loading="loadingAction" class="bg-[#6f942e] border-none text-black font-bold w-full" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showMove" modal header="Mover Para" :style="{ width: '350px' }" class="bg-[#141b18]">
      <div class="flex flex-col gap-4 pt-2">
         <p class="text-xs text-slate-400">Movendo: <span class="text-white font-bold">{{ itemToMove?.name }}</span></p>
         <div class="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
            <div v-if="folder !== 'content'" @click="handleMove('..')" class="p-3 bg-white/5 hover:bg-[#6f942e]/20 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors">
                <i class="pi pi-level-up text-[#6f942e]"></i><span class="text-sm font-bold text-slate-300">.. (Pasta Anterior)</span>
            </div>
            <div v-for="dir in subDirectories" :key="dir.name" @click="handleMove(dir.name)" class="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors">
                <i class="pi pi-folder text-amber-600"></i><span class="text-sm text-slate-300">{{ dir.name }}</span>
            </div>
            <div v-if="subDirectories.length === 0" class="text-center text-xs text-slate-500 py-2">Sem subpastas aqui</div>
         </div>
      </div>
    </Dialog>

  </div>
</template>

<style scoped>
/* Scrollbar Customizada */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(111, 148, 46, 0.5); }

/* Customização do Botão de Upload do PrimeVue */
:deep(.custom-upload-btn .p-fileupload-choose) {
  background: #6f942e !important;
  border-color: #6f942e !important;
  color: #000 !important;
  font-weight: 800 !important;
  font-size: 10px !important;
  padding: 0 16px !important;
  border-radius: 9999px !important; /* Rounded Full */
  height: 32px !important;
  display: flex;
  align-items: center;
}

:deep(.custom-upload-btn .p-fileupload-choose:hover) {
    background: #5a7a23 !important;
}

/* Modais sem estilo padrão */
:deep(.p-dialog-header), :deep(.p-dialog-content) {
  background: #141b18;
  color: white;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
}
</style>