<script setup>
import { ref, watch, computed } from 'vue'; // Adicionei 'computed'
import { VueDraggable } from 'vue-draggable-plus';

const props = defineProps({
  visible: Boolean,
  files: Array,
  currentFolder: String,
  currentFile: String
});

const emit = defineEmits([
  'update:visible', 'navigate', 'select', 'back', 'change-root', 
  'create-file', 'create-folder', 'refresh', 'delete' 
]);

const roots = ['content', 'pages', 'components', 'data', 'layouts'];
const removeExtension = (filename) => filename.replace(/\.[^/.]+$/, "");

// --- DRAG & DROP ---
const localFiles = ref([]);
watch(() => props.files, (newVal) => { localFiles.value = [...(newVal || [])]; }, { immediate: true });

const onDragEnd = async () => {
  const orderedNames = localFiles.value.map(f => f.name);
  try {
    await $fetch('/api/admin/reorder', { method: 'POST', body: { folder: props.currentFolder, files: orderedNames } });
    emit('refresh'); 
  } catch (error) {
    console.error("Erro ao salvar ordem:", error);
    localFiles.value = [...(props.files || [])];
  }
};

// --- RENOMEAR ---
const renameDialogVisible = ref(false);
const renameLoading = ref(false);
const targetFile = ref(null);
const newFileName = ref('');

const openRenameDialog = (file) => {
  targetFile.value = file;
  newFileName.value = removeExtension(file.name);
  renameDialogVisible.value = true;
};

const confirmRename = async () => {
  if (!newFileName.value || !targetFile.value) return;
  renameLoading.value = true;
  
  try {
    const oldName = targetFile.value.name;
    const extension = oldName.includes('.') ? '.' + oldName.split('.').pop() : '';
    let finalNewName = newFileName.value;
    if (!finalNewName.endsWith(extension)) { finalNewName += extension; }

    await $fetch('/api/admin/rename', {
      method: 'POST',
      body: { folder: props.currentFolder, oldFile: oldName, newName: newFileName.value }
    });

    // Atualiza ordem localmente para evitar pulo
    const currentOrder = localFiles.value.map(f => f.name);
    const index = currentOrder.indexOf(oldName);
    if (index !== -1) {
      currentOrder[index] = finalNewName;
      await $fetch('/api/admin/reorder', {
        method: 'POST',
        body: { folder: props.currentFolder, files: currentOrder }
      });
    }

    renameDialogVisible.value = false;
    emit('refresh'); 
  } catch (error) {
    alert('Erro ao renomear arquivo.');
  } finally {
    renameLoading.value = false;
  }
};

// --- EXCLUIR ---
const deleteDialogVisible = ref(false);
const itemToDelete = ref(null);

const confirmDelete = (file) => {
  itemToDelete.value = file;
  deleteDialogVisible.value = true;
};

const handleDelete = () => {
  if (itemToDelete.value) {
    emit('delete', itemToDelete.value);
    deleteDialogVisible.value = false;
    itemToDelete.value = null;
  }
};

// --- MOVER (NOVO) ---
const moveDialogVisible = ref(false);
const itemToMove = ref(null);
const moveLoading = ref(false);

// Filtra apenas as pastas visíveis na lista atual para exibir no modal
const availableSubFolders = computed(() => {
  if (!localFiles.value) return [];
  // Retorna itens que são diretórios E não são o próprio item que estamos movendo
  return localFiles.value.filter(f => f.isDirectory && f.name !== itemToMove.value?.name);
});

const openMoveDialog = (file) => {
  itemToMove.value = file;
  moveDialogVisible.value = true;
};

const handleMove = async (destination) => {
  if (!itemToMove.value) return;
  moveLoading.value = true;

  const fileName = itemToMove.value.name;
  let newPathName = '';

  // Lógica de destino
  if (destination === '..') {
    newPathName = `../${fileName}`; // Move para pasta pai
  } else {
    newPathName = `${destination}/${fileName}`; // Move para subpasta
  }

  try {
    // Usamos o endpoint rename para mover (mudando o path)
    await $fetch('/api/admin/rename', {
      method: 'POST',
      body: {
        folder: props.currentFolder,
        oldFile: fileName,
        newName: newPathName
      }
    });

    moveDialogVisible.value = false;
    emit('refresh'); // Recarrega a lista pois o arquivo sumiu desta pasta
  } catch (error) {
    console.error(error);
    alert('Erro ao mover item.');
  } finally {
    moveLoading.value = false;
  }
};
</script>

