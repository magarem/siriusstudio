<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  files: { type: Array, default: () => [] },
  currentFolder: { type: String, default: "content" },
  currentFile: { type: String, default: "" },
  isCollectionFolder: { type: Boolean, default: false },
  siteContext: String,
});

const emit = defineEmits([
  "navigate",
  "select",
  "refresh",
  "create-file",
  "create-folder",
  "create-collection",
  "back",
]);

const toast = useToast();
const showDraggable = ref(true);
const showHiddenFiles = ref(false);
const isRefreshing = ref(false);
// --- ESTADO LOCAL ---
const localFiles = ref([]);
const indexFile = ref(null);

const removeExtension = (filename) => filename.replace(/\.[^/.]+$/, "");

const filteredFiles = computed(() => {
  if (showHiddenFiles.value) return props.files;

  // Filtra arquivos e pastas que começam com "_"
  return props.files.filter(
    (file) => !file.name.startsWith("_") && !file.name.startsWith("."),
  );
});

// --- NOME AMIGÁVEL PARA O INDEX (CAPA) ---
const indexLabel = computed(() => {
  // Se estiver na raiz do conteúdo
  if (!props.currentFolder || props.currentFolder === 'content') {
    return 'Home do Site';
  }

  // Pega o nome da pasta (ex: "quem-somos")
  const folderName = props.currentFolder.split('/').pop();
  
  // Formata: "quem-somos" -> "Quem Somos"
  const formatted = folderName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
    
  return `Capa de ${formatted}`;
});

const handleRefresh = () => {
  isRefreshing.value = true;
  emit("refresh");
  setTimeout(() => { isRefreshing.value = false; }, 500);
};


