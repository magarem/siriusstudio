<script setup>
import { ref } from 'vue';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

// Layout
import AdminSidebar from "~/components/admin/Sidebar.vue";
import AdminTopbar from "~/components/admin/Topbar.vue";

definePageMeta({ layout: "" });

const toast = useToast();
const confirm = useConfirm();
const route = useRoute();
const siteContext = useCookie("cms_site_context");

// Estados de Navegação (para manter compatibilidade com o layout)
const showSidebar = ref(false);
const currentFolder = ref("backups"); 

// --- DADOS ---
const { data: backups, refresh, pending } = await useFetch('/api/admin/backups/list');

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
        message: `ATENÇÃO: Isso irá substituir todo o conteúdo atual do site pela versão de "${backup.name}". Esta ação é irreversível. Deseja continuar?`,
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
            body: { filename: backup.name }
        });
        
        toast.add({ severity: 'success', summary: 'Restaurado', detail: 'O site foi revertido com sucesso.', life: 5000 });
        
        // Opcional: Recarregar a página após alguns segundos para garantir que o cache limpe
        setTimeout(() => window.location.reload(), 2000);
        
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erro Crítico', detail: 'Falha ao restaurar backup.' });
    } finally {
        restoreLoading.value = false;
    }
};

// --- DELETAR BACKUP (Opcional, mas útil) ---
const deleteBackup = async (filename) => {
    // Você precisaria criar esse endpoint, ou deixamos visualmente apenas
    // Implementação rápida para deletar arquivo
    // await $fetch('/api/admin/backups/delete', ... )
    toast.add({ severity: 'info', summary: 'Info', detail: 'Funcionalidade de deletar não implementada ainda.' });
}

// Formatação de Data
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
};

// Navegação simulada
const navigate = {
    toDashboard: () => navigateTo(`/${siteContext.value}/dashboard`),
    // Outros métodos necessários para o Topbar não quebrar
    enterFolder: () => {}, selectFile: () => {}
};
</script>

<template>
  <div class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans flex flex-col">
    <Toast />
    <ConfirmDialog />

    <AdminSidebar
      :site-context="siteContext"
      v-model:visible="showSidebar"
      :files="[]"
      current-folder="backups"
      current-file=""
    />

    <AdminTopbar
      :site-context="siteContext"
      current-folder="backups"
      current-file=""
      @toggle-sidebar="showSidebar = true"
      @go-dashboard="navigate.toDashboard"
    />

    <div class="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col gap-6 animate-fade-in">
        
        <div class="flex flex-col gap-2">
            <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <i class="pi pi-history text-[#6f942e]"></i>
                PONTOS DE RESTAURAÇÃO
            </h1>
            <p class="text-zinc-400 text-sm">Gerencie snapshots completos do conteúdo e banco de dados do site.</p>
        </div>

        <div class="bg-[#141b18] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
            <DataTable :value="backups" :loading="pending" class="p-datatable-sm" stripedRows>
                <template #empty>
                    <div class="p-8 text-center text-zinc-500">Nenhum backup encontrado. Crie o primeiro abaixo.</div>
                </template>

                <Column field="name" header="Arquivo">
                    <template #body="slotProps">
                        <div class="font-mono text-xs text-zinc-300">{{ slotProps.data.name }}</div>
                    </template>
                </Column>
                
                <Column field="created" header="Data">
                    <template #body="slotProps">
                        <span class="text-sm font-bold text-white">{{ formatDate(slotProps.data.created) }}</span>
                    </template>
                </Column>

                <Column field="size" header="Tamanho">
                    <template #body="slotProps">
                        <span class="text-xs bg-white/10 px-2 py-1 rounded text-zinc-300">{{ slotProps.data.size }}</span>
                    </template>
                </Column>

                <Column header="Ações" alignFrozen="right" frozen>
                    <template #body="slotProps">
                        <div class="flex gap-2 justify-end">
                            <Button 
                                label="Restaurar" 
                                icon="pi pi-refresh" 
                                size="small" 
                                severity="warning" 
                                outlined
                                :loading="restoreLoading"
                                @click="confirmRestore(slotProps.data)" 
                                class="!text-xs"
                            />
                            </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <div class="flex justify-center mt-4">
            <Button 
                label="CRIAR NOVO PONTO DE RESTAURAÇÃO" 
                icon="pi pi-plus-circle" 
                class="bg-[#6f942e] border-none text-black font-black px-6 py-3 hover:scale-105 transition-transform"
                @click="showCreateDialog = true"
            />
        </div>

    </div>

    <Dialog v-model:visible="showCreateDialog" modal header="Novo Backup" :style="{ width: '400px' }" class="bg-[#141b18]">
        <div class="flex flex-col gap-4 pt-4">
            <div class="flex flex-col gap-2">
                <label class="text-xs font-bold text-[#6f942e] uppercase">Nome do Ponto de Restauração</label>
                <InputText v-model="newBackupName" placeholder="Ex: Antes de mudar o menu..." class="bg-[#0a0f0d] border border-white/10 text-white w-full" autofocus />
                <small class="text-zinc-500">Será adicionada a data e hora automaticamente.</small>
            </div>
            <Button 
                label="CRIAR BACKUP" 
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
:deep(.p-datatable) {
    background: transparent;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background: rgba(255,255,255,0.05);
    color: #9ca3af;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>