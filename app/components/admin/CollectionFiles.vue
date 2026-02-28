<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isSchema?: boolean;
  data?: {
    title?: string;
    date?: string;
    draft?: boolean;
    coverimage?: string[] | string;
    images?: string[];
  };
}

const props = defineProps({
  files: { type: Array as () => FileItem[], default: () => [] },
  currentFolder: { type: String, default: "" },
  siteContext: { type: String, default: "" },
});

// 1. Adicionado o emit 'delete'
const emit = defineEmits(["select", "create-item", "delete", "refresh"]);

const localFiles = ref<FileItem[]>([]);
const toast = useToast(); 

const showSystemFiles = ref(false);
const extraFiles = ref<FileItem[]>([]);
const isLoadingSchemas = ref(false);

const first = ref(0);
const rows = ref(10);

const displayedFiles = computed(() => {
  if (showSystemFiles.value) return extraFiles.value;
  return localFiles.value;
});

const deleteFile = async (path: string) => {
  if (!path) return;
  try {
    await $fetch("/api/admin/storage", {
      method: "DELETE",
      body: { path }
    });
    toast.add({ severity: "success", summary: "Excluído", life: 2000 });
    emit("refresh");
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Falha ao excluir.",
    });
  } 
};

const isIndexFile = (file: FileItem) =>
  file.name.toLowerCase().startsWith("_index");

watch(
  [() => props.files, showSystemFiles],
  ([newFiles, isSystem]) => {
    if (isSystem) return;

    const list = newFiles.filter((file: FileItem) => {
      const name = file.name;
      if (name.startsWith(".")) return false;
      if (name === "_schemas") return false;
      if (name.startsWith("_") && !isIndexFile(file)) return false;
      return true;
    });

    list.sort((a, b) => {
      if (isIndexFile(a)) return -1;
      if (isIndexFile(b)) return 1;
      return 0;
    });

    localFiles.value = list;
  },
  { immediate: true, deep: true },
);

const onRowReorder = async (event: any) => {
  localFiles.value = event.value; 
  const orderedNames = localFiles.value.map((f: { name: any }) => f.name);

  try {
    await $fetch("/api/admin/reorder", {
      method: "POST",
      body: { folder: props.currentFolder, files: orderedNames },
    });
  } catch (error) {
    console.error("Erro ao salvar ordem", error);
    toast.add({ severity: "error", summary: "Erro ao reordenar" });
  }
};

watch(
  () => props.currentFolder,
  () => {
    first.value = 0;
    extraFiles.value = [];
    showSystemFiles.value = false;
  },
);

watch(showSystemFiles, async (isActive) => {
  if (!isActive) {
    extraFiles.value = [];
    return;
  }
  const schemaFolder = props.files.find(
    (f) => f.name === "_schemas" && f.isDirectory,
  );

  if (schemaFolder) {
    isLoadingSchemas.value = true;
    try {
      const schemaPath = props.currentFolder
        ? `${props.currentFolder}/_schemas`
        : "_schemas";

      const data = await $fetch("/api/admin/storage", {
        query: { folder: schemaPath, site: props.siteContext },
      });

      if (data.files) {
        extraFiles.value = data.files.map((f: any) => ({
          ...f,
          isSchema: true,
          path: f.path || `${schemaPath}/${f.name}`,
        }));
      }
    } catch (e) {
      console.error("Erro ao carregar modelos", e);
    } finally {
      isLoadingSchemas.value = false;
    }
  }
});

const filteredFiles = computed(() => {
  if (showSystemFiles.value) {
    return extraFiles.value.sort((a, b) => a.name.localeCompare(b.name));
  }
  const list = props.files.filter((file: FileItem) => {
    const name = file.name;
    if (name.startsWith(".")) return false;
    if (name === "_schemas") return false;
    if (name.startsWith("_") && !isIndexFile(file)) return false;
    return true;
  });
  return list.sort((a, b) => {
    if (isIndexFile(a)) return -1;
    if (isIndexFile(b)) return 1;
    const titleA = (a.data?.title || a.name).toLowerCase();
    const titleB = (b.data?.title || b.name).toLowerCase();
    return titleA.localeCompare(titleB);
  });
});

