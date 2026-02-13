<script setup lang="ts">
// Nuxt 3 faz auto-import de computed, mas se der erro, descomente a linha abaixo:
// import { computed } from 'vue';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  data?: { 
    title?: string;
    date?: string;
    coverimage?: string[] | string;
    images?: string[];
  };
}

const props = defineProps<{ files: FileItem[] }>();
const emit = defineEmits<{ (e: 'select', item: FileItem): void }>();

// Filtra arquivos de sistema e metadados
const filteredFiles = computed(() => {
  if (!props.files) return [];
  return props.files.filter(file => 
    file.name !== '.DS_Store' && 
    file.name !== '.collection' &&
    file.name !== '_index.md'
  );
});

const onRowSelect = (event: any) => {
  emit('select', event.data);
};

// --- Lógica de Imagem corrigida ---
const getThumbnail = (item: FileItem): string | null => {
  if (!item.data) return null;

  let imageName: string | null = null;
  
  if (Array.isArray(item.data.coverimage) && item.data.coverimage.length > 0) {
    imageName = item.data.coverimage[0];
  } else if (typeof item.data.coverimage === 'string' && item.data.coverimage) {
    imageName = item.data.coverimage;
  } else if (Array.isArray(item.data.images) && item.data.images.length > 0) {
    imageName = item.data.images[0];
  }

  if (!imageName) return null;

  // Se for path absoluto, retorna
  if (imageName.startsWith('/') || imageName.startsWith('http')) {
    return imageName;
  }

  // Ajusta o path: troca 'content' por 'assets' conforme solicitado
  let basePath = item.path.replace(/\/$/, '').replace(/^content\//, 'assets/');
  
  if (!item.isDirectory) {
    basePath = basePath.substring(0, basePath.lastIndexOf('/'));
  }

  return `/${basePath}/${imageName}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};
</script>

<template>
  <div class="card _border border-surface-200 rounded-none overflow-hidden _bg-white shadow-sm flex flex-col h-full">
    <DataTable 
      :value="filteredFiles" 
      selectionMode="single" 
      @rowSelect="onRowSelect"
      dataKey="name"
      tableStyle="min-width: 20rem"
      class="text-sm flex-1 flex flex-col"
      stripedRows
      hover
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="{first} a {last} de {totalRecords}"
      :pt="{
        root: { class: 'flex-1 flex flex-col' },
        wrapper: { class: 'flex-1' },
        paginator: {
          root: { class: 'rounded-none border-t border-surface-200' }
        }
      }"
    >
      <Column style="width: 4rem">
        <template #body="slotProps">
          <div 
            class="w-12 h-12 rounded-sm overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center relative group"
          >
            <img 
              v-if="getThumbnail(slotProps.data)"
              :src="getThumbnail(slotProps.data)!" 
              class="w-full h-full object-cover" 
              alt="Thumbnail"
              loading="lazy"
              @error="(e: any) => e.target.style.display = 'none'" 
            />
            
            <div v-if="!getThumbnail(slotProps.data)" class="flex items-center justify-center">
               <i :class="slotProps.data.isDirectory ? 'pi pi-folder text-yellow-500' : 'pi pi-file text-blue-400'" class="text-xl"></i>
            </div>
          </div>
        </template>
      </Column>

      <Column header="Item" class="font-medium" sortable field="data.title">
        <template #body="slotProps">
          <div class="flex flex-col justify-center h-12">
            <span class="text-gray-200 font-semibold text-sm leading-tight truncate">
              {{ slotProps.data.data?.title || slotProps.data.name }}
            </span>
            <span class="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[200px]">
              /{{ slotProps.data.name }}
            </span>
          </div>
        </template>
      </Column>

      <Column header="Data" style="width: 8rem" sortable field="data.date">
        <template #body="slotProps">
          <span class="text-gray-500 text-xs">
            {{ formatDate(slotProps.data.data?.date) }}
          </span>
        </template>
      </Column>

      <Column style="width: 3rem; text-align: center">
        <template #body>
           <button class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
             <i class="pi pi-ellipsis-v text-xs"></i>
           </button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
/* Remove arredondamentos forçados pelo tema do PrimeVue */
:deep(.p-paginator) {
    border-radius: 0 !important;
}

:deep(.p-datatable-wrapper) {
    flex: 1;
}
</style>