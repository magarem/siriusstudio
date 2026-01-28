<script setup>
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();
const siteContext = useCookie("cms_site_context");

// --- DADOS ---
// Busca a lista de backups do servidor
const { data: backups, refresh, pending } = await useFetch('/api/admin/backups/list', {
    lazy: true,
    server: false
});

// =============================================================================
// 1. CRIAR BACKUP
// =============================================================================
const showCreateDialog = ref(false);
const newBackupName = ref('');
const createLoading = ref(false);

const handleCreateBackup = async () => {
    if (!newBackupName.value) return;
    createLoading.value = true;

    try {
        await $fetch('/api/admin/backups/create', {
            method: 'POST',
            body: { name: newBackupName.value }
        });
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Backup criado com sucesso.', life: 3000 });
        showCreateDialog.value = false;
        newBackupName.value = '';
        refresh();
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erro', detail: e.message || 'Falha ao criar backup.' });
    } finally {
        createLoading.value = false;
    }
};

// =============================================================================
// 2. RESTAURAR BACKUP (Lógica Complexa com Progresso)
// =============================================================================
const restoreLoading = ref(false);
const showRestoreProgress = ref(false);
const restoreBackupName = ref('');

const confirmRestore = (backup) => {
    confirm.require({
        group: 'restore', // <--- IMPORTANTE: Usa o Dialog customizado
        message: `ATENÇÃO: Isso substituirá TODO o site pela versão "${backup.name}". Continuar?`,
        header: 'Confirmar Restauração',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim', // <--- Botão de Confirmação
        rejectLabel: 'Não', // <--- Botão de Cancelamento
        accept: () => handleRestore(backup)
    });
};

const handleRestore = async (backup) => {
    if (restoreLoading.value) return;

    restoreBackupName.value = backup.name;
    restoreLoading.value = true;
    showRestoreProgress.value = true; // Abre modal de progresso

    try {
        await $fetch('/api/admin/backups/restore', {
            method: 'POST',
            body: { filename: backup.filename }
        });
        
        toast.add({ severity: 'success', summary: 'Restaurado', detail: 'Reiniciando sistema...', life: 2000 });
        setTimeout(() => window.location.reload(), 1500);
        
    } catch (e) {
        showRestoreProgress.value = false; // Fecha modal de progresso se der erro
        toast.add({ severity: 'error', summary: 'Erro Crítico', detail: 'Falha ao restaurar backup.' });
        restoreLoading.value = false;
    }
};

// =============================================================================
// 3. EXCLUIR BACKUP (Lógica Simples)
// =============================================================================
const deleteLoading = ref(false);

const confirmDelete = (backup) => {
    confirm.require({
        group: 'delete',
        message: `Tem certeza que deseja excluir o backup "${backup.name}"?`,
        header: 'Excluir Backup',
        icon: 'pi pi-trash',
        acceptClass: 'p-button-danger',
        acceptLabel: 'EXCLUIR',
        rejectLabel: 'Cancelar',
        accept: () => handleDelete(backup)
    });
};

