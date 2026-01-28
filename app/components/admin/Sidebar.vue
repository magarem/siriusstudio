<script setup>
import { ref, watch, computed } from 'vue';
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

// Opções para o SelectBox (Dropdown)
const roots = ['content', 'pages', 'components', 'data', 'layouts'];
const rootOptions = roots.map(r => ({ label: r.toUpperCase(), value: r }));

// Computed para controlar o Dropdown
const selectedRoot = computed({
  get: () => {
    if (!props.currentFolder) return 'content';
    return props.currentFolder.split('/')[0];
  },
  set: (val) => {
    emit('change-root', val);
  }
});

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

// --- MENU DE CONTEXTO ---
const menu = ref();
const activeMenuFile = ref(null);

const toggleMenu = (event, file) => {
    activeMenuFile.value = file;
    menu.value.toggle(event);
};

const menuItems = ref([
    {
        label: 'Renomear',
        icon: 'pi pi-pencil',
        command: () => openRenameDialog(activeMenuFile.value)
    },
    {
        label: 'Mover',
        icon: 'pi pi-arrow-right-arrow-left',
        command: () => openMoveDialog(activeMenuFile.value)
    },
    { separator: true },
    {
        label: 'Excluir',
        icon: 'pi pi-trash',
        class: 'text-red-400 hover:text-red-500',
        command: () => confirmDelete(activeMenuFile.value)
    }
]);

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
    
    if (!finalNewName.endsWith(extension) && extension) { finalNewName += extension; }

    const fullOldPath = `${props.currentFolder}/${oldName}`;
    const fullNewPath = `${props.currentFolder}/${finalNewName}`;

    const response = await $fetch('/api/admin/rename', {
      method: 'POST',
      body: { oldname: fullOldPath, newname: fullNewPath }
    });

    toast.add({ severity: 'success', summary: 'Renomeado', detail: 'Atualizado com sucesso.', life: 2000 });
    renameDialogVisible.value = false;
    emit('refresh'); 
    
    if (props.currentFile && props.currentFile.endsWith(oldName)) {
        if (response && response.newname) {
             emit('select', response.newname);
        } else {
             emit('select', fullNewPath);
        }
    }

  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: error.data?.message || 'Falha ao renomear arquivo.' });
  } finally {
    renameLoading.value = false;
  }
};

// --- EXCLUIR ---
const deleteDialogVisible = ref(false);
const itemToDelete = ref(null);
const deleteLoading = ref(false);

const confirmDelete = (file) => {
  itemToDelete.value = file;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (!itemToDelete.value) return;
  deleteLoading.value = true;

  try {
    await $fetch("/api/admin/storage", {
      method: "DELETE",
      body: {
        folder: props.currentFolder,
        file: itemToDelete.value.name,
      },
    });

    toast.add({ severity: "success", summary: "Excluído", detail: "Item removido com sucesso.", life: 2000 });
    
    // if (props.currentFile && props.currentFile.endsWith(itemToDelete.value.name)) {
    //     emit('delete', itemToDelete.value); 
    // }
    
    emit('refresh');
    deleteDialogVisible.value = false;
    itemToDelete.value = null;

  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Erro", detail: "Não foi possível excluir o item." });
  } finally {
    deleteLoading.value = false;
  }
};

// --- MOVER (LÓGICA NOVA COM ÁRVORE) ---
const moveDialogVisible = ref(false);
const itemToMove = ref(null);
const moveLoading = ref(false);
const folderTree = ref([]);
const selectedNodeKey = ref(null);
const expandedNodeKeys = ref({});
const newPath = ref(""); // Caminho final absoluto

// Função auxiliar para construir a árvore (igual ao FileToolbar)
const buildTree = (paths) => {
  const root = [];
  paths.forEach((path) => {
    const parts = path.split("/");
    let currentLevel = root;
    let currentPath = "";
    parts.forEach((part) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let existingNode = currentLevel.find((n) => n.label === part);
      if (!existingNode) {
        existingNode = { key: currentPath, label: part, data: currentPath, icon: "pi pi-fw pi-folder", children: [] };
        currentLevel.push(existingNode);
      }
      currentLevel = existingNode.children;
    });
  });
  return root;
};

const openMoveDialog = async (file) => {
  itemToMove.value = file;
  newPath.value = ""; // Limpa caminho anterior
  
  // 1. Busca pastas atualizadas
  try {
    const folders = await $fetch('/api/admin/folders', { 
        query: { site: props.siteContext } 
    });
    
    // 2. Filtra apenas pastas de conteúdo
    const contentFolders = folders.filter((path) => path === "content" || path.startsWith("content/"));
    
    // 3. Monta a Árvore
    folderTree.value = buildTree(contentFolders);
    
    // 4. Expande tudo
    const _expanded = {};
    contentFolders.forEach((path) => { _expanded[path] = true; });
    expandedNodeKeys.value = _expanded;
    
    // 5. Seleciona a pasta atual
    if (props.currentFolder) {
        selectedNodeKey.value = { [props.currentFolder]: true };
    }
    
    moveDialogVisible.value = true;
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as pastas.' });
  }
};

