<script setup>
import { useConfirm } from "primevue/useconfirm";

const props = defineProps({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  isRaw: { type: Boolean, default: false },
  showMeta: { type: Boolean, default: false },
  // [NOVO] Recebe a lista plana de todas as pastas do sistema
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

// Sincroniza input de endereço
watch(
  () => props.filepath,
  (newVal) => {
    pathInput.value = newVal;
  },
);
const handleGo = () => {
  if (pathInput.value !== props.filepath)
    emit("navigate-file", pathInput.value);
};

// --- LÓGICA DA ÁRVORE DE DIRETÓRIOS ---
const folderTree = ref([]);
const selectedNodeKey = ref(null);

// Transforma lista plana ['content/blog', 'content/site'] em Árvore PrimeVue
const buildTree = (paths) => {
  const root = [];

  paths.forEach((path) => {
    // Quebra 'content/blog/viagens' em partes
    const parts = path.split("/");
    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // Procura se esse nó já existe no nível atual
      let existingNode = currentLevel.find((n) => n.label === part);

      if (!existingNode) {
        existingNode = {
          key: currentPath, // A chave única é o caminho completo
          label: part,
          data: currentPath, // Valor que vamos retornar
          icon: "pi pi-fw pi-folder", // Ícone de pasta
          children: [],
        };
        currentLevel.push(existingNode);
      }

      currentLevel = existingNode.children;
    });
  });
  return root;
};

// Quando abrir o modal de mover, constrói a árvore
const isMoveVisible = ref(false);
const newPath = ref(""); // Mantém compatibilidade caso queira digitar

// ... imports ...

// [NOVO] Variável para controlar quais pastas estão abertas
const expandedNodeKeys = ref({});

const openMove = () => {
  // 1. Filtra apenas pastas 'content'
  const contentFolders = props.allFolders.filter(
    (path) => path === "content" || path.startsWith("content/"),
  );

  // 2. Constrói a árvore visual
  folderTree.value = buildTree(contentFolders);

  // [NOVO] Expande TODAS as pastas filtradas
  const _expanded = {};
  contentFolders.forEach((path) => {
    _expanded[path] = true; // Define como 'true' para abrir
  });
  expandedNodeKeys.value = _expanded;

  // 3. Seleciona a pasta atual (Mantido igual)
  if (props.filepath) {
    const currentDir = props.filepath.substring(
      0,
      props.filepath.lastIndexOf("/"),
    );
    selectedNodeKey.value = { [currentDir]: true };
  }

  isMoveVisible.value = true;
};

// Quando o usuário clica num nó da árvore
const onNodeSelect = (node) => {
  // Define o novo caminho como: Pasta Selecionada + Nome do Arquivo Atual
  const folder = node.key;
  newPath.value = `${folder}/${props.filename}`;
};

const handleMove = () => {
  // Se o usuário selecionou na árvore, usa aquele valor. Se digitou manual, usa o newPath.
  emit("move", newPath.value);
  isMoveVisible.value = false;
};

// ... Resto das funções (Rename, Delete) mantidas iguais ...
const isRenameVisible = ref(false);
const newName = ref("");

const openRename = () => {
  newName.value = props.filename;
  isRenameVisible.value = true;
};
const handleRename = () => {
  if (!newName.value) return;
  emit("rename", newName.value);
  isRenameVisible.value = false;
};
const handleDelete = (event) => {
  confirm.require({
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
  <div
    class="w-full flex items-center justify-between bg-zinc-100 dark:bg-[#18181b] border-b border-zinc-300 dark:border-zinc-700 p-2 px-4 rounded-t-lg transition-colors select-none gap-4"
  >
    <div class="flex-1 max-w-2xl">
      <div class="p-inputgroup h-8">
        <span
          class="p-inputgroup-addon bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 !p-1 !min-w-[2.5rem]"
        >
          <i class="pi pi-file text-zinc-500"></i>
        </span>
        <InputText
          v-model="pathInput"
          @keydown.enter="handleGo"
          class="!h-8 !text-sm !py-1 !bg-white dark:!bg-[#0a0f0d] !border-zinc-300 dark:!border-zinc-600 font-mono text-zinc-700 dark:text-zinc-200"
        />
        <Button
          icon="pi pi-arrow-right"
          severity="secondary"
          @click="handleGo"
          class="!h-8 !w-10 bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400"
        />
      </div>
    </div>

    <div class="flex items-center gap-1 shrink-0">
      <Button
        icon="pi pi-sliders-h"
        text
        :severity="showMeta ? 'primary' : 'secondary'"
        size="small"
        @click="$emit('toggle-meta')"
        class="!p-2"
        :class="
          showMeta
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
            : 'text-zinc-600 dark:text-zinc-400'
        "
      />
      <div class="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
      <Button
        icon="pi pi-images"
        text
        severity="secondary"
        size="small"
        @click="$emit('media')"
        class="!p-2 text-zinc-600 dark:text-zinc-400"
      />
      <Button
        :icon="isRaw ? 'pi pi-eye' : 'pi pi-code'"
        text
        :severity="isRaw ? 'warn' : 'secondary'"
        size="small"
        @click="$emit('toggle-raw')"
        class="!p-2 text-zinc-600 dark:text-zinc-400"
      />
      <div class="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-2"></div>
      <Button
        icon="pi pi-pencil"
        text
        severity="secondary"
        size="small"
        @click="openRename"
        class="!p-2 text-zinc-600 dark:text-zinc-400"
      />
      <Button
        icon="pi pi-folder-open"
        text
        severity="secondary"
        size="small"
        @click="openMove"
        class="!p-2 text-zinc-600 dark:text-zinc-400"
      />
      <Button
        icon="pi pi-trash"
        text
        severity="danger"
        size="small"
        @click="handleDelete"
        class="!p-2 hover:bg-red-50 dark:hover:bg-red-900/20"
      />
    </div>
  </div>

  <Dialog
    v-model:visible="isRenameVisible"
    modal
    header="Renomear Arquivo"
    :style="{ width: '25rem' }"
  >
    <div class="flex flex-col gap-4 mb-4">
      <label class="font-semibold w-24">Novo Nome</label>
      <InputText v-model="newName" class="w-full" autofocus />
    </div>
    <div class="flex justify-end gap-2">
      <Button
        label="Cancelar"
        text
        severity="secondary"
        @click="isRenameVisible = false"
      />
      <Button label="Salvar" @click="handleRename" />
    </div>
  </Dialog>

  <Dialog
    v-model:visible="isMoveVisible"
    modal
    header="Mover para..."
    :style="{ width: '30rem' }"
    class="p-0"
  >
    <div class="flex flex-col gap-4">
      <div
        class="bg-zinc-50 dark:bg-[#0f1211] border border-zinc-200 dark:border-white/10 rounded p-2 h-64 overflow-y-auto custom-scrollbar"
      >
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
        <label class="text-xs text-zinc-500 uppercase font-bold"
          >Destino Final</label
        >
        <InputText v-model="newPath" class="w-full font-mono text-sm" />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 mt-4">
        <Button
          label="Cancelar"
          text
          severity="secondary"
          @click="isMoveVisible = false"
        />
        <Button
          label="Mover"
          icon="pi pi-send"
          @click="handleMove"
          :disabled="!newPath"
        />
      </div>
    </template>
  </Dialog>
</template>