// --- WATCHER & FILTRO (FileManager.vue) ---
watch(
  () => props.files,
  async (newFiles) => {
    showDraggable.value = false;
    const allFiles = [...(newFiles || [])];

    const candidates = ["_index.md", "index.md", "_index.json", "_index.yml"];

    // 1. Identifica o Index (Sempre mostramos ele, pois é a "Capa" da pasta/coleção)
    indexFile.value = allFiles.find(
      (f) => !f.isDirectory && candidates.includes(f.name.toLowerCase()),
    );

    // 2. Lógica de Filtragem da Lista
    if (props.isCollectionFolder) {
      // === MODO COLEÇÃO ===
      // Se estamos numa coleção, a lista principal já está na tela central.
      // Então, na sidebar, ESCONDEMOS a lista de filhos para limpar a visão.
      localFiles.value = [];
    } else {
      // === MODO PASTA COMUM ===
      // Mostra os arquivos normalmente na sidebar
      localFiles.value = allFiles.filter((f) => {
        // Remove o indexFile da lista (já está no topo)
        if (indexFile.value && f.name === indexFile.value.name) return false;

        if (f.isDirectory) return true;
        return [".md", ".json", ".yml", ".toml", ".yaml"].some((ext) =>
          f.name.toLowerCase().endsWith(ext),
        );
      });

      // Ordenação: Pastas > Arquivos
      localFiles.value.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    await nextTick();
    showDraggable.value = true;
  },
  { immediate: true, deep: true },
);

// components/admin/FileManager.vue

const handleItemClick = (file) => {
  // Pega o caminho atual da pasta onde estamos listando (ex: "content" ou "content/institucional")
  // Remove barras extras no final para evitar "content//file"
  const baseFolder = props.currentFolder.replace(/\/$/, "");

  if (file.isDirectory) {
    // === É UMA PASTA ===

    // Verifica se é Pasta Estrutural (.isDirFlag existe)
    if (file.data?.isDir) {
      // Navega para dentro (mantemos relativo aqui, pois o navigate soma ao folder atual)
      emit("navigate", file.name);
    } else {
      // É uma Pasta-Página: Abre o _index.md
      // CORREÇÃO: Montamos o caminho COMPLETO aqui
      const fullPath = `${baseFolder}/${file.name}/_index.md`;
      emit("select", fullPath);
    }
  } else {
    // === É UM ARQUIVO SOLTO ===
    // CORREÇÃO: Montamos o caminho COMPLETO aqui
    const fullPath = `${baseFolder}/${file.name}`;
    emit("select", fullPath);
  }
};

const handleIndexClick = () => {
  if (indexFile.value) {
    emit("select", indexFile.value.name);
  }
};

// --- DRAG AND DROP ---
const onDragEnd = async () => {
  const orderedNames = localFiles.value.map((f) => f.name);
  try {
    await $fetch("/api/admin/reorder", {
      method: "POST",
      body: { folder: props.currentFolder, files: orderedNames },
    });
    emit("refresh");
  } catch (error) {
    console.error("Erro ao reordenar");
  }
};

// --- MENU DE CONTEXTO ---
const contextMenu = ref();
const activeMenuFile = ref(null);
// Itens básicos do menu (implementar lógica real conforme necessidade)
// --- MENUS ---
const menuItems = ref([
  {
    label: "Renomear",
    icon: "pi pi-pencil",
    command: () => openRenameDialog(activeMenuFile.value),
  },
  {
    label: "Mover para...",
    icon: "pi pi-folder-open",
    command: () => openMoveDialog(activeMenuFile.value),
  },
  { separator: true },
  {
    label: "Excluir",
    icon: "pi pi-trash",
    class: "text-red-400 hover:text-red-500",
    command: () => confirmDelete(activeMenuFile.value),
  },
]);

const toggleMenu = (event, file) => {
  // BLOQUEIO: Não abre menu para arquivos de índice (_index ou index)
  if (/^(_?index)\.(md|json|yml|yaml|toml)$/i.test(file.name)) {
      return;
  }

  activeMenuFile.value = file;
  contextMenu.value.toggle(event);
};

// --- DIALOGS (Renomear, Mover, Excluir) ---
const renameDialogVisible = ref(false);
const renameLoading = ref(false);
const targetFile = ref(null);
const newFileName = ref("");


const isIndexActive = computed(() => {
  if (!indexFile.value || !props.currentFile) return false;
  
  // Caminho EXATO do index (ex: content/blog/_index.md)
  const expectedIndex = `${props.currentFolder}/${indexFile.value.name}`.replace(/\/+/g, '/');
  
  // Caminho do arquivo atual
  const current = props.currentFile.replace(/\/+/g, '/');

  // A COMPARAÇÃO DEVE SER EXATA (===)
  // Antes podia estar usando includes() ou endsWith() de forma solta
  return current === expectedIndex;
});

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
    const extension = oldName.includes(".")
      ? "." + oldName.split(".").pop()
      : "";
    let finalNewName = newFileName.value;
    if (!finalNewName.toLowerCase().endsWith(extension) && extension)
      finalNewName += extension;
    const fullOldPath = `${props.currentFolder}/${oldName}`;
    const fullNewPath = `${props.currentFolder}/${finalNewName}`;
    const response = await $fetch("/api/admin/rename", {
      method: "POST",
      body: { oldname: fullOldPath, newname: fullNewPath },
    });
    toast.add({ severity: "success", summary: "Renomeado", life: 2000 });
    renameDialogVisible.value = false;
    emit("refresh");
    if (props.currentFile && props.currentFile.endsWith(oldName)) {
      emit("select", response?.newname || fullNewPath);
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: error.data?.message,
    });
  } finally {
    renameLoading.value = false;
  }
};

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
      body: { folder: props.currentFolder, file: itemToDelete.value.name },
    });
    toast.add({ severity: "success", summary: "Excluído", life: 2000 });
    emit("refresh");
    deleteDialogVisible.value = false;
    itemToDelete.value = null;
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Falha ao excluir.",
    });
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
    const parts = path.split("/");
    let currentLevel = root;
    let currentPath = "";
    parts.forEach((part) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let existingNode = currentLevel.find((n) => n.label === part);
      if (!existingNode) {
        existingNode = {
          key: currentPath,
          label: part,
          data: currentPath,
          icon: "pi pi-fw pi-folder",
          children: [],
        };
        currentLevel.push(existingNode);
      }
      currentLevel = existingNode.children;
    });
  });
  return root;
};
const openMoveDialog = async (file) => {
  itemToMove.value = file;
  destinationPath.value = props.currentFolder;
  try {
    const folders = await $fetch("/api/admin/folders", {
      query: { site: props.siteContext },
    });
    const relevantFolders = folders.filter((p) => !p.includes("."));
    folderTree.value = buildTree(relevantFolders);
    const _expanded = {};
    relevantFolders.forEach((path) => {
      _expanded[path] = true;
    });
    expandedNodeKeys.value = _expanded;
    if (props.currentFolder)
      selectedNodeKey.value = { [props.currentFolder]: true };
    moveDialogVisible.value = true;
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao carregar pastas.",
    });
  }
};
const onNodeSelect = (node) => {
  destinationPath.value = node.key;
};
const handleMove = async () => {
  if (!itemToMove.value || !destinationPath.value) return;
  moveLoading.value = true;
  try {
    const response = await $fetch("/api/admin/rename", {
      method: "POST",
      body: {
        oldname: `${props.currentFolder}/${itemToMove.value.name}`,
        newname: `${destinationPath.value}/${itemToMove.value.name}`,
      },
    });
    toast.add({ severity: "success", summary: "Movido", life: 2000 });
    moveDialogVisible.value = false;
    emit("refresh");
    if (
      props.currentFile &&
      props.currentFile.endsWith(itemToMove.value.name)
    ) {
      emit(
        "select",
        response?.newname ||
          `${destinationPath.value}/${itemToMove.value.name}`,
      );
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: error.data?.message,
    });
  } finally {
    moveLoading.value = false;
  }
};
</script>

