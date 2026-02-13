<script setup>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps({
    folder: { type: String, required: true }, // ex: 'blog', 'cursos'
    title: { type: String, default: 'Coleção' },
    icon: { type: String, default: 'pi pi-folder' }
});

// Serviços do PrimeVue
const toast = useToast();
const confirm = useConfirm();

// Estados
const items = ref([]);
const loading = ref(true);
const filters = ref({
    global: { value: null, matchMode: 'contains' },
});

// --- CARREGAR DADOS (Via API Real-time) ---
const loadItems = async () => {
    loading.value = true;
    try {
        // Chama a API que lê o disco (fs), garantindo dados frescos mesmo em produção
        const data = await $fetch('/api/admin/collection', {
            params: { folder: props.folder }
        });
        items.value = data;
    } catch (error) {
        console.error('Erro ao carregar coleção:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os itens.', life: 3000 });
        items.value = [];
    } finally {
        loading.value = false;
    }
};

// Recarrega se a prop folder mudar (navegação na sidebar)
watch(() => props.folder, () => {
    loadItems();
});

onMounted(() => {
    loadItems();
});

// --- AÇÕES ---

// Excluir Item
const confirmDelete = (item) => {
    confirm.require({
        message: `Tem certeza que deseja excluir "${item.title || item._path}"?`,
        header: 'Confirmar Exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await $fetch('/api/admin/delete', {
                    method: 'DELETE',
                    body: { file: item._file }
                });
                
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item excluído', life: 3000 });
                loadItems(); // Recarrega a lista
            } catch (e) {
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir item', life: 3000 });
            }
        }
    });
};

// --- HELPERS DE FORMATAÇÃO ---

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const getStatusSeverity = (item) => {
    // Lógica: Se _draft for true, é rascunho. Se não tiver data, é rascunho implícito.
    if (item._draft === true) return 'warning';
    if (item.visible === false) return 'danger';
    return 'success';
};

const getStatusLabel = (item) => {
    if (item._draft === true) return 'Rascunho';
    if (item.visible === false) return 'Oculto';
    return 'Publicado';
};
</script>

<template>
    <div class="p-6 w-full h-full flex flex-col bg-slate-50">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <i :class="[icon, 'text-xl']"></i>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-slate-800 capitalize">{{ title }}</h1>
                    <p class="text-sm text-slate-500">Gerenciando itens em: <code class="bg-slate-200 px-1 rounded text-xs">content/{{ folder }}</code></p>
                </div>
            </div>

            <NuxtLink :to="`/new?folder=${folder}`">
                <Button label="Novo Item" icon="pi pi-plus" class="shadow-lg" />
            </NuxtLink>
        </div>

        <div class="card bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-grow overflow-hidden flex flex-col">
            <DataTable 
                :value="items" 
                :paginator="true" 
                :rows="8" 
                :loading="loading"
                v-model:filters="filters"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <template #header>
                    <div class="flex justify-end">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search text-slate-400" />
                            <InputText v-model="filters['global'].value" placeholder="Buscar na lista..." class="p-inputtext-sm w-64" />
                        </span>
                    </div>
                </template>
                
                <template #empty>
                    <div class="text-center py-8 text-slate-500">
                        Nenhum item encontrado nesta pasta.
                    </div>
                </template>

                <Column field="title" header="Título" sortable style="min-width: 200px">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <NuxtLink 
                                :to="`/editor?file=${data._file}`" 
                                class="font-bold text-slate-700 hover:text-blue-600 hover:underline text-base transition-colors"
                            >
                                {{ data.title || 'Sem título' }}
                            </NuxtLink>
                            <span class="text-xs text-slate-400 font-mono mt-1 truncate max-w-[200px]">{{ data._file }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="date" header="Data" sortable dataType="date" style="width: 150px">
                    <template #body="{ data }">
                       <span class="text-sm text-slate-600">{{ formatDate(data.date || data.created_at) }}</span>
                    </template>
                </Column>

                <Column header="Status" field="_draft" sortable style="width: 120px">
                    <template #body="{ data }">
                        <Tag 
                            :value="getStatusLabel(data)" 
                            :severity="getStatusSeverity(data)" 
                            rounded
                        />
                    </template>
                </Column>

                <Column :exportable="false" style="width: 120px; text-align: right">
                    <template #body="{ data }">
                        <div class="flex justify-end gap-2">
                            <NuxtLink :to="`/editor?file=${data._file}`">
                                <Button icon="pi pi-pencil" text rounded severity="info" aria-label="Editar" />
                            </NuxtLink>
                            
                            <Button 
                                icon="pi pi-trash" 
                                text 
                                rounded 
                                severity="danger" 
                                aria-label="Excluir" 
                                @click="confirmDelete(data)"
                            />
                        </div>
                    </template>
                </Column>

            </DataTable>
        </div>
    </div>
</template>

<style scoped>
/* Ajustes finos para o DataTable ficar mais bonito e compacto */
:deep(.p-datatable .p-datatable-header) {
    background: transparent;
    border: none;
    padding: 0 0 1rem 0;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    font-size: 0.875rem;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #f1f5f9;
}

:deep(.p-tag) {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
</style>