<template>
  <Drawer 
    :visible="visible" 
    @update:visible="emit('update:visible', $event)" 
    header="Explorer" 
    class="w-80 bg-[#141b18] border-r border-white/5"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-folder-open text-[#6f942e]"></i>
        <span class="text-xs font-black uppercase tracking-widest text-slate-400">Navegação</span>
      </div>
    </template>
    
    <div class="flex flex-col h-full w-full">
      
      <div class="p-3 border-b border-white/5 bg-[#141b18] shrink-0 z-10">
        <div class="flex gap-2 mb-4">
           <Button label="ARQUIVO" icon="pi pi-file-plus" class="flex-1 bg-[#6f942e] border-none text-black font-black text-[10px] tracking-widest" @click="emit('create-file')" />
           <Button label="PASTA" icon="pi pi-folder-plus" class="flex-1 bg-white/10 border-none text-slate-300 hover:bg-white/20 font-black text-[10px] tracking-widest" @click="emit('create-folder')" />
        </div>

        <div class="bg-black/20 p-2 rounded-sm border border-white/5 flex flex-wrap gap-1">
          <button v-for="root in roots" :key="root"
                  @click="emit('change-root', root)"
                  :class="['text-[9px] px-2 py-1 rounded uppercase font-bold transition-all', currentFolder.startsWith(root) ? 'bg-[#6f942e] text-black' : 'bg-white/5 text-slate-500 hover:text-white']">
            {{ root }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div v-if="currentFolder.includes('/')" @click="emit('back')" class="flex items-center gap-3 p-3 rounded-sm cursor-pointer hover:bg-[#6f942e]/10 text-[#6f942e] border border-dashed border-[#6f942e]/20 mb-2">
          <i class="pi pi-arrow-up text-xs"></i><span class="text-xs font-bold uppercase tracking-widest">.. / Voltar</span>
        </div>
        
        <VueDraggable 
          v-model="localFiles"
          :animation="150"
          @end="onDragEnd"
          class="flex flex-col gap-1"
          handle=".drag-handle"
        >
          <div v-for="file in localFiles" :key="file.name" 
               @click="file.isDirectory ? emit('navigate', file.name) : emit('select', file.name)"
               :class="['group flex items-center justify-between p-3 rounded-sm transition-all border border-transparent pr-2 select-none', currentFile === file.name ? 'bg-[#6f942e]/10 border-[#6f942e]/30 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300']">
            
            <div class="flex items-center gap-3 overflow-hidden drag-handle cursor-grab active:cursor-grabbing w-full">
               <i :class="[file.isDirectory ? 'pi pi-folder text-yellow-600 text-lg' : 'pi pi-file text-indigo-400 text-lg']"></i>
               <span class="text-sm font-medium truncate">{{ file.isDirectory ? file.name : removeExtension(file.name) }}</span>
            </div>

            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
              <button @click.stop="openRenameDialog(file)" class="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white focus:opacity-100" title="Renomear">
                <i class="pi pi-pencil text-xs"></i>
              </button>

              <button @click.stop="openMoveDialog(file)" class="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-blue-400 focus:opacity-100 transition-colors" title="Mover">
                <i class="pi pi-arrow-right-arrow-left text-xs"></i>
              </button>
              
              <button @click.stop="confirmDelete(file)" class="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-500 focus:opacity-100 transition-colors" title="Excluir">
                <i class="pi pi-trash text-xs"></i>
              </button>
            </div>

          </div>
        </VueDraggable>

      </div>
    </div>

    <Dialog v-model:visible="renameDialogVisible" modal header="Renomear Item" :style="{ width: '350px' }" class="p-fluid bg-[#141b18]">
      <div class="flex flex-col gap-4 pt-2">
        <div>
          <label class="text-xs font-bold uppercase text-slate-500 block mb-2">Novo Nome</label>
          <InputText v-model="newFileName" class="w-full bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e]" autofocus @keyup.enter="confirmRename" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" text severity="secondary" @click="renameDialogVisible = false" size="small" />
          <Button label="Salvar" icon="pi pi-check" @click="confirmRename" :loading="renameLoading" class="bg-[#6f942e] border-none text-black font-bold" size="small" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="moveDialogVisible" modal header="Mover Para" :style="{ width: '350px' }" class="bg-[#141b18]">
      <div class="flex flex-col gap-4 pt-2">
         <p class="text-xs text-slate-400">Movendo: <span class="text-white font-bold">{{ itemToMove?.name }}</span></p>
         
         <div class="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
            <div v-if="currentFolder.includes('/')" 
                 @click="handleMove('..')"
                 class="p-3 bg-white/5 hover:bg-[#6f942e]/20 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors">
                <i class="pi pi-level-up text-[#6f942e]"></i>
                <span class="text-sm font-bold text-slate-300">.. (Pasta Anterior)</span>
            </div>

            <div v-for="dir in availableSubFolders" :key="dir.name"
                 @click="handleMove(dir.name)"
                 class="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors">
                <i class="pi pi-folder text-amber-500"></i>
                <span class="text-sm text-slate-300">{{ dir.name }}</span>
            </div>

            <div v-if="availableSubFolders.length === 0 && !currentFolder.includes('/')" class="text-center text-xs text-slate-600 py-4">
              Nenhuma pasta de destino aqui.
            </div>
         </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="deleteDialogVisible" modal header="Confirmar Exclusão" :style="{ width: '350px' }" class="p-fluid bg-[#141b18]">
      <div class="flex flex-col gap-4 pt-2">
        <p class="text-sm text-slate-300">
          Tem certeza que deseja excluir <strong class="text-white">{{ itemToDelete?.name }}</strong>?
        </p>
        <p v-if="itemToDelete?.isDirectory" class="text-xs text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20">
          <i class="pi pi-exclamation-triangle mr-1"></i> Isso apagará todos os arquivos dentro da pasta.
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" text severity="secondary" @click="deleteDialogVisible = false" size="small" />
          <Button label="Excluir" icon="pi pi-trash" severity="danger" @click="handleDelete" size="small" />
        </div>
      </template>
    </Dialog>

  </Drawer>
</template>