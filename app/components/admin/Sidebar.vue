<script setup>
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

const props = defineProps({
  visible: Boolean,
  files: Array,         // Recebe a lista JÁ ORDENADA do pai (que leu o _order.yml)
  currentFolder: String,
  currentFile: String
});

const emit = defineEmits([
  'update:visible', 
  'navigate', 
  'select', 
  'back', 
  'change-root', 
  'create-file', 
  'create-folder', 
  'refresh' // Importante para avisar o pai
]);

const roots = ['content', 'pages', 'components', 'data', 'layout'];
const removeExtension = (filename) => filename.replace(/\.[^/.]+$/, "");

// --- LÓGICA DE DRAG & DROP ---
const localFiles = ref([]);

// Monitora a prop 'files'. Sempre que o pai atualizar (ex: mudou de pasta ou reordenou),
// atualizamos a lista local do Draggable.
watch(() => props.files, (newVal) => {
  localFiles.value = [...(newVal || [])];
}, { immediate: true });

const onDragEnd = async () => {
  // Pega apenas os nomes na ordem visual atual
  const orderedNames = localFiles.value.map(f => f.name);
  
  try {
    // 1. Salva a nova ordem no backend (_order.yml)
    await $fetch('/api/admin/reorder', {
      method: 'POST',
      body: {
        folder: props.currentFolder,
        files: orderedNames
      }
    });

    // 2. Avisa o edit.vue para recarregar a lista oficial
    // Isso garante que o estado do backend e frontend fiquem idênticos
    emit('refresh'); 
  } catch (error) {
    console.error("Erro ao salvar ordem:", error);
    // Em caso de erro, reverte a lista local para a original do props
    localFiles.value = [...(props.files || [])];
  }
};

// --- LÓGICA DE RENOMEAR ---
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
    await $fetch('/api/admin/rename', {
      method: 'POST',
      body: {
        folder: props.currentFolder,
        oldFile: targetFile.value.name,
        newName: newFileName.value // A API trata a extensão
      }
    });

    renameDialogVisible.value = false;
    emit('refresh'); // Atualiza a lista
    
  } catch (error) {
    console.error('Erro ao renomear:', error);
    alert('Erro ao renomear arquivo.');
  } finally {
    renameLoading.value = false;
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
               :class="['group flex items-center justify-between p-3 rounded-sm cursor-pointer transition-all border border-transparent pr-2 select-none', currentFile === file.name ? 'bg-[#6f942e]/10 border-[#6f942e]/30 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300']">
            
            <div class="flex items-center gap-3 overflow-hidden">
               <i class="drag-handle pi pi-bars text-[10px] text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400 p-1"></i>
               
               <i :class="[file.isDirectory ? 'pi pi-folder text-yellow-600 text-lg' : 'pi pi-file text-indigo-400 text-lg']"></i>
               
               <span class="text-sm font-medium truncate">{{ file.isDirectory ? file.name : removeExtension(file.name) }}</span>
            </div>

            <button 
              @click.stop="openRenameDialog(file)" 
              class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white focus:opacity-100"
              title="Renomear"
            >
              <i class="pi pi-pencil text-xs"></i>
            </button>

          </div>
        </VueDraggable>

      </div>
    </div>

    <Dialog v-model:visible="renameDialogVisible" modal header="Renomear Item" :style="{ width: '350px' }" class="p-fluid bg-[#141b18]">
      <div class="flex flex-col gap-4 pt-2">
        <div>
          <label class="text-xs font-bold uppercase text-slate-500 block mb-2">Novo Nome</label>
          <InputText 
            v-model="newFileName" 
            class="w-full bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e]" 
            autofocus 
            @keyup.enter="confirmRename" 
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" text severity="secondary" @click="renameDialogVisible = false" size="small" />
          <Button label="Salvar" icon="pi pi-check" @click="confirmRename" :loading="renameLoading" class="bg-[#6f942e] border-none text-black font-bold" size="small" />
        </div>
      </template>
    </Dialog>

  </Drawer>
</template>