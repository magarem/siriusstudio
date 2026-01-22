<script setup>
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();
const siteContext = useCookie("cms_site_context");

// --- DADOS ---
// O lazy: true ajuda a não travar a abertura do modal
const { data: backups, refresh, pending } = await useFetch('/api/admin/backups/list', {
    lazy: true,
    server: false // Busca no cliente para garantir dados frescos ao abrir modal
});

// --- CRIAR BACKUP ---
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
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Ponto de restauração criado.', life: 3000 });
        showCreateDialog.value = false;
        newBackupName.value = '';
        refresh();
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erro', detail: e.message });
    } finally {
        createLoading.value = false;
    }
};

// --- RESTAURAR BACKUP ---
const restoreLoading = ref(false);

const confirmRestore = (backup) => {
    confirm.require({
        message: `ATENÇÃO: Isso irá substituir TODO o conteúdo atual do site pela versão "${backup.name}". Deseja continuar?`,
        header: 'Confirmar Restauração',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'SIM, RESTAURAR',
        rejectLabel: 'Cancelar',
        accept: () => handleRestore(backup)
    });
};

const handleRestore = async (backup) => {
    restoreLoading.value = true;
    try {
        await $fetch('/api/admin/backups/restore', {
            method: 'POST',
            body: { filename: backup.filename }
        });
        
        toast.add({ severity: 'success', summary: 'Restaurado', detail: 'Recarregando sistema...', life: 2000 });
        
        // Reload forçado para aplicar o banco de dados antigo
        setTimeout(() => window.location.reload(), 1500);
        
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erro Crítico', detail: 'Falha ao restaurar backup.' });
    } finally {
        restoreLoading.value = false;
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
};
</script>

<template>
  <div class="flex flex-col gap-4 text-slate-200">
    <ConfirmDialog />

    <div class="bg-[#0a0f0d] border border-white/10 rounded-lg overflow-hidden">
        <DataTable :value="backups" :loading="pending" class="p-datatable-sm" stripedRows scrollable scrollHeight="400px">
            <template #empty>
                <div class="p-8 text-center text-zinc-500 text-sm">
                    <i class="pi pi-inbox text-2xl mb-2 block"></i>
                    Nenhum backup encontrado.
                </div>
            </template>

            <Column field="name" header="Nome / Descrição">
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

            <Column header="" style="width: 100px" alignFrozen="right" frozen>
                <template #body="slotProps">
                    <div class="flex justify-end">
                        <Button 
                            label="Restaurar" 
                            icon="pi pi-refresh" 
                            size="small" 
                            severity="warning" 
                            outlined
                            :loading="restoreLoading"
                            @click="confirmRestore(slotProps.data)" 
                            class="!text-[10px] !py-1 !px-2"
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