const onNodeSelect = (node) => { 
    // Monta o novo caminho: Pasta Selecionada + Nome do Arquivo Atual
    if (itemToMove.value) {
        newPath.value = `${node.key}/${itemToMove.value.name}`; 
    }
};

const handleMove = async () => {
  if (!itemToMove.value || !newPath.value) return;
  moveLoading.value = true;

  const oldPathFull = `${props.currentFolder}/${itemToMove.value.name}`;

  try {
    const response = await $fetch('/api/admin/rename', {
      method: 'POST',
      body: { oldname: oldPathFull, newname: newPath.value }
    });

    toast.add({ severity: 'success', summary: 'Movido', detail: `Sucesso!`, life: 2000 });
    moveDialogVisible.value = false;
    emit('refresh');

    // Se moveu o arquivo atual, atualiza a seleção
    if (props.currentFile && props.currentFile.endsWith(itemToMove.value.name)) {
         if (response && response.newname) {
             emit('select', response.newname);
        } else {
             emit('select', newPath.value);
        }
    }
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: error.data?.message || 'Erro ao mover item.' });
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
      <div class="flex flex-col w-full pr-4">
        <div class="flex items-center gap-2 mb-1">
           <i class="pi pi-star-fill text-[#6f942e] text-sm"></i>
           <span class="font-black text-slate-100 tracking-tighter text-[20px]">Sirius Studio</span>
        </div>
        <div class="flex items-center gap-2 pl-6 opacity-80">
            <span class="text-[10px] font-bold uppercase tracking-widest text-[#6f942e] truncate">
                {{ siteContext || 'Sem contexto' }}
            </span>
        </div>
      </div>
    </template>
    
    <div class="flex flex-col h-full w-full">
      <div class="p-3 border-b border-white/5 bg-[#141b18] shrink-0 z-10 flex flex-col gap-3">
        <div class="flex items-center gap-2">
            <Dropdown 
                v-model="selectedRoot" 
                :options="rootOptions" 
                optionLabel="label" 
                optionValue="value"
                class="w-full custom-dropdown !h-9 flex items-center"
            />
            <Button 
                icon="pi pi-file-plus" 
                class="!w-9 !h-9 !p-0 bg-[#6f942e] border-none text-black shrink-0" 
                v-tooltip.bottom="'Novo Arquivo'"
                @click="emit('create-file')" 
            />
            <Button 
                icon="pi pi-folder-plus" 
                class="!w-9 !h-9 !p-0 bg-white/10 border-none text-slate-300 hover:bg-white/20 shrink-0" 
                v-tooltip.bottom="'Nova Pasta'"
                @click="emit('create-folder')" 
            />
        </div>
        <div class="flex items-center gap-2">
            <Button 
                icon="pi pi-arrow-up"
                class="!w-8 !h-8 !p-0 shrink-0"
                :class="currentFolder.includes('/') ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'opacity-30 cursor-not-allowed bg-transparent border border-white/5 text-slate-600'"
                :disabled="!currentFolder.includes('/')"
                v-tooltip.bottom="'Voltar nível'"
                @click="emit('back')"
            />
            <div class="flex-1 bg-black/40 border border-white/5 rounded px-2 py-1.5 flex items-center gap-2 overflow-hidden h-8" :title="currentFolder">
                <i class="pi pi-folder-open text-[#6f942e] text-[10px] shrink-0"></i>
                <span class="text-[10px] font-mono text-slate-300 truncate select-all leading-none mt-0.5">
                    /{{ currentFolder }}
                </span>
            </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
        <VueDraggable 
          v-model="localFiles"
          :animation="150"
          @end="onDragEnd"
          class="flex flex-col gap-1"
          handle=".drag-handle"
        >
          <div v-for="file in localFiles" :key="file.name" 
               @click="file.isDirectory ? emit('navigate', file.name) : emit('select', file.name)"
               :class="['group flex items-center justify-between p-3 rounded-sm transition-all border border-transparent pr-2 select-none', currentFile === (file.isDirectory ? '' : `${currentFolder}/${file.name}`) ? 'bg-[#6f942e]/10 border-[#6f942e]/30 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300']">
            
            <div class="flex items-center gap-3 overflow-hidden  w-full">
               <i class="drag-handle cursor-grab active:cursor-grabbing" :class="[file.isDirectory ? 'pi pi-folder text-yellow-600 text-lg' : 'pi pi-file text-indigo-400 text-lg']"></i>
               <span class="text-sm font-medium truncate">{{ file.isDirectory ? file.name : removeExtension(file.name) }}</span>
            </div>

            <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pl-2">
              <Button 
                icon="pi pi-ellipsis-v" 
                text 
                rounded 
                class="!w-7 !h-7 !p-0 text-slate-400 hover:text-white hover:bg-white/10"
                @click.stop="toggleMenu($event, file)"
              />
            </div>
          </div>
        </VueDraggable>
      </div>
    </div>

    <Menu ref="menu" :model="menuItems" :popup="true" class="custom-context-menu" />

    <Dialog v-model:visible="renameDialogVisible" modal header="Renomear Item" :style="{ width: '30rem' }" class="p-fluid bg-[#141b18]">
      <div class="flex flex-col gap-3 pt-2 pb-4">
        <label class="text-xs font-bold uppercase text-slate-500 block mb-1">Novo Nome</label>
        <InputText 
            v-model="newFileName" 
            class="w-full text-xl p-3 font-semibold bg-[#0a0f0d] text-white border border-white/10 focus:border-[#6f942e] focus:ring-0 transition-all rounded-md" 
            autofocus 
            @keydown.enter="confirmRename" 
        />
        <small class="text-xs text-slate-500">A extensão original será mantida.</small>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" text severity="secondary" @click="renameDialogVisible = false" size="small" />
          <Button label="Salvar" icon="pi pi-check" @click="confirmRename" :loading="renameLoading" class="bg-[#6f942e] border-none text-black font-bold" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="moveDialogVisible" modal header="Mover Para..." :style="{ width: '30rem' }" class="p-0 bg-[#141b18]">
      <div class="flex flex-col gap-4">
        <div class="bg-zinc-50 dark:bg-[#0a0f0d] border border-zinc-200 dark:border-white/10 rounded p-2 h-64 overflow-y-auto custom-scrollbar">
          <Tree
            v-model:selectionKeys="selectedNodeKey"
            v-model:expandedKeys="expandedNodeKeys"
            :value="folderTree"
            selectionMode="single"
            class="w-full bg-transparent border-none p-0 text-sm custom-tree"
            @node-select="onNodeSelect"
          />
        </div>
        
        <div class="flex flex-col gap-2 p-1">
          <label class="text-xs text-zinc-500 uppercase font-bold">Caminho de Destino</label>
          <InputText v-model="newPath" class="w-full font-mono text-sm bg-[#0a0f0d] border-white/10 text-white" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancelar" text severity="secondary" @click="moveDialogVisible = false" size="small" />
          <Button label="Mover" icon="pi pi-send" @click="handleMove" :loading="moveLoading" class="bg-[#6f942e] border-none text-black font-bold" :disabled="!newPath" />
        </div>
      </template>
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
          <Button label="Excluir" icon="pi pi-trash" severity="danger" @click="handleDelete" :loading="deleteLoading" size="small" />
        </div>
      </template>
    </Dialog>
  </Drawer>