const handleDelete = async (backup) => {
    deleteLoading.value = true;
    try {
        await $fetch('/api/admin/backups/delete', {
            method: 'POST',
            body: { filename: backup.filename }
        });
        toast.add({ severity: 'success', summary: 'Excluído', detail: 'Backup removido permanentemente.', life: 2000 });
        refresh();
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir arquivo.' });
    } finally {
        deleteLoading.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
};
</script>

<template>
  <div class="flex flex-col gap-4 text-slate-200">
    
    <ConfirmDialog group="delete" />

    <ConfirmDialog group="restore">
        <template #message="slotProps">
            <div class="flex gap-4 items-center p-2">
                <i :class="slotProps.message.icon" class="text-4xl text-yellow-500"></i>
                <p class="text-slate-200 leading-relaxed text-sm">{{ slotProps.message.message }}</p>
            </div>
        </template>
        <template #footer="slotProps">
            <Button label="Cancelar" text class="text-zinc-400 hover:text-white" @click="slotProps.reject" />
            <Button label="SIM, RESTAURAR" severity="warning" :loading="restoreLoading" @click="slotProps.accept" />
        </template>
    </ConfirmDialog>

    <Dialog 
        v-model:visible="showRestoreProgress" 
        modal 
        :closable="false" 
        :style="{ width: '400px' }" 
        class="bg-[#141b18]" 
        :appendTo="'body'"
        :showHeader="false"
    >
        <div class="flex flex-col items-center gap-6 py-6 text-center">
            <div class="relative">
                <i class="pi pi-spin pi-cog text-6xl text-[#6f942e] opacity-20 absolute top-0 left-0"></i>
                <i class="pi pi-spin pi-spinner text-6xl text-[#6f942e]"></i>
            </div>
            
            <div class="flex flex-col gap-2">
                <span class="font-black text-xl text-white tracking-wide">RESTAURANDO...</span>
                <span class="text-zinc-400 text-sm">Backup: <span class="text-[#6f942e] font-mono">{{ restoreBackupName }}</span></span>
            </div>

            <div class="w-full px-6">
                 <ProgressBar mode="indeterminate" style="height: 6px;" class="custom-progress"></ProgressBar>
            </div>

            <div class="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-xs text-yellow-500/90 flex items-center gap-2">
                <i class="pi pi-info-circle"></i>
                <span>O sistema será reiniciado automaticamente ao finalizar.</span>
            </div>
        </div>
    </Dialog>

    <div class="bg-[#0a0f0d] border border-white/10 rounded-lg overflow-hidden">
        <DataTable :value="backups" :loading="pending" class="p-datatable-sm" stripedRows scrollable scrollHeight="400px">
            <template #empty>
                <div class="p-8 text-center text-zinc-500 text-sm">
                    <i class="pi pi-inbox text-2xl mb-2 block"></i>
                    Nenhum backup encontrado.
                </div>
            </template>

            <Column field="name" header="Nome / Descrição" style="min-width: 200px">
                <template #body="slotProps">
                    <div class="flex flex-col">
                        <span class="font-bold text-white text-xs">{{ slotProps.data.name }}</span>
                        <span class="font-mono text-[10px] text-zinc-500">{{ slotProps.data.filename }}</span>
                    </div>
                </template>
            </Column>
            
            <Column field="created" header="Data" style="width: 140px">
                <template #body="slotProps">
                    <span class="text-xs text-zinc-300">{{ formatDate(slotProps.data.created) }}</span>
                </template>
            </Column>

            <Column field="size" header="Tam." style="width: 80px">
                <template #body="slotProps">
                    <span class="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300 font-mono">{{ slotProps.data.size }}</span>
                </template>
            </Column>

            <Column header="" style="width: 140px" alignFrozen="right" frozen>
                <template #body="slotProps">
                    <div class="flex justify-end gap-2">
                        <Button 
                            icon="pi pi-refresh" 
                            size="small" 
                            severity="warning" 
                            outlined
                            tooltip="Restaurar"
                            tooltipOptions="{ position: 'top' }"
                            @click="confirmRestore(slotProps.data)" 
                            class="!h-7 !w-7"
                        />
                        <Button 
                            icon="pi pi-trash" 
                            size="small" 
                            severity="danger" 
                            outlined
                            tooltip="Excluir"
                            tooltipOptions="{ position: 'top' }"
                            :loading="deleteLoading"
                            @click="confirmDelete(slotProps.data)" 
                            class="!h-7 !w-7"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>

    <div class="flex justify-end pt-2">
        <Button 
            label="CRIAR PONTO DE RESTAURAÇÃO" 
            icon="pi pi-plus-circle" 
            class="bg-[#6f942e] border-none text-black font-bold text-xs hover:scale-105 transition-transform"
            @click="showCreateDialog = true"
        />
    </div>

    <Dialog v-model:visible="showCreateDialog" modal header="Novo Backup" :style="{ width: '350px' }" class="bg-[#141b18]" :appendTo="'body'">
        <div class="flex flex-col gap-4 pt-4">
            <div class="flex flex-col gap-2">
                <label class="text-[10px] font-bold text-[#6f942e] uppercase">Nome</label>
                <InputText v-model="newBackupName" placeholder="Ex: Antes de alterar..." class="bg-[#0a0f0d] border border-white/10 text-white w-full text-sm" autofocus />
            </div>
            <Button 
                label="SALVAR BACKUP" 
                icon="pi pi-save"
                class="bg-[#6f942e] border-none text-black font-bold w-full"
                :loading="createLoading"
                @click="handleCreateBackup"
            />
        </div>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.custom-progress .p-progressbar-value) {
    background: #6f942e;
}
:deep(.custom-progress) {
    background: rgba(255, 255, 255, 0.1);
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background: #141b18;
    color: #9ca3af;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    font-size: 0.7rem;
    text-transform: uppercase;
}
:deep(.p-datatable .p-datatable-tbody > tr) {
    background: transparent;
    color: #e2e8f0;
}
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background: rgba(255,255,255,0.02) !important;
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding: 0.5rem 1rem;
}
</style>