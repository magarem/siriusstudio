<template>
  <div class="image-explorer-component flex flex-col gap-6">
    <Toast :baseZIndex="10000" position="top-right" :life="1000" />
    
    <section class="flex flex-wrap items-center justify-between gap-4 bg-[#141b18] p-4 rounded-2xl border border-white/5">
      
      <div class="flex items-center gap-3 overflow-hidden">
        <Button v-if="folder !== 'images'" icon="pi pi-arrow-left" text rounded @click="goBack" class="text-[#6f942e] shrink-0" />
        
        <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          <i class="pi pi-home text-slate-500 hover:text-white cursor-pointer transition-colors" @click="navigateTo('images')"></i>
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

      <div class="flex items-center gap-3">
        
        <div class="flex items-center bg-black/30 rounded-lg p-1 border border-white/5">
           <Button 
             icon="pi pi-th-large" 
             text 
             rounded 
             size="small"
             :class="viewMode === 'grid' ? 'text-[#6f942e] bg-white/5' : 'text-slate-500 hover:text-white'" 
             @click="viewMode = 'grid'" 
             v-tooltip.bottom="'Grade'"
           />
           <Button 
             icon="pi pi-list" 
             text 
             rounded 
             size="small"
             :class="viewMode === 'list' ? 'text-[#6f942e] bg-white/5' : 'text-slate-500 hover:text-white'" 
             @click="viewMode = 'list'" 
             v-tooltip.bottom="'Lista'"
           />
        </div>

        <div class="w-px h-6 bg-white/10 mx-1"></div>

        <Button icon="pi pi-folder-plus" label="Pasta" @click="confirmCreateFolder" class="p-button-text text-xs font-bold text-[#6f942e] uppercase tracking-wider" />
        
        <FileUpload 
          mode="basic" 
          name="demo[]" 
          :url="uploadUrl" 
          :key="folder"
          accept="image/*" 
          :auto="true" 
          @upload="onUpload" 
          chooseLabel="UPLOAD" 
          class="p-button-sm bg-[#6f942e] border-none font-bold text-xs" 
        />
      </div>
    </section>

    <section class="h-[60vh] overflow-y-auto custom-scrollbar pr-2 content-start">
      
      <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="file in files" :key="file.name" 
             class="bg-[#1a1d1c] p-3 rounded-2xl border border-white/5 hover:border-[#6f942e] transition-all group relative overflow-hidden h-40 cursor-pointer"
             @click="file.isDirectory ? enterFolder(file.name) : openZoom(file)"
        >
          <div class="w-full h-full overflow-hidden rounded-xl bg-[#0a0c0b] flex items-center justify-center relative">
            <div v-if="file.isDirectory" class="flex flex-col items-center justify-center w-full h-full hover:bg-white/5 transition-colors">
              <i class="pi pi-folder text-5xl text-amber-500 mb-2"></i>
              <span class="text-[10px] text-amber-500/50 font-bold uppercase tracking-widest truncate w-full text-center px-2">{{ file.name }}</span>
            </div>
            
            <img v-else
              :src="getImageUrl(file.name)" 
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              @error="(e) => e.target.src = 'https://placehold.co/200?text=Erro'"
            />
          </div>
          
          <div class="absolute inset-0 bg-[#0f1110]/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 gap-2">
              <div class="flex gap-2">
                 <Button v-if="!file.isDirectory" icon="pi pi-eye" severity="secondary" rounded size="small" @click.stop="openZoom(file)" />
                 <Button v-if="!file.isDirectory" icon="pi pi-check" severity="success" rounded size="small" @click.stop="selectImage(file.name)" />
                 <Button v-if="!file.isDirectory" icon="pi pi-copy" severity="info" rounded size="small" @click.stop="copyImageUrl(file.name)" />
              </div>
              <div class="flex gap-2">
                 <Button icon="pi pi-pencil" severity="warning" text rounded size="small" @click.stop="openRenameModal(file)" />
                 <Button icon="pi pi-arrow-right-arrow-left" severity="help" text rounded size="small" @click.stop="openMoveModal(file)" />
                 <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click.stop="deleteItem(file.name, file.isDirectory)" />
              </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-2">
         <div v-for="file in files" :key="file.name" 
              class="flex items-center justify-between p-3 bg-[#1a1d1c] rounded-xl border border-white/5 hover:border-[#6f942e] hover:bg-white/5 transition-all group cursor-pointer"
              @click="file.isDirectory ? enterFolder(file.name) : openZoom(file)"
         >
            <div class="flex items-center gap-4 flex-1 min-w-0">
               <div class="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-black/20 border border-white/5 flex items-center justify-center">
                  <i v-if="file.isDirectory" class="pi pi-folder text-2xl text-amber-500"></i>
                  <img v-else :src="getImageUrl(file.name)" class="w-full h-full object-cover" loading="lazy" />
               </div>
               
               <div class="flex flex-col truncate">
                  <span class="text-sm font-bold text-slate-200 truncate group-hover:text-[#6f942e] transition-colors">{{ file.name }}</span>
                  <span class="text-[10px] text-slate-500 uppercase tracking-widest">{{ file.isDirectory ? 'Pasta' : 'Imagem' }}</span>
               </div>
            </div>

            <div class="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
               <template v-if="!file.isDirectory">
                  <Button icon="pi pi-eye" severity="secondary" text rounded @click.stop="openZoom(file)" v-tooltip.top="'Ver'" />
                  <Button icon="pi pi-check" severity="success" text rounded @click.stop="selectImage(file.name)" v-tooltip.top="'Inserir'" />
                  <Button icon="pi pi-copy" severity="info" text rounded @click.stop="copyImageUrl(file.name)" v-tooltip.top="'Link'" />
                  <div class="w-px h-4 bg-white/20 mx-1"></div>
               </template>
               
               <Button icon="pi pi-pencil" severity="warning" text rounded @click.stop="openRenameModal(file)" v-tooltip.top="'Renomear'" />
               <Button icon="pi pi-arrow-right-arrow-left" severity="help" text rounded @click.stop="openMoveModal(file)" v-tooltip.top="'Mover'" />
               <Button icon="pi pi-trash" severity="danger" text rounded @click.stop="deleteItem(file.name, file.isDirectory)" v-tooltip.top="'Excluir'" />
            </div>
         </div>
      </div>

      <div v-if="files && files.length === 0" class="flex flex-col items-center justify-center opacity-50 h-40">
        <i class="pi pi-folder-open text-4xl mb-2 text-slate-600"></i>
        <p class="text-xs uppercase tracking-widest text-slate-500">Pasta Vazia</p>
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
      <div class="relative flex flex-col items-center justify-center bg-[#020302] w-full h-full p-4 overflow-hidden select-none" v-if="currentZoomedFile">
        
        <Button icon="pi pi-times" text rounded class="!absolute top-4 right-4 text-white/60 hover:text-white z-50 !w-14 !h-14 !text-2xl" @click="showZoom = false" v-tooltip.left="'Fechar (Esc)'" />

        <div class="flex items-center justify-between w-full gap-4 h-full relative">
          <div class="h-full flex items-center px-4 absolute left-0 z-10 cursor-pointer group" @click="prevImage">
             <Button icon="pi pi-chevron-left" text rounded class="text-white/40 group-hover:text-[#6f942e] !w-16 !h-16 !text-4xl transition-all scale-90 group-hover:scale-105" />
          </div>

          <div class="relative flex-1 flex flex-col items-center justify-center h-full w-full px-16">
            <img :src="getImageUrl(currentZoomedFile.name)" class="max-h-[85vh] max-w-full object-contain animate-fade-in" />
            
            <div class="absolute bottom-4 flex flex-col items-center gap-3 bg-[#020302]/80 p-3 rounded-xl backdrop-blur-sm">
               <div class="text-slate-400 font-mono text-xs flex items-center gap-2">
                  <i class="pi pi-image text-[#6f942e]"></i>
                  <span class="opacity-70">{{ folder }}/</span><span class="text-white font-bold">{{ currentZoomedFile.name }}</span>
               </div>
               <div class="flex gap-2">
                  <Button label="Inserir" size="small" icon="pi pi-check" class="bg-[#6f942e] border-none text-black font-bold" @click="selectImage(currentZoomedFile.name); showZoom = false" />
                  <Button label="Link" size="small" severity="secondary" icon="pi pi-copy" @click="copyImageUrl(currentZoomedFile.name)" />
               </div>
            </div>
          </div>

          <div class="h-full flex items-center px-4 absolute right-0 z-10 cursor-pointer group" @click="nextImage">
            <Button icon="pi pi-chevron-right" text rounded class="text-white/40 group-hover:text-[#6f942e] !w-16 !h-16 !text-4xl transition-all scale-90 group-hover:scale-105" />
          </div>
        </div>

        <div class="absolute top-6 left-6 text-xs font-bold text-slate-500 uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full">
           {{ zoomedFileIndex + 1 }} / {{ imageFiles.length }}
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
            <div v-if="folder !== 'images'" 
                 @click="handleMove('..')"
                 class="p-3 bg-white/5 hover:bg-[#6f942e]/20 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors">
                <i class="pi pi-level-up text-[#6f942e]"></i>
                <span class="text-sm font-bold text-slate-300">.. (Pasta Anterior)</span>
            </div>

            <div v-for="dir in subDirectories" :key="dir.name"
                 @click="handleMove(dir.name)"
                 class="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors">
                <i class="pi pi-folder text-amber-500"></i>
                <span class="text-sm text-slate-300">{{ dir.name }}</span>
            </div>

            <div v-if="subDirectories.length === 0 && folder === 'images'" class="text-center text-xs text-slate-600 py-4">
              Nenhuma subpasta disponível.
            </div>
         </div>
      </div>
    </Dialog>

  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";
