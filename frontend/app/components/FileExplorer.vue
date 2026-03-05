<template>
  <div class="flex flex-col h-full bg-[#111614] text-slate-300 border-r border-white/5 relative select-none">
    
    <div class="px-4 py-3 border-b border-white/5 bg-[#141b18] flex justify-between items-center shrink-0">
      <div class="flex items-center gap-2">
        <i class="pi pi-folder-open text-[#6f942e] text-sm"></i>
        <h2 class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">
          Explorador
        </h2>
      </div>
      
      <div class="flex items-center gap-1">
        <button @click="$emit('create-file')" class="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors" title="Novo Arquivo">
          <i class="pi pi-file-plus text-[11px]"></i>
        </button>
        <button @click="$emit('create-folder')" class="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors" title="Nova Pasta">
          <i class="pi pi-folder-plus text-[11px]"></i>
        </button>
        <button @click="$emit('refresh')" class="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-[#6f942e] transition-colors" title="Atualizar">
          <i class="pi pi-refresh text-[11px]"></i>
        </button>
      </div>
    </div>

    <div class="px-3 py-2 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
      <span class="text-[9px] font-mono text-slate-500 truncate" :title="currentFolder">
        /{{ currentFolder }}
      </span>
      <span v-if="isCollectionFolder" class="text-[8px] font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
        Coleção
      </span>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
      <div class="flex flex-col gap-0.5">
        
        <div v-if="currentFolder !== 'content' && currentFolder !== ''" 
             @click="$emit('back')" 
             class="flex items-center gap-2 p-2 cursor-pointer hover:bg-white/5 rounded text-slate-500 text-[11px] border border-transparent group">
          <i class="pi pi-arrow-up text-[10px] group-hover:-translate-y-0.5 transition-transform"></i> 
          <span class="font-mono">..</span>
        </div>

        <div v-for="item in sortedFiles" :key="item.path" 
             @click="$emit(item.isDirectory ? 'navigate' : 'select', item.name)"
             :class="[
               'group relative rounded border transition-all cursor-pointer flex items-center gap-3 px-3 py-2',
               currentFile === item.path ? 'border-[#6f942e]/30 bg-[#6f942e]/10' : 'border-transparent hover:bg-white/5'
             ]">
          
          <div class="shrink-0 w-5 flex justify-center">
            <template v-if="item.isDirectory">
               <i v-if="item.data?.isCollection" class="pi pi-database text-indigo-400 text-sm"></i>
               <i v-else class="pi pi-folder-fill text-amber-500/80 text-sm"></i>
            </template>
            <template v-else>
              <i :class="[getFileIcon(item.name), 'text-[13px]']"></i>
            </template>
          </div>

          <div class="flex-1 min-w-0">
            <p :class="[
              'truncate transition-colors text-[12px]',
              item.isDirectory ? 'font-bold text-slate-300' : 'text-slate-400 group-hover:text-slate-200',
              currentFile === item.path ? 'text-[#6f942e] font-medium' : ''
            ]">
              {{ formatLabel(item) }}
            </p>
          </div>

          <div class="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 flex gap-0.5 bg-[#141b18]/90 backdrop-blur-sm rounded border border-white/10 p-0.5 shadow-xl transition-all">
            <button @click.stop="renameItem(item)" class="p-1.5 hover:text-[#6f942e] text-slate-500 transition-colors" title="Renomear">
              <i class="pi pi-pencil text-[9px]"></i>
            </button>
            <button @click.stop="deleteItem(item)" class="p-1.5 hover:text-red-400 text-slate-500 transition-colors" title="Excluir">
              <i class="pi pi-trash text-[9px]"></i>
            </button>
          </div>
        </div>

        <div v-if="files.length === 0" class="py-12 text-center opacity-20 flex flex-col items-center">
          <i class="pi pi-inbox text-3xl mb-2"></i>
          <p class="text-[9px] uppercase tracking-[0.3em]">Diretório Vazio</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useToast } from "primevue/usetoast";

const toast = useToast();

const props = defineProps({
  files: { type: Array, required: true },
  currentFolder: { type: String, required: true },
  currentFile: { type: String, required: true },
  siteContext: { type: String, required: true },
  isCollectionFolder: { type: Boolean, default: false }
});

const emit = defineEmits(['navigate', 'select', 'back', 'create-file', 'create-folder', 'create-collection', 'refresh']);

// --- ORDENAÇÃO ---
// Pastas primeiro, arquivos depois. E arquivos _index.md no topo dos arquivos.
const sortedFiles = computed(() => {
  if (!props.files) return [];
  
  return [...props.files].sort((a, b) => {
    // 1. Pastas sempre vêm antes
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    
    // 2. Arquivos _index.md sobem pro topo da lista de arquivos
    if (a.name.startsWith('_index') && !b.name.startsWith('_index')) return -1;
    if (!a.name.startsWith('_index') && b.name.startsWith('_index')) return 1;
    
    // 3. Ordem alfabética para o resto
    return a.name.localeCompare(b.name);
  });
});

// --- HELPERS VISUAIS ---
const getFileIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.md')) return 'pi pi-file-edit text-[#6f942e]';
  if (lower.endsWith('.json') || lower.endsWith('.yml') || lower.endsWith('.yaml') || lower.endsWith('.toml')) return 'pi pi-sliders-h text-amber-400/80';
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(lower)) return 'pi pi-image text-indigo-400';
  return 'pi pi-file text-slate-600';
};

const formatLabel = (item) => {
  // Se for pasta e tiver um titulo no _index.md, mostra o título!
  if (item.isDirectory && item.data && item.data.title) {
    return item.data.title;
  }
  
  let cleanName = item.name.replace('.md', '').replace('.json', '').replace('.yml', '');
  
  // Limpa traços para ficar mais legível na UI
  if (cleanName.includes('-')) {
    cleanName = cleanName.replace(/-/g, ' ');
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }
  
  return cleanName;
};

// --- API ACTIONS (Conectadas ao novo Backend Bun) ---
const deleteItem = async (item) => {
  if (!confirm(`Tem certeza que deseja excluir "${item.name}"?\nEsta ação não pode ser desfeita.`)) return;
  
  try {
    await $fetch('/api/admin/storage', { 
      method: 'DELETE', 
      body: { 
        site: props.siteContext,
        folder: props.currentFolder,
        file: item.name
      } 
    });
    
    toast.add({ severity: 'success', summary: 'Excluído com sucesso', life: 2000 });
    emit('refresh');
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro ao excluir', detail: e.data?.error || 'Erro interno' });
  }
};

const renameItem = async (item) => {
  const newName = prompt('Digite o novo nome (sem espaços ou acentos):', item.name);
  if (!newName || newName === item.name) return;
  
  try {
    await $fetch('/api/admin/rename', { 
      method: 'POST', 
      body: { 
        site: props.siteContext,
        oldname: `${props.currentFolder}/${item.name}`.replace(/^\//, ''),
        newname: `${props.currentFolder}/${newName}`.replace(/^\//, '')
      } 
    });
    
    toast.add({ severity: 'success', summary: 'Renomeado com sucesso', life: 2000 });
    emit('refresh');
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro ao renomear', detail: e.data?.error || 'Erro interno' });
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(111,148,46,0.5); }
</style>