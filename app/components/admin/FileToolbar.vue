<script setup>
import { useConfirm } from "primevue/useconfirm";

const props = defineProps({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  isRaw: { type: Boolean, default: false },
  showMeta: { type: Boolean, default: false },
  allFolders: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "rename",
  "delete",
  "move",
  "toggle-raw",
  "media",
  "navigate-file",
  "toggle-meta",
]);

const confirm = useConfirm();
const pathInput = ref(props.filepath);
const isEditingPath = ref(false); // [NOVO] Para controlar estilo do input

// Sincroniza input de endereço
watch(() => props.filepath, (newVal) => { pathInput.value = newVal; });

const handleGo = () => {
  if (pathInput.value !== props.filepath) emit("navigate-file", pathInput.value);
  isEditingPath.value = false;
};

// --- LÓGICA DA ÁRVORE (Mantida igual) ---
const folderTree = ref([]);
const selectedNodeKey = ref(null);
const expandedNodeKeys = ref({});

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

// --- MODAIS ---
const isMoveVisible = ref(false);
const newPath = ref("");
const isRenameVisible = ref(false);
const newName = ref("");

const openMove = () => {
  const contentFolders = props.allFolders.filter((path) => path === "content" || path.startsWith("content/"));
  folderTree.value = buildTree(contentFolders);
  const _expanded = {};
  contentFolders.forEach((path) => { _expanded[path] = true; });
  expandedNodeKeys.value = _expanded;
  if (props.filepath) {
    const currentDir = props.filepath.substring(0, props.filepath.lastIndexOf("/"));
    selectedNodeKey.value = { [currentDir]: true };
  }
  isMoveVisible.value = true;
};

const onNodeSelect = (node) => { newPath.value = `${node.key}/${props.filename}`; };
const handleMove = () => { emit("move", newPath.value); isMoveVisible.value = false; };

// --- LÓGICA DE RENOMEAR SEM EXTENSÃO ---
const openRename = () => {
  // Remove a extensão .md (ou qualquer outra) apenas visualmente
  newName.value = props.filename.replace(/\.[^/.]+$/, "");
  isRenameVisible.value = true;
};

const handleRename = () => {
  if (!newName.value) return;

  // Recupera a extensão original
  const originalExt = props.filename.includes('.') ? '.' + props.filename.split('.').pop() : '';
  
  let finalName = newName.value;

  // Se o usuário não digitou a extensão, a gente coloca de volta
  if (!finalName.endsWith(originalExt) && originalExt) {
    finalName += originalExt;
  }

  emit("rename", finalName);
  isRenameVisible.value = false;
};

const handleDelete = (event) => {
  confirm.require({
    header: 'Confirmar exclusão',
    target: event.currentTarget,
    message: `Tem certeza que deseja excluir "${props.filename}"?`,
    icon: "pi pi-exclamation-triangle",
    rejectLabel: "Cancelar",
    acceptLabel: "Excluir",
    acceptClass: "p-button-danger",
    accept: () => emit("delete"),
  });
};
</script>