const onRowSelect = (event: any) => {
  emit("select", event.data);
};



// 2. Função de exclusão (com stopPropagation para não abrir o arquivo ao clicar)
const confirmDelete = (event: Event, item: FileItem) => {
  event.stopPropagation();
  const itemName = item.data?.title || item.name;
  
  if (confirm(`Tem certeza que deseja excluir "${itemName}"? \nEsta ação não poderá ser desfeita.`)) {
    deleteFile(item.path)
  }
};

const getThumbnail = (item: FileItem): string | null => {
  if (item.isSchema) return null;
  if (!item.data) return null;
  let imageName: string | null = null;
  if (Array.isArray(item.data.coverimage) && item.data.coverimage.length > 0)
    imageName = item.data.coverimage[0];
  else if (typeof item.data.coverimage === "string" && item.data.coverimage)
    imageName = item.data.coverimage;
  else if (Array.isArray(item.data.images) && item.data.images.length > 0)
    imageName = item.data.images[0];
  if (!imageName) return null;
  if (imageName.startsWith("/") || imageName.startsWith("http"))
    return imageName;
  let basePath = item.path.replace(/\/$/, "").replace(/^content\//, "assets/");
  if (!item.isDirectory)
    basePath = basePath.substring(0, basePath.lastIndexOf("/"));
  return `/${basePath}/${imageName}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};
</script>

<template>
  <div class="flex flex-col h-full bg-[#0a0f0d]">
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0f0d]"
    >
      <div class="flex flex-col">
        <h2
          class="text-xl font-bold text-slate-200 tracking-tight capitalize flex items-center gap-2"
        >
          <i
            class="pi"
            :class="
              showSystemFiles
                ? 'pi-cog text-cyan-500'
                : 'pi-database text-[#6f942e]'
            "
          ></i>

          <span v-if="!showSystemFiles">{{
            currentFolder.split("/").pop()?.replace(/-/g, " ")
          }}</span>
          <span v-else class="text-cyan-500">Modelos (_schemas)</span>
        </h2>
        <!-- <span class="text-xs text-slate-500 font-mono mt-1">
          {{ filteredFiles.length }} itens listados
        </span> -->
      </div>

      <div class="flex items-center gap-3">
        <span
          v-if="isLoadingSchemas"
          class="text-[10px] text-slate-500 italic flex items-center gap-1"
        >
          <i class="pi pi-spin pi-spinner"></i>
        </span>

      <div class="flex items-center bg-black/40 border border-white/10 rounded-md overflow-hidden shrink-0 h-[32px] shadow-lg backdrop-blur-sm">
  
  <button
    @click="showSystemFiles = !showSystemFiles"
    class="flex items-center gap-2 px-3 h-full font-black text-[10px] uppercase tracking-wider transition-all border-r border-white/5"
    :class="[
      showSystemFiles 
        ? 'bg-white/10 text-white' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    ]"
  >
    <i class="pi pi-cog text-[11px]"></i>
    <span>{{ showSystemFiles ? 'Ver Conteúdo' : 'Modelos' }}</span>
  </button>

  <button
    v-if="!showSystemFiles"
    @click="emit('create-item')"
    class="flex items-center gap-2 px-4 h-full text-slate-300 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-wider transition-all"
  >
    <i class="pi pi-plus text-[10px]"></i>
    <span>Novo Item</span>
  </button>
</div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden relative">
    <DataTable
  :value="displayedFiles"
  :reorderableRows="!showSystemFiles"
  @rowReorder="onRowReorder"
  selectionMode="single"
  :metaKeySelection="false"
  @rowSelect="onRowSelect"
  dataKey="name"
  class="text-sm h-full flex flex-col"
  scrollable
  scrollHeight="flex"
  paginator
  :rows="10"
  v-model:first="first"
  :rowsPerPageOptions="[10, 20, 50]"
  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
  currentPageReportTemplate="{first} a {last} de {totalRecords}"
  :pt="{
    root: { class: 'bg-transparent flex flex-col h-full' },
    headerRow: {
      class: 'text-slate-500 text-[10px] uppercase tracking-widest font-black border-b border-white/5',
    },
    bodyRow: ({ context }) => ({
      class: [
        'transition-colors border-b border-white/5 text-slate-300',
        context.selected ? 'bg-white/10 text-white' : 'hover:bg-white/5 cursor-pointer', 
      ],
    }),
    paginator: {
      root: { class: 'bg-black/20 border-t border-white/10 p-2' },
      current: { class: 'text-[10px] text-slate-500 uppercase font-bold ml-auto' },
      pages: { class: 'flex gap-1' },
      pageButton: ({ context }) => ({
        class: [
          'w-7 h-7 rounded text-[10px] transition-all font-bold',
          context.active
            ? 'bg-white text-black'
            : 'text-slate-500 hover:bg-white/10 hover:text-white',
        ],
      }),
      prevPageButton: { class: 'text-slate-500 hover:text-white' },
      nextPageButton: { class: 'text-slate-500 hover:text-white' },
      firstPageButton: { class: 'text-slate-500 hover:text-white' },
      lastPageButton: { class: 'text-slate-500 hover:text-white' },
      rowsPerPageDropdown: { class: 'bg-transparent border-white/10 text-slate-400 text-[10px]' }
    },
  }"
>
  <Column rowReorder headerStyle="width: 3rem" v-if="!showSystemFiles" />
  
  <Column header="Título" class="font-medium" sortable field="data.title">
    <template #body="{ data }">
      <div class="flex flex-col py-2.5">
        <div class="flex items-center gap-2">
          <span
            class="text-[13px] tracking-tight"
            :class="[
              isIndexFile(data)
                ? 'text-white font-black' 
                : 'text-slate-300 font-medium',
            ]"
          >
            {{ data.data?.title || data.name.replace(/-/g, " ") }}
          </span>

          <span
            v-if="isIndexFile(data)"
            class="text-[8px] border border-white/20 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter font-black bg-white/10"
          >
            Capa
          </span>

          <span
            v-if="data.isSchema"
            class="text-[8px] border border-white/10 text-slate-400 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter font-bold bg-white/5"
          >
            Modelo
          </span>
        </div>
        
        <span class="text-[10px] text-slate-600 font-mono mt-0.5">
          {{ data.name }}
        </span>
      </div>
    </template>
  </Column>

  <Column header="Data" style="width: 8rem" sortable field="data.date">
    <template #body="{ data }">
      <span class="text-slate-500 text-[11px] font-mono">{{ formatDate(data.data?.date) }}</span>
    </template>
  </Column>

  <Column header="Status" style="width: 7rem" field="data.draft">
    <template #body="{ data }">
      <span
        v-if="data.data?.draft === true"
        class="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"
      >
        <span class="w-1 h-1 rounded-full bg-amber-600 shadow-[0_0_5px_rgba(217,119,6,0.5)]"></span> Rascunho
      </span>
      <span
        v-else-if="data.isSchema"
        class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
      >
        <i class="pi pi-cog text-[10px]"></i> Config
      </span>
      <span
        v-else
        class="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5"
      >
        <span class="w-1 h-1 rounded-full bg-white/20"></span> Publicado
      </span>
    </template>
  </Column>

  <Column header="" style="width: 4rem">
    <template #body="{ data }">
      <div class="flex justify-center">
        <button
          @click="confirmDelete($event, data)"
          class="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-white hover:bg-red-500/20 transition-all"
          title="Excluir item"
        >
          <i class="pi pi-trash text-[12px]"></i>
        </button>
      </div>
    </template>
  </Column>
</DataTable>

      <div
        v-if="filteredFiles.length === 0"
        class="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none"
      >
        <i class="pi pi-clone text-4xl mb-2"></i>
        <p>
          {{ showSystemFiles ? "Nenhum modelo encontrado" : "Coleção vazia" }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>