import { onMounted, onUnmounted } from 'vue';

const toast = useToast();
const emit = defineEmits(['select']);

const siteContext = useCookie('cms_site_context');
// [NOVO] Cookie para lembrar o modo de visualização (Padrão: grid)
const viewMode = useCookie('cms_media_view_mode', { default: () => 'grid' });

const folder = ref('images'); 
const loadingAction = ref(false);

const showRename = ref(false);
const renameValue = ref('');
const itemToRename = ref(null);

const showMove = ref(false);
const itemToMove = ref(null);

const showZoom = ref(false);
const zoomedFileIndex = ref(0);

const { data: files, refresh } = await useFetch('/api/admin/storage', {
  query: { site: siteContext.value, folder: folder }
});

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
  return `/api/admin/upload?site=${siteContext.value}&folder=${encodeURIComponent(folder.value)}`;
});

// ACTIONS

const getImageUrl = (fileName) =>  folder.value + "/" + fileName;

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

const selectImage = (name) => {
  const relativePath = `/${folder.value}/${name}`; 
  emit('select', relativePath);
  toast.add({ severity: 'success', summary: 'Selecionado', life: 1000 });
};

const openZoom = (file) => {
  const index = imageFiles.value.findIndex(f => f.name === file.name);
  if (index !== -1) {
    zoomedFileIndex.value = index;
    showZoom.value = true;
  }
};

