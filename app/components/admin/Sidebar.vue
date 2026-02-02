<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useToast } from "primevue/usetoast";

const props = defineProps({
  visible: Boolean,
  files: Array,
  currentFolder: String,
  currentFile: String, 
  siteContext: String
});

const emit = defineEmits([
  'update:visible', 'navigate', 'select', 'back', 'change-root', 
  'create-file', 'create-folder', 'refresh', 'delete' 
]);

const toast = useToast();

// --- STATE ---
const localFiles = ref([]);
const contextMenu = ref();
const activeMenuFile = ref(null);
const indexFile = ref(null);

// Controla o ciclo de vida da lista
const showDraggable = ref(true);

const removeExtension = (filename) => filename.replace(/\.[^/.]+$/, "");

// [NOVO] Pega apenas o nome da pasta atual (ex: 'blog' em vez de 'content/blog')
const currentFolderName = computed(() => {
  if (!props.currentFolder) return 'Content';
  const parts = props.currentFolder.split('/');
  return parts[parts.length - 1];
});

// --- WATCHER OTIMIZADO ---
watch(() => props.files, async (newVal) => { 
  showDraggable.value = false;

  const allFiles = newVal || [];

  // Separa a capa (_index.md)
  indexFile.value = allFiles.find(f => !f.isDirectory && (f.name === '_index.md' || f.name === 'index.md'));

  // Filtra a lista principal
  localFiles.value = allFiles.filter(f => {
    if (f === indexFile.value) return false;
    if (!f.isDirectory && (f.name === '_index.md' || f.name === 'index.md')) return false;
    
    // Filtra extensões
    if (f.isDirectory) return true;
    const allowedExtensions = ['.md', '.json', '.yml', '.yaml'];
    return allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext));
  });

  await nextTick();
  showDraggable.value = true;

}, { immediate: true });

// --- HANDLERS ---
const handleItemClick = (file) => {
  if (file.isDirectory) {
    const indexPath = `${props.currentFolder}/${file.name}/_index.md`;
    emit('select', indexPath);
    if (file.hasChildren) {
        emit('navigate', file.name);
    }
  } else {
    emit('select', file.name);
  }
};

const onDragEnd = async () => {
  const orderedNames = localFiles.value.map(f => f.name);
  try {
    await $fetch('/api/admin/reorder', { 
      method: 'POST', 
      body: { folder: props.currentFolder, files: orderedNames } 
    });
    emit('refresh'); 
  } catch (error) {
    localFiles.value = [...(props.files || [])];
  }
};

// --- MENUS ---
const menuItems = ref([
    { label: 'Renomear', icon: 'pi pi-pencil', command: () => openRenameDialog(activeMenuFile.value) },
    { label: 'Mover para...', icon: 'pi pi-folder-open', command: () => openMoveDialog(activeMenuFile.value) },
    { separator: true },
    { label: 'Excluir', icon: 'pi pi-trash', class: 'text-red-400 hover:text-red-500', command: () => confirmDelete(activeMenuFile.value) }
]);

const toggleMenu = (event, file) => {
    activeMenuFile.value = file;
    contextMenu.value.toggle(event);
};

// --- DIALOGS (Renomear, Mover, Excluir) ---
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
    if (!finalNewName.toLowerCase().endsWith(extension) && extension) finalNewName += extension;
    const fullOldPath = `${props.currentFolder}/${oldName}`;
    const fullNewPath = `${props.currentFolder}/${finalNewName}`;
    const response = await $fetch('/api/admin/rename', { method: 'POST', body: { oldname: fullOldPath, newname: fullNewPath } });
    toast.add({ severity: 'success', summary: 'Renomeado', life: 2000 });
    renameDialogVisible.value = false;
    emit('refresh'); 
    if (props.currentFile && props.currentFile.endsWith(oldName)) {
        emit('select', response?.newname || fullNewPath);
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: error.data?.message });
  } finally {
    renameLoading.value = false;
  }
};

const deleteDialogVisible = ref(false);
const itemToDelete = ref(null);
const deleteLoading = ref(false);
const confirmDelete = (file) => { itemToDelete.value = file; deleteDialogVisible.value = true; };
const handleDelete = async () => {
  if (!itemToDelete.value) return;
  deleteLoading.value = true;
  try {
    await $fetch("/api/admin/storage", { method: "DELETE", body: { folder: props.currentFolder, file: itemToDelete.value.name } });
    toast.add({ severity: "success", summary: "Excluído", life: 2000 });
    emit('refresh');
    deleteDialogVisible.value = false;
    itemToDelete.value = null;
  } catch (e) {
    toast.add({ severity: "error", summary: "Erro", detail: "Falha ao excluir." });
  } finally {
    deleteLoading.value = false;
  }
};