<template>
  <div class="w-full flex items-center justify-between bg-zinc-100 dark:bg-[#18181b] border-b border-zinc-300 dark:border-zinc-700 h-12 px-4 rounded-t-lg transition-colors select-none gap-6">
    
    <div class="flex-1 max-w-3xl flex items-center gap-2 group relative">
        <i class="pi pi-file text-zinc-400 group-hover:text-[#6f942e] transition-colors"></i>
        
        <div class="relative w-full">
            <InputText
            v-model="pathInput"
            @keydown.enter="handleGo"
            @focus="isEditingPath = true"
            @blur="isEditingPath = false"
            placeholder="caminho/do/arquivo.md"
            class="w-full font-mono text-sm bg-transparent border-transparent text-zinc-600 dark:text-zinc-300 focus:bg-white dark:focus:bg-[#0a0f0d] focus:border-zinc-300 dark:focus:border-zinc-600 transition-all px-2 py-1 rounded"
            :class="{ '!pl-2 !border-transparent hover:bg-white/5': !isEditingPath }"
            />
        </div>

        <Button
            v-if="isEditingPath"
            icon="pi pi-arrow-right"
            text
            severity="secondary"
            size="small"
            @click="handleGo"
            class="animate-fade-in absolute right-0"
        />
    </div>

    <div class="flex items-center gap-3">
      
      <div class="flex items-center bg-white/5 dark:bg-white/5 rounded-md p-0.5 border border-zinc-300 dark:border-white/5">
          <Button
            v-tooltip.bottom="'Alternar Metadados'"
            icon="pi pi-sliders-h"
            text
            size="small"
            @click="$emit('toggle-meta')"
            class="!w-8 !h-8"
            :class="showMeta ? 'text-[#6f942e] bg-[#6f942e]/10' : 'text-zinc-500 hover:text-zinc-300'"
          />
          <Button
            v-tooltip.bottom="'Inserir Mídia'"
            icon="pi pi-images"
            text
            size="small"
            @click="$emit('media')"
            class="!w-8 !h-8 text-zinc-500 hover:text-zinc-300"
          />
          <Button
            v-tooltip.bottom="isRaw ? 'Modo Visual' : 'Modo Código (Raw)'"
            :icon="isRaw ? 'pi pi-eye' : 'pi pi-code'"
            text
            size="small"
            @click="$emit('toggle-raw')"
            class="!w-8 !h-8"
            :class="isRaw ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-500 hover:text-zinc-300'"
          />
      </div>

      <div class="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700"></div>

      <div class="flex items-center gap-1">
          <Button
            v-tooltip.bottom="'Renomear'"
            icon="pi pi-pencil"
            text
            severity="secondary"
            size="small"
            @click="openRename"
            class="!w-8 !h-8 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          />
          <Button
            v-tooltip.bottom="'Mover'"
            icon="pi pi-folder-open"
            text
            severity="secondary"
            size="small"
            @click="openMove"
            class="!w-8 !h-8 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          />
          <Button
            v-tooltip.bottom="'Excluir'"
            icon="pi pi-trash"
            text
            severity="danger"
            size="small"
            @click="handleDelete"
            class="!w-8 !h-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          />
      </div>

    </div>
  </div>

  <Dialog v-model:visible="isRenameVisible" modal header="Renomear Arquivo" :style="{ width: '30rem' }">
    <div class="flex flex-col gap-3 pt-2 pb-4">
      <label class="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 ml-1">
        Novo Nome
      </label>
      <InputText 
        v-model="newName" 
        class="w-full text-xl p-3 font-semibold bg-zinc-50 dark:bg-[#0a0f0d] text-zinc-800 dark:text-white border border-zinc-200 dark:border-white/10 focus:border-[#6f942e] focus:ring-0 transition-all rounded-md" 
        autofocus
        placeholder="Nome do arquivo"
        @keydown.enter="handleRename"
      />
      <small class="text-xs text-zinc-400 ml-1">A extensão original será mantida automaticamente.</small>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" text severity="secondary" @click="isRenameVisible = false" size="small" />
        <Button label="Salvar Alteração" icon="pi pi-check" @click="handleRename" class="font-bold" />
      </div>
    </template>
  </Dialog>

  <Dialog v-model:visible="isMoveVisible" modal header="Mover para..." :style="{ width: '30rem' }" class="p-0">
    <div class="flex flex-col gap-4">
      <div class="bg-zinc-50 dark:bg-[#0f1211] border border-zinc-200 dark:border-white/10 rounded p-2 h-64 overflow-y-auto custom-scrollbar">
        <Tree
          v-model:selectionKeys="selectedNodeKey"
          v-model:expandedKeys="expandedNodeKeys"
          :value="folderTree"
          selectionMode="single"
          class="w-full bg-transparent border-none p-0 text-sm"
          @node-select="onNodeSelect"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs text-zinc-500 uppercase font-bold">Destino Final</label>
        <InputText v-model="newPath" class="w-full font-mono text-sm" />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2 mt-4">
        <Button label="Cancelar" text severity="secondary" @click="isMoveVisible = false" />
        <Button label="Mover" icon="pi pi-send" @click="handleMove" :disabled="!newPath" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateX(-5px); }
    to { opacity: 1; transform: translateX(0); }
}
</style>