<template>
  <div
    class="flex flex-col h-full bg-[#141b18] border-r border-white/5 w-full overflow-hidden"
  >
    <div
      class="p-3 border-b border-white/5 shrink-0 flex items-center justify-between bg-[#141b18] z-10"
    >
      <div class="flex items-center gap-1 overflow-hidden select-none">
        <button
          @click="emit('navigate', { path: 'content', absolute: true })"
          class="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-[#6f942e] transition-colors shrink-0"
          title="Ir para a Raiz"
        >
          <i class="pi pi-home text-xs"></i>
        </button>

        <div class="w-[1px] h-3 bg-white/10 mx-0.5 shrink-0"></div>

        <div
          class="flex items-center gap-1 text-xs font-mono text-slate-400 max-w-[120px]"
        >
          <span class="truncate" :title="currentFolder">{{
            currentFolder.split("/").pop()
          }}</span>
        </div>
      </div>

      <div class="flex items-center gap-0.5">
        <button
          @click="emit('back')"
          class="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          :disabled="
            !currentFolder.includes('/') || currentFolder === 'content'
          "
          :class="{
            'opacity-30 cursor-not-allowed':
              !currentFolder.includes('/') || currentFolder === 'content',
          }"
          title="Subir nível"
        >
          <i class="pi pi-arrow-up text-xs"></i>
        </button>

        <div class="w-[1px] h-3 bg-white/10 mx-1"></div>

        <button
          @click="emit('create-file')"
          class="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          title="Nova Página"
        >
          <i class="pi pi-file-plus text-xs"></i>
        </button>
        <button
          @click="emit('create-folder')"
          class="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          title="Nova Pasta"
        >
          <i class="pi pi-folder-plus text-xs"></i>
        </button>
        <button
          @click="emit('create-collection')"
          class="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          title="Nova Coleção"
        >
          <i class="pi pi-database text-xs"></i>
        </button>

        <div class="w-[1px] h-3 bg-white/10 mx-1"></div>

        <button
  @click="handleRefresh"
  class="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
  title="Atualizar"
>
  <i class="pi pi-refresh text-xs" :class="{ 'pi-spin': isRefreshing }"></i>
</button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
 
    <div
  v-if="indexFile"
  @click="handleIndexClick"
  class="group flex items-center justify-between p-2 mb-2 rounded border border-transparent cursor-pointer transition-all select-none"
  :class="[
    isIndexActive
      ? 'bg-white/10 text-white' 
      : 'hover:bg-white/5 text-slate-400'
  ]"
>
  <div class="flex items-center gap-2 overflow-hidden">
    <i class="pi" 
       :class="currentFolder === 'content' ? 'pi-home' : 'pi-id-card'" 
       :style="{ color: isIndexActive ? '#6f942e' : '#64748b' }">
    </i>
    
    <span class="text-sm truncate" :class="{ 'font-bold': isIndexActive }">
      {{ indexLabel }}
    </span>
  </div>