</template>

<style scoped>
/* Estilos existentes... */
:deep(.custom-dropdown) {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
:deep(.custom-dropdown .p-dropdown-label) {
    color: #e2e8f0;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 0.5rem;
}
:deep(.custom-dropdown:hover) {
    border-color: rgba(255, 255, 255, 0.2);
}
:deep(.custom-dropdown.p-focus) {
    border-color: #6f942e;
    box-shadow: 0 0 0 1px #6f942e;
}
:deep(.custom-context-menu) {
    background: #141b18;
    border: 1px solid rgba(255, 255, 255, 0.1);
}
:deep(.custom-context-menu .p-menuitem-link) {
    background: transparent;
}
:deep(.custom-context-menu .p-menuitem-link .p-menuitem-text) {
    color: #cbd5e1;
    font-size: 0.875rem;
}
:deep(.custom-context-menu .p-menuitem-link .p-menuitem-icon) {
    color: #94a3b8;
    font-size: 0.875rem;
}
:deep(.custom-context-menu .p-menuitem-link:hover) {
    background: rgba(255, 255, 255, 0.05);
}

/* Novo estilo para a Árvore no tema Dark */
:deep(.custom-tree .p-treenode-label) {
    color: #e2e8f0; /* text-slate-200 */
}
:deep(.custom-tree .p-treenode-icon) {
    color: #d97706; /* amber-600 (folder icon) */
}
:deep(.custom-tree .p-treenode-content:hover) {
    background: rgba(255, 255, 255, 0.05);
}
:deep(.custom-tree .p-treenode-content.p-highlight) {
    background: rgba(111, 148, 46, 0.2); /* #6f942e com opacidade */
    color: #6f942e;
}
</style>