const nextImage = () => {
  if (zoomedFileIndex.value < imageFiles.value.length - 1) {
    zoomedFileIndex.value++;
  } else {
    zoomedFileIndex.value = 0; 
  }
};

const prevImage = () => {
  if (zoomedFileIndex.value > 0) {
    zoomedFileIndex.value--;
  } else {
    zoomedFileIndex.value = imageFiles.value.length - 1; 
  }
};

const handleKeydown = (e) => {
  if (!showZoom.value) return;
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'Escape') showZoom.value = false;
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));


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
    toast.add({ severity: 'success', summary: 'Pasta criada', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro ao criar pasta', life: 3000 });
  }
};

const onUpload = () => {
  refresh();
  toast.add({ severity: 'success', summary: 'Upload concluído!', life: 2000 });
};

const copyImageUrl = (name) => {
  const url = `/${folder.value}/${name}`; 
  navigator.clipboard.writeText(url).then(() => {
    toast.add({ severity: 'info', summary: 'Copiado!', life: 1500 });
  });
};

const deleteItem = async (fileName, isDir) => {
  if (!confirm(`Apagar ${isDir ? 'pasta' : 'arquivo'} ${fileName}?`)) return;
  try {
    await $fetch('/api/admin/storage', { 
      method: 'DELETE', 
      body: { site: siteContext.value, folder: folder.value, file: fileName } 
    });
    refresh();
    toast.add({ severity: 'warn', summary: 'Item excluído', life: 2000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro ao excluir', life: 2000 });
  }
};

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
      body: { folder: folder.value, oldFile: itemToRename.value.name, newName: renameValue.value }
    });
    showRename.value = false;
    toast.add({ severity: 'success', summary: 'Renomeado!', life: 3000 });
    refresh();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro ao renomear', life: 3000 });
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
  let newPathName = '';
  if (destinationSubFolder === '..') {
    newPathName = `../${fileName}`;
  } else {
    newPathName = `${destinationSubFolder}/${fileName}`;
  }
  try {
    await $fetch('/api/admin/rename', {
      method: 'POST',
      body: { folder: folder.value, oldFile: fileName, newName: newPathName }
    });
    showMove.value = false;
    toast.add({ severity: 'success', summary: 'Movido com sucesso!', life: 3000 });
    refresh();
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro ao mover', life: 3000 });
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(111, 148, 46, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(111, 148, 46, 0.5); }

:deep(.p-fileupload-choose) {
  background: #6f942e !important;
  border-radius: 8px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

:deep(.p-dialog) {
  box-shadow: none !important;
  border: none !important;
  border-radius: 0 !important;
}

:deep(.p-dialog-content) {
  padding: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
}

:deep(.p-dialog-header) {
  display: none;
}

.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
</style>