</div>

      <VueDraggable
        v-if="showDraggable"
        v-model="localFiles"
        :animation="150"
        @end="onDragEnd"
        class="flex flex-col gap-0.5"
        ghost-class="ghost-card"
        handle=".drag-handle"
      >
        <div
          v-for="file in filteredFiles"
          :key="file.name"
          @click="handleItemClick(file)"
          @contextmenu.prevent="toggleMenu($event, file)"
          class="group flex items-center gap-2 p-2 rounded border border-transparent cursor-pointer select-none transition-all"
          :class="[
            currentFile.includes(`${currentFolder}/${file.name}`) ||
            currentFile.endsWith(`/${file.name}`)
              ? 'bg-white/10 text-white'
              : 'hover:bg-white/5 text-slate-300',
          ]"
        >
          <i
            @click.stop="emit('navigate', file.name)"
            class="drag-handle pi text-sm cursor-pointer hover:scale-110 transition-transform"
            :class="[
              file.data?.isCollection
                ? 'pi-database text-cyan-500'
                : file.isDirectory
                  ? file.data?.isDir
                    ? 'pi-folder text-amber-500/80'
                    : 'pi-file-edit text-[#6f942e]'
                  : 'pi-file text-slate-600',
            ]"
          ></i>
          <span class="text-sm truncate flex-1">{{
            file.name.replace(/\.(md|json|yml)$/, "")
          }}</span>
          <i
            class="pi pi-chevron-right text-[10px] text-slate-600 opacity-50"
            v-if="file.isDirectory"
          ></i>
        </div>
      </VueDraggable>

      <div
        v-if="localFiles.length === 0 && !indexFile"
        class="text-center py-10 opacity-30"
      >
        <p class="text-xs font-mono">Pasta vazia</p>
      </div>
    </div>

    <div
      class="p-2 border-t border-white/5 bg-black/20 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold select-none shrink-0"
    >
      <div class="pl-1">{{ filteredFiles.length }} Itens</div>
      <button
        @click="showHiddenFiles = !showHiddenFiles"
        class="flex items-center gap-1.5 px-2 py-1 rounded transition-all"
        :class="
          showHiddenFiles
            ? 'text-cyan-400 bg-cyan-400/5'
            : 'hover:bg-white/5 hover:text-slate-300'
        "
      >
        <i
          class="pi"
          :class="showHiddenFiles ? 'pi-eye' : 'pi-eye-slash'"
          style="font-size: 10px"
        ></i>
        <span>Sistema</span>
      </button>
    </div>

    <Menu ref="contextMenu" :model="menuItems" :popup="true" />
    <Dialog
      v-model:visible="renameDialogVisible"
      modal
      header="Renomear Item"
      :style="{ width: '400px' }"
      class="p-fluid bg-[#141b18]"
    >
      <div class="flex flex-col gap-3 pt-2 pb-2">
        <label class="text-xs font-bold uppercase text-slate-500 block mb-1"
          >Novo Nome</label
        >
        <InputText
          v-model="newFileName"
          class="w-full text-lg p-3 font-semibold bg-[#0a0f0d] text-white border border-white/10 focus:border-[#6f942e] focus:ring-0 transition-all rounded-md"
          autofocus
          @keydown.enter="confirmRename"
        />
        <div class="text-xs text-slate-500 flex items-center gap-2">
          <i class="pi pi-info-circle"></i> A extensão original será mantida.
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancelar"
            text
            severity="secondary"
            @click="renameDialogVisible = false"
            size="small"
          />
          <Button
            label="Salvar"
            icon="pi pi-check"
            @click="confirmRename"
            :loading="renameLoading"
            class="bg-[#6f942e] border-none text-black font-bold"
          />
        </div>
      </template>
    </Dialog>
    <Dialog
      v-model:visible="moveDialogVisible"
      modal
      header="Mover Para..."
      :style="{ width: '450px' }"
      class="p-0 bg-[#141b18]"
    >
      <div class="flex flex-col gap-4 p-1">
        <div
          class="bg-zinc-900/50 border border-white/10 rounded p-2 h-72 overflow-y-auto custom-scrollbar"
        >
          <Tree
            v-model:selectionKeys="selectedNodeKey"
            v-model:expandedKeys="expandedNodeKeys"
            :value="folderTree"
            selectionMode="single"
            class="w-full bg-transparent border-none p-0 text-sm custom-tree"
            @node-select="onNodeSelect"
          />
        </div>
        <div
          class="flex flex-col gap-2 bg-black/20 p-2 rounded border border-white/5"
        >
          <label
            class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider"
            >Destino Selecionado</label
          >
          <div class="text-xs font-mono text-[#6f942e] break-all">
            {{ destinationPath || "Selecione uma pasta acima" }}
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            label="Cancelar"
            text
            severity="secondary"
            @click="moveDialogVisible = false"
            size="small"
          />
          <Button
            label="Mover Aqui"
            icon="pi pi-arrow-right"
            @click="handleMove"
            :loading="moveLoading"
            class="bg-[#6f942e] border-none text-black font-bold"
            :disabled="!destinationPath"
          />
        </div>
      </template>
    </Dialog>
    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      header="Confirmar Exclusão"
      :style="{ width: '350px' }"
      class="p-fluid bg-[#141b18]"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div
          class="bg-red-500/10 border border-red-500/20 p-4 rounded-md flex items-start gap-3"
        >
          <i class="pi pi-exclamation-triangle text-red-400 text-xl mt-0.5"></i>
          <div>
            <p class="text-sm text-slate-200 font-bold">Você tem certeza?</p>
            <p class="text-xs text-slate-400 mt-1">
              O item
              <strong class="text-white">{{ itemToDelete?.name }}</strong> será
              excluído permanentemente.
            </p>
          </div>
        </div>
        <p
          v-if="itemToDelete?.isDirectory"
          class="text-xs text-center text-slate-500"
        >
          (Isso apagará todo o conteúdo da pasta)
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancelar"
            text
            severity="secondary"
            @click="deleteDialogVisible = false"
            size="small"
          />
          <Button
            label="Sim, Excluir"
            icon="pi pi-trash"
            severity="danger"
            @click="handleDelete"
            :loading="deleteLoading"
            size="small"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.ghost-card {
  opacity: 0.5;
  background: #6f942e20;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ffffff20;
  border-radius: 4px;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.mask-gradient {
  mask-image: linear-gradient(to right, black 90%, transparent 100%);
}
</style>