const moveDialogVisible = ref(false);
const itemToMove = ref(null);
const moveLoading = ref(false);
const folderTree = ref([]);
const selectedNodeKey = ref(null);
const expandedNodeKeys = ref({});
const destinationPath = ref(""); 
const buildTree = (paths) => {
  const root = [];
  paths.forEach((path) => {
    const parts = path.split("/"); let currentLevel = root; let currentPath = "";
    parts.forEach((part) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let existingNode = currentLevel.find((n) => n.label === part);
      if (!existingNode) { existingNode = { key: currentPath, label: part, data: currentPath, icon: "pi pi-fw pi-folder", children: [] }; currentLevel.push(existingNode); }
      currentLevel = existingNode.children;
    });
  }); return root;
};
const openMoveDialog = async (file) => {
  itemToMove.value = file; destinationPath.value = props.currentFolder;
  try {
    const folders = await $fetch('/api/admin/folders', { query: { site: props.siteContext } });
    const relevantFolders = folders.filter(p => !p.includes('.')); folderTree.value = buildTree(relevantFolders);
    const _expanded = {}; relevantFolders.forEach((path) => { _expanded[path] = true; }); expandedNodeKeys.value = _expanded;
    if (props.currentFolder) selectedNodeKey.value = { [props.currentFolder]: true }; moveDialogVisible.value = true;
  } catch (e) { toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar pastas.' }); }
};
const onNodeSelect = (node) => { destinationPath.value = node.key; };
const handleMove = async () => {
  if (!itemToMove.value || !destinationPath.value) return; moveLoading.value = true;
  try {
    const response = await $fetch('/api/admin/rename', { method: 'POST', body: { oldname: `${props.currentFolder}/${itemToMove.value.name}`, newname: `${destinationPath.value}/${itemToMove.value.name}` } });
    toast.add({ severity: 'success', summary: 'Movido', life: 2000 }); moveDialogVisible.value = false; emit('refresh');
    if (props.currentFile && props.currentFile.endsWith(itemToMove.value.name)) { emit('select', response?.newname || `${destinationPath.value}/${itemToMove.value.name}`); }
  } catch (error) { toast.add({ severity: 'error', summary: 'Erro', detail: error.data?.message }); } finally { moveLoading.value = false; }
};
</script>

<template>
  <aside 
    class="w-80 h-full bg-[#141b18] border-r border-white/5 flex flex-col shrink-0 transition-all duration-300"
    :class="{ 'hidden': !visible }"
  >
   
    
    <div class="flex flex-col flex-1 min-h-0 w-full overflow-hidden relative">
      
      <div class="p-3 border-b border-white/5 bg-[#141b18] shrink-0 z-10 flex flex-col gap-2">
        
        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Páginas</span>

       <div class="flex items-center gap-2">
            
            <div class="flex-1 bg-black/40 border border-white/5 rounded px-2 py-1.5 flex items-center gap-2 overflow-hidden h-8" :title="currentFolder">
                <i class="pi pi-folder-open text-[#6f942e] text-[10px] shrink-0"></i>
                <span class="text-[16px] font-mono text-slate-300 truncate select-all leading-none mt-0.5">{{ currentFolderName }}</span>
            </div>

            <div class="flex items-center bg-[#1a201d] border border-white/10 rounded overflow-hidden h-8 shrink-0">
                
                <Button 
                    icon="pi pi-arrow-up"
                    class="!w-8 !h-full !rounded-none !border-none !bg-transparent text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    :class="{ 'opacity-30 cursor-not-allowed': !currentFolder.includes('/') }"
                    :disabled="!currentFolder.includes('/')"
                    v-tooltip.bottom="'Subir nível'"
                    @click="emit('back')"
                />
                
                <div class="w-px h-4 bg-white/10"></div>

                <Button 
                    icon="pi pi-file-plus" 
                    class="!w-8 !h-full !rounded-none !border-none !bg-transparent text-[#6f942e] hover:bg-white/5 transition-colors" 
                    v-tooltip.bottom="'Novo Arquivo'" 
                    @click="emit('create-file')" 
                />
                
                <div class="w-px h-4 bg-white/10"></div>

                <Button 
                    icon="pi pi-folder-plus" 
                    class="!w-8 !h-full !rounded-none !border-none !bg-transparent text-slate-400 hover:text-white hover:bg-white/5 transition-colors" 
                    v-tooltip.bottom="'Nova Pasta'" 
                    @click="emit('create-folder')" 
                />
            </div>

        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-2 relative">
        
        <div v-if="indexFile" 
             @click="emit('select', `${currentFolder}/${indexFile.name}`)"
             @contextmenu.prevent="toggleMenu($event, indexFile)"
             class="group flex items-center justify-between p-2.5 mb-1 rounded-md transition-all border border-transparent select-none cursor-pointer"
             :class="[
                currentFile === `${currentFolder}/${indexFile.name}`
                ? 'bg-[#6f942e]/10 border-[#6f942e]/30 text-white shadow-sm' 
                : 'hover:bg-white/5 text-slate-300'
             ]"
        >
            <div class="flex items-center gap-3 overflow-hidden flex-1">
               <i class="pi pi-file text-lg text-[#6f942e]"></i>
               <span class="text-base font-bold truncate text-[#6f942e]">
                 Página principal
               </span>
            </div>
            
            <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pl-2">
               <i class="pi pi-thumbtack text-[9px] text-slate-600 rotate-45 mr-2 opacity-50" title="Fixo"></i>
               <Button icon="pi pi-ellipsis-v" text rounded class="!w-6 !h-6 !p-0 text-slate-500 hover:text-white hover:bg-white/10" @click.stop="toggleMenu($event, indexFile)" />
            </div>
        </div>
        
        <VueDraggable 
          v-if="showDraggable"
          v-model="localFiles"
          :animation="150"
          @end="onDragEnd"
          class="flex flex-col gap-1 min-h-[50px]"
          ghost-class="ghost-card"
          handle=".drag-handle"
        >
          <div v-for="file in localFiles" :key="file.name" 
               @click="handleItemClick(file)"
               @contextmenu.prevent="toggleMenu($event, file)"
               class="group flex items-center justify-between p-2.5 rounded-md transition-all border border-transparent pr-2 select-none cursor-pointer"
               :class="[
                  currentFile === `${currentFolder}/${file.name}` || 
                  (file.isDirectory && currentFile.includes(`${currentFolder}/${file.name}/_index.md`))
                  ? 'bg-[#6f942e]/10 border-[#6f942e]/30 text-white shadow-sm' 
                  : 'hover:bg-white/5 text-slate-300'
               ]"
          >
            <div class="flex items-center gap-3 overflow-hidden flex-1">
               <i class="drag-handle cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                  :class="[
                    file.hasChildren ? 'pi pi-folder text-amber-600' : 'pi pi-file text-slate-500',
                    currentFile === `${currentFolder}/${file.name}` || 
                    (file.isDirectory && currentFile.includes(`${currentFolder}/${file.name}/_index.md`))
                    ? '!text-[#6f942e]' : '',
                    'text-lg'
                  ]"
               ></i>
               <span class="text-base font-medium truncate tracking-tight">
                 {{ file.isDirectory ? file.name : removeExtension(file.name) }}
               </span>
            </div>

            <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pl-2">
              <Button icon="pi pi-ellipsis-v" text rounded class="!w-6 !h-6 !p-0 text-slate-500 hover:text-white hover:bg-white/10" @click.stop="toggleMenu($event, file)" />
            </div>
          </div>
        </VueDraggable>
        
        <div v-if="localFiles.length === 0 && !indexFile" class="text-center py-10 opacity-30">
            <i class="pi pi-folder-open text-4xl mb-2"></i>
            <p class="text-xs">Pasta vazia</p>
        </div>
      </div>
    </div>

    <Menu ref="contextMenu" :model="menuItems" :popup="true" class="custom-context-menu" />
    <Dialog v-model:visible="renameDialogVisible" modal header="Renomear Item" :style="{ width: '400px' }" class="p-fluid bg-[#141b18]">
      <div class="flex flex-col gap-3 pt-2 pb-2">
        <label class="text-xs font-bold uppercase text-slate-500 block mb-1">Novo Nome</label>
        <InputText v-model="newFileName" class="w-full text-lg p-3 font-semibold bg-[#0a0f0d] text-white border border-white/10 focus:border-[#6f942e] focus:ring-0 transition-all rounded-md" autofocus @keydown.enter="confirmRename" />
        <div class="text-xs text-slate-500 flex items-center gap-2"><i class="pi pi-info-circle"></i> A extensão original será mantida.</div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" text severity="secondary" @click="renameDialogVisible = false" size="small" />
          <Button label="Salvar" icon="pi pi-check" @click="confirmRename" :loading="renameLoading" class="bg-[#6f942e] border-none text-black font-bold" />
        </div>
      </template>
    </Dialog>
    <Dialog v-model:visible="moveDialogVisible" modal header="Mover Para..." :style="{ width: '450px' }" class="p-0 bg-[#141b18]">
      <div class="flex flex-col gap-4 p-1">
        <div class="bg-zinc-900/50 border border-white/10 rounded p-2 h-72 overflow-y-auto custom-scrollbar">
          <Tree v-model:selectionKeys="selectedNodeKey" v-model:expandedKeys="expandedNodeKeys" :value="folderTree" selectionMode="single" class="w-full bg-transparent border-none p-0 text-sm custom-tree" @node-select="onNodeSelect" />
        </div>
        <div class="flex flex-col gap-2 bg-black/20 p-2 rounded border border-white/5">
          <label class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Destino Selecionado</label>
          <div class="text-xs font-mono text-[#6f942e] break-all">{{ destinationPath || 'Selecione uma pasta acima' }}</div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancelar" text severity="secondary" @click="moveDialogVisible = false" size="small" />
          <Button label="Mover Aqui" icon="pi pi-arrow-right" @click="handleMove" :loading="moveLoading" class="bg-[#6f942e] border-none text-black font-bold" :disabled="!destinationPath" />
        </div>
      </template>
    </Dialog>
    <Dialog v-model:visible="deleteDialogVisible" modal header="Confirmar Exclusão" :style="{ width: '350px' }" class="p-fluid bg-[#141b18]">
      <div class="flex flex-col gap-4 pt-2">
        <div class="bg-red-500/10 border border-red-500/20 p-4 rounded-md flex items-start gap-3">
             <i class="pi pi-exclamation-triangle text-red-400 text-xl mt-0.5"></i>
             <div>
                 <p class="text-sm text-slate-200 font-bold">Você tem certeza?</p>
                 <p class="text-xs text-slate-400 mt-1">O item <strong class="text-white">{{ itemToDelete?.name }}</strong> será excluído permanentemente.</p>
             </div>
        </div>
        <p v-if="itemToDelete?.isDirectory" class="text-xs text-center text-slate-500">(Isso apagará todo o conteúdo da pasta)</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" text severity="secondary" @click="deleteDialogVisible = false" size="small" />
          <Button label="Sim, Excluir" icon="pi pi-trash" severity="danger" @click="handleDelete" :loading="deleteLoading" size="small" />
        </div>
      </template>
    </Dialog>
  </aside>
