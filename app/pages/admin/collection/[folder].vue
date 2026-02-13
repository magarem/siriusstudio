<script setup>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps({
    folder: { type: String, required: true },
    title: { type: String, default: 'Coleção' },
    icon: { type: String, default: 'pi pi-folder' }
});

const toast = useToast();
const confirm = useConfirm();

const items = ref([]);
const loading = ref(true);
const filters = ref({
    global: { value: null, matchMode: 'contains' }, // Usando string direta para evitar erros de import
});

// --- CARREGAR DADOS ---
const loadItems = async () => {
    loading.value = true;
    try {
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

watch(() => props.folder, () => { loadItems(); });
onMounted(() => { loadItems(); });

// --- AÇÕES ---
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
                loadItems();
            } catch (e) {
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir item', life: 3000 });
            }
        }
    });
};

// --- HELPERS ---
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const getStatusSeverity = (item) => {
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
    <div class="p-6 w-full h-full flex flex-col bg-[#0a0f0d] text-slate-300">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#6f942e] shadow-inner">
                    <i :class="[icon, 'text-xl']"></i>
                </div>
                <div>
                    <h1 class="text-2xl font-black tracking-tight text-white capitalize">{{ title }}</h1>
                    <p class="text-xs font-mono text-slate-500 mt-1">
                        content/<span class="text-[#6f942e]">{{ folder }}</span>
                    </p>
                </div>
            </div>

            <NuxtLink :to="`/admin/editor/new?folder=${folder}`">
                <Button 
                    label="Novo Item" 
                    icon="pi pi-plus" 
                    class="!bg-[#6f942e] !border-none !text-black !font-bold hover:!bg-[#5a7a23] transition-colors shadow-lg shadow-[#6f942e]/20" 
                />
            </NuxtLink>
        </div>

        <div class="bg-[#141b18] border border-white/5 rounded-xl shadow-xl flex-grow overflow-hidden flex flex-col relative">
            
            <DataTable 
                :value="items" 
                :paginator="true" 
                :rows="8" 
                :loading="loading"
                v-model:filters="filters"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} - {last} de {totalRecords}"
                responsiveLayout="scroll"
                class="p-datatable-sm custom-dark-table h-full flex flex-col"
            >
                <template #header>
                    <div class="flex justify-between items-center py-2 px-1">
                        <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Itens na lista</span>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search text-slate-500" />
                            <InputText 
                                v-model="filters['global'].value" 
                                placeholder="Filtrar..." 
                                class="!bg-black/20 !border-white/10 !text-slate-300 focus:!border-[#6f942e] !h-9 !text-sm w-64" 
                            />
                        </span>
                    </div>
                </template>
                
                <template #empty>
                    <div class="text-center py-20 flex flex-col items-center opacity-40">
                        <i class="pi pi-inbox text-5xl mb-4 text-slate-600"></i>
                        <p class="text-slate-500">Nenhum item encontrado nesta pasta.</p>
                    </div>
                </template>

                <Column field="title" header="Título" sortable style="min-width: 250px">
                    <template #body="{ data }">
                        <div class="flex flex-col py-1">
                            <NuxtLink 
                                :to="`/admin/editor?file=${data._file}`" 
                                class="font-bold text-slate-200 hover:text-[#6f942e] text-base transition-colors leading-tight mb-1"
                            >
                                {{ data.title || 'Sem título' }}
                            </NuxtLink>
                            <span class="text-[10px] text-slate-500 font-mono truncate max-w-[300px]">{{ data._file }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="date" header="Data" sortable dataType="date" style="width: 150px">
                    <template #body="{ data }">
                       <span class="text-sm text-slate-400 font-mono">{{ formatDate(data.date || data.created_at) }}</span>
                    </template>
                </Column>

                <Column header="Status" field="_draft" sortable style="width: 120px">
                    <template #body="{ data }">
                        <Tag 
                            :value="getStatusLabel(data)" 
                            :severity="getStatusSeverity(data)" 
                            class="!text-[10px] !font-bold uppercase tracking-wider !bg-opacity-20 !border !border-opacity-20"
                            :style="{
                                backgroundColor: data._draft ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                borderColor: data._draft ? 'rgba(234, 179, 8, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                                color: data._draft ? '#fbbf24' : '#4ade80'
                            }"
                        />
                    </template>
                </Column>

                <Column :exportable="false" style="width: 100px; text-align: right">
                    <template #body="{ data }">
                        <div class="flex justify-end gap-1">
                            <NuxtLink :to="`/admin/editor?file=${data._file}`">
                                <Button icon="pi pi-pencil" text rounded class="!w-8 !h-8 !text-slate-400 hover:!text-white hover:!bg-white/10" aria-label="Editar" />
                            </NuxtLink>
                            
                            <Button 
                                icon="pi pi-trash" 
                                text 
                                rounded 
                                class="!w-8 !h-8 !text-red-400/70 hover:!text-red-400 hover:!bg-red-400/10"
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
/* Overrides profundos para o PrimeVue DataTable Dark Theme 
   Para combinar com o background #141b18 
*/

:deep(.custom-dark-table .p-datatable-header) {
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 1rem 1.5rem;
    color: #94a3b8;
}

:deep(.custom-dark-table .p-datatable-thead > tr > th) {
    background: #111614; /* Um pouco mais escuro que o card */
    color: #64748b;
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 1rem 1.5rem;
}

:deep(.custom-dark-table .p-datatable-tbody > tr) {
    background: transparent;
    color: #cbd5e1;
    transition: background-color 0.2s;
}

:deep(.custom-dark-table .p-datatable-tbody > tr > td) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding: 1rem 1.5rem;
}

:deep(.custom-dark-table .p-datatable-tbody > tr:hover) {
    background-color: rgba(255, 255, 255, 0.03);
}

:deep(.custom-dark-table .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}

/* Paginator Dark */
:deep(.p-paginator) {
    background: transparent;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    padding: 0.5rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page),
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
    color: #64748b;
    background: transparent;
    border-radius: 6px;
    min-width: 2rem;
    height: 2rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:hover),
:deep(.p-paginator .p-paginator-element:not(.p-disabled):hover) {
    background: rgba(255, 255, 255, 0.05);
    color: #e2e8f0;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    background: rgba(111, 148, 46, 0.15);
    color: #6f942e;
    font-weight: bold;
}

/* Ajustes no Sort Icon */
:deep(.p-sortable-column-icon) {
    color: #475569;
    width: 0.8rem;
    height: 0.8rem;
}
:deep(.p-sortable-column:hover .p-sortable-column-icon) {
    color: #94a3b8;
}
:deep(.p-sortable-column.p-highlight .p-sortable-column-icon) {
    color: #6f942e;
}
:deep(.p-sortable-column.p-highlight) {
    color: #6f942e !important;
}
</style>