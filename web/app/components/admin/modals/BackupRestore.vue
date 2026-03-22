<script setup>
import { useToast } from "primevue/usetoast";

const props = defineProps({
  visible: { type: Boolean, default: false },
  siteContext: { type: String, required: true }
});

const emit = defineEmits(['update:visible']);
const toast = useToast();

const backups = ref([]);
const loading = ref(false);
const processing = ref(false);

// --- API ACTIONS ---

// 1. LISTAR (GET)
const fetchBackups = async () => {
  loading.value = true;
  try {
    const data = await $fetch('/api/admin/backup', {
        params: { site: props.siteContext }
    });
    backups.value = data;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao listar backups.' });
  } finally {
    loading.value = false;
  }
};

// Carrega a lista toda vez que o modal abre
watch(() => props.visible, (val) => {
    if (val) fetchBackups();
});

// 2. CRIAR (POST action=create)
const createBackup = async () => {
    processing.value = true;
    try {
        await $fetch('/api/admin/backup', {
            method: 'POST',
            body: { site: props.siteContext, action: 'create' }
        });
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Novo ponto de restauração criado.' });
        await fetchBackups(); // Recarrega a lista
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar backup.' });
    } finally {
        processing.value = false;
    }
};

// 3. RESTAURAR (POST action=restore)
const restoreBackup = async (filename) => {
    if (!confirm(`⚠️ PERIGO: Isso substituirá TODO o conteúdo do site pelo backup "${filename}".\n\nDeseja continuar?`)) return;
    
    processing.value = true;
    try {
        await $fetch('/api/admin/backup', {
            method: 'POST',
            body: { site: props.siteContext, action: 'restore', file: filename }
        });
        
        toast.add({ severity: 'success', summary: 'Restaurado', detail: 'Sistema revertido com sucesso. Recarregando...' });
        
        // Recarrega a página para atualizar o editor com os arquivos antigos
        setTimeout(() => window.location.reload(), 1500);

    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha na restauração.' });
    } finally {
        processing.value = false;
    }
};

// 4. EXCLUIR (DELETE)
const deleteBackup = async (filename) => {
    if (!confirm(`Excluir permanentemente o backup "${filename}"?`)) return;
    try {
        await $fetch('/api/admin/backup', {
            method: 'DELETE',
            body: { site: props.siteContext, file: filename }
        });
        // Remove da lista localmente (mais rápido que dar fetch de novo)
        backups.value = backups.value.filter(b => b.name !== filename);
        toast.add({ severity: 'info', summary: 'Excluído', life: 2000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.' });
    }
};

// Helper de data
const formatDate = (isoString) => {
    if(!isoString) return '-';
    return new Date(isoString).toLocaleString('pt-BR');
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    header="PONTOS DE RESTAURAÇÃO"
    :style="{ width: '600px' }"
    class="bg-[#141b18]"
    :appendTo="'body'"
    :dismissableMask="true"
  >
    <div class="flex flex-col gap-4 pt-2 text-slate-300">
        
        <div class="flex justify-between items-center bg-[#1a1d1c] p-4 rounded-lg border border-white/5 shadow-lg">
            <div class="flex flex-col gap-1">
                <span class="text-sm font-bold text-white">Novo Ponto de Restauração</span>
                <span class="text-[11px] text-slate-500">Salva o estado atual da pasta "content" em um arquivo ZIP.</span>
            </div>
            <Button 
                label="CRIAR BACKUP" 
                icon="pi pi-save" 
                class="bg-[#6f942e] border-none text-black font-black hover:bg-[#5a7a25] transition-colors" 
                :loading="processing"
                @click="createBackup"
            />
        </div>

        <div class="flex items-center gap-2 mt-2 px-1">
            <i class="pi pi-history text-[#6f942e]"></i>
            <span class="text-xs font-bold text-[#6f942e] uppercase tracking-widest">Histórico de Versões</span>
        </div>

        <div class="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar bg-black/20 rounded-lg p-2 min-h-[200px] border border-white/5">
            
            <div v-if="loading" class="flex items-center justify-center h-full text-slate-500 gap-2 min-h-[150px]">
                <i class="pi pi-spin pi-spinner"></i> Carregando...
            </div>

            <div v-else-if="backups.length === 0" class="flex flex-col items-center justify-center h-full text-slate-600 opacity-50 min-h-[150px]">
                <i class="pi pi-box text-3xl mb-2"></i>
                <span class="text-xs font-mono">Nenhum backup encontrado.</span>
            </div>

            <div 
                v-for="bkp in backups" 
                :key="bkp.name"
                class="flex items-center justify-between p-3 bg-[#1a1d1c] border border-white/5 rounded hover:border-[#6f942e]/50 hover:bg-white/5 transition-all group"
            >
                <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                         <i class="pi pi-file-zip text-[#6f942e]"></i>
                         <span class="font-mono text-sm text-slate-200 font-bold">{{ bkp.name }}</span>
                    </div>
                    <span class="text-[10px] text-slate-500 ml-6">{{ formatDate(bkp.created) }} • <span class="text-zinc-400">{{ bkp.size }}</span></span>
                </div>

                <div class="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button 
                        icon="pi pi-refresh" 
                        severity="warning" 
                        rounded text 
                        class="!w-8 !h-8 hover:bg-amber-500/10"
                        v-tooltip.top="'Restaurar para esta versão'"
                        @click="restoreBackup(bkp.name)"
                        :disabled="processing"
                    />
                    <Button 
                        icon="pi pi-trash" 
                        severity="danger" 
                        rounded text 
                        class="!w-8 !h-8 hover:bg-red-500/10"
                        v-tooltip.top="'Excluir backup'"
                        @click="deleteBackup(bkp.name)"
                        :disabled="processing"
                    />
                </div>
            </div>
        </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* Estilo do Modal para ficar dark */
:deep(.p-dialog-header), :deep(.p-dialog-content) {
  background: #141b18;
  color: white;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>