</template>

<style scoped>
/* Removemos os estilos do dropdown pois ele não existe mais */

/* Menu de Contexto Customizado */
:deep(.custom-context-menu) {
    background: #1a201d;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
:deep(.custom-context-menu .p-menuitem-link) {
    background: transparent;
    padding: 0.6rem 1rem;
}
:deep(.custom-context-menu .p-menuitem-link .p-menuitem-text) {
    color: #cbd5e1;
    font-size: 0.85rem;
}
:deep(.custom-context-menu .p-menuitem-link .p-menuitem-icon) {
    color: #94a3b8;
    font-size: 0.85rem;
}
:deep(.custom-context-menu .p-menuitem-link:hover) {
    background: rgba(255, 255, 255, 0.05);
}

/* Árvore (Tree) Dark Mode */
:deep(.custom-tree .p-treenode-label) {
    color: #e2e8f0;
    font-size: 0.85rem;
}
:deep(.custom-tree .p-treenode-icon) {
    color: #d97706; /* Ícone de pasta âmbar */
}
:deep(.custom-tree .p-treenode-content) {
    padding: 0.2rem;
    border-radius: 4px;
}
:deep(.custom-tree .p-treenode-content:hover) {
    background: rgba(255, 255, 255, 0.05);
}
:deep(.custom-tree .p-treenode-content.p-highlight) {
    background: rgba(111, 148, 46, 0.2);
    color: #6f942e;
}
:deep(.custom-tree .p-tree-toggler) {
    color: #64748b;
    width: 1.5rem;
    height: 1.5rem;
}

/* Dialogs */
:deep(.p-dialog-header), :deep(.p-dialog-content), :deep(.p-dialog-footer) {
    background: #141b18;
    border-color: rgba(255,255,255,0.05);
    color: white;
}
:deep(.p-dialog-header) {
    padding: 1rem;
}

/* Scrollbar Customizada */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(111, 148, 46, 0.5);
}

/* Drag Ghost */
.ghost-card {
    opacity: 0.5;
    background: rgba(111, 148, 46, 0.1);
    border: 1px dashed #6f942e;
}
</style>