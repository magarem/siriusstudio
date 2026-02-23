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

const emit = defineEmits(["select", "create-item"]);

const localFiles = ref<FileItem[]>([]);
const toast = useToast(); // Certifique-se de importar useToast

const showSystemFiles = ref(false);
const extraFiles = ref<FileItem[]>([]);
const isLoadingSchemas = ref(false);

const first = ref(0);
const rows = ref(10);

const displayedFiles = computed(() => {
  if (showSystemFiles.value) return extraFiles.value;
  return localFiles.value;
});

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

    // Apenas garante que o Index (Capa) fique no topo, o resto mantém a ordem da API
    list.sort((a, b) => {
      if (isIndexFile(a)) return -1;
      if (isIndexFile(b)) return 1;
      return 0;
    });

    localFiles.value = list;
  },
  { immediate: true, deep: true },
);

// 3. Função que salva a nova ordem ao soltar
const onRowReorder = async (event: any) => {
  localFiles.value = event.value; // Atualiza visual
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
        <span class="text-xs text-slate-500 font-mono mt-1">
          {{ filteredFiles.length }} itens listados
        </span>
      </div>

      <div class="flex items-center gap-3">
        <span
          v-if="isLoadingSchemas"
          class="text-[10px] text-slate-500 italic flex items-center gap-1"
        >
          <i class="pi pi-spin pi-spinner"></i>
        </span>

        <Button
          icon="pi pi-cog"
          :label="showSystemFiles ? 'Ver Conteúdo' : 'Modelos'"
          @click="showSystemFiles = !showSystemFiles"
          class="p-button-text p-button-sm !text-xs !uppercase !tracking-tighter"
          :class="
            showSystemFiles
              ? '!text-cyan-500 hover:bg-cyan-500/10'
              : '!text-slate-400 hover:text-white hover:bg-white/5'
          "
        />

        <button
          v-if="!showSystemFiles"
          @click="emit('create-item')"
          class="flex items-center gap-2 px-4 py-2 bg-[#6f942e] hover:bg-[#5a7a23] text-black font-bold text-sm rounded transition-all shadow-[0_0_10px_rgba(111,148,46,0.2)] hover:shadow-[0_0_15px_rgba(111,148,46,0.4)]"
        >
          <i class="pi pi-plus text-xs"></i>
          <span>Novo Item</span>
        </button>
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
      class: 'bg-[#141b18] text-slate-500 text-[10px] uppercase tracking-widest font-bold',
    },
    bodyRow: ({ context }) => ({
      class: [
        'transition-colors border-b border-white/5 text-slate-300',
        'hover:bg-white/5 cursor-pointer', // Efeito de hover sutil, sem cor berrante
      ],
    }),
    paginator: {
      root: { class: 'bg-[#141b18] border-t border-white/5 p-2' },
      current: { class: 'text-[10px] text-slate-500 uppercase font-bold ml-auto' },
      pages: { class: 'flex gap-1' },
      pageButton: ({ context }) => ({
        class: [
          'w-8 h-8 rounded text-[10px] transition-colors',
          context.active
            ? 'bg-[#6f942e] text-black font-black'
            : 'text-slate-400 hover:bg-white/5',
        ],
      }),
    },
  }"
>
  <Column rowReorder headerStyle="width: 3rem" v-if="!showSystemFiles" />
  
  
  <Column header="Título" class="font-medium" sortable field="data.title">
    <template #body="{ data }">
      <div class="flex flex-col py-2.5">
        <div class="flex items-center gap-2">
          <span
            class="font-medium text-[14px]"
            :class="[
              isIndexFile(data)
                ? 'text-[#6f942e] font-bold'
                : data.isSchema
                  ? 'text-cyan-400'
                  : 'text-slate-200',
            ]"
          >
            {{ data.data?.title || data.name.replace(/-/g, " ") }}
          </span>

          <span
            v-if="isIndexFile(data)"
            class="text-[8px] border border-[#6f942e]/30 text-[#6f942e] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold bg-[#6f942e]/10"
          >
            Capa
          </span>
          <span
            v-if="data.isSchema"
            class="text-[8px] border border-cyan-500/30 text-cyan-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold bg-cyan-500/10"
          >
            Modelo
          </span>
        </div>
        
        <span class="text-[10px] text-slate-500 font-mono mt-0.5 opacity-80">
          {{ data.name }}
        </span>
      </div>
    </template>
  </Column>

  <Column header="Data" style="width: 8rem" sortable field="data.date">
    <template #body="{ data }">
      <span class="text-slate-400 text-xs font-mono">{{ formatDate(data.data?.date) }}</span>
    </template>
  </Column>

  <Column header="Status" style="width: 7rem" field="data.draft">
    <template #body="{ data }">
      <span
        v-if="data.data?.draft === true"
        class="text-[10px] font-bold text-amber-500 flex items-center gap-1.5"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Rascunho
      </span>
      <span
        v-else-if="data.isSchema"
        class="text-[10px] font-bold text-cyan-500 flex items-center gap-1.5"
      >
        <i class="pi pi-cog text-[10px]"></i> Config
      </span>
      <span
        v-else
        class="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-[#6f942e] opacity-50"></span> Publicado
      </span>
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
:deep(.p-row-reorder-icon) {
  color: #475569; /* slate-600 */
  cursor: grab;
  transition: color 0.2s;
}
:deep(.p-row-reorder-icon:hover) {
  color: #6f942e;
}
:deep(.p-datatable-header-cell) {
  background: #141b18 !important;
  border: none !important;
  padding: 12px 16px !important;
  color: #64748b !important;
}

/* Fundo da tabela transparente */
:deep(.p-datatable-tbody > tr) {
  background: transparent !important;
  transition: background-color 0.15s ease-in-out;
}

/* REMOVE O EFEITO ZEBRADO */
:deep(.p-datatable-tbody > tr:nth-child(even)) {
  background: transparent !important;
}

/* Hover mais sutil e profissional */
:deep(.p-datatable-tbody > tr:hover) {
  background: rgba(255, 255, 255, 0.02) !important;
  cursor: pointer;
}

/* Borda inferior suave para as células */
:deep(.p-datatable-tbody > tr > td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
  padding: 0.25rem 1rem !important;
}

:deep(.p-paginator) {
  border-radius: 0 !important;
  background: #141b18 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.03) !important;
}
:deep(.p-datatable-wrapper) {
  flex: 1;
}
</style>
