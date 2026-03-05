<script setup>
import { computed } from 'vue';

const props = defineProps({
  siteContext: String,
  currentFolder: String,
  files: { type: Array, default: () => [] }
});

const emit = defineEmits(['navigate', 'create-file', 'open-media', 'publish']);

// Atalhos rápidos configuráveis
const shortcuts = [
  { label: 'Conteúdo', folder: 'content', icon: 'pi pi-align-left', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Páginas', folder: 'pages', icon: 'pi pi-clone', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Layouts', folder: 'layouts', icon: 'pi pi-th-large', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { label: 'Componentes', folder: 'components', icon: 'pi pi-box', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
];

const fileCount = computed(() => props.files.filter(f => !f.isDirectory).length);
const folderCount = computed(() => props.files.filter(f => f.isDirectory).length);

// Pega os 4 últimos arquivos modificados (simulação baseada na ordem da lista, já que não temos timestamp fácil na listagem simples)
const recentFiles = computed(() => {
  return props.files.filter(f => !f.isDirectory).slice(0, 5);
});
</script>

<template>
  <div class="h-full flex flex-col gap-8 p-4 animate-fade-in">
    
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#141b18] to-[#0f1211] border border-white/5 p-8 md:p-12">
      <div class="absolute top-0 right-0 w-64 h-64 bg-[#6f942e]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            Olá, Editor <span class="text-[#6f942e]">.</span>
          </h2>
          <p class="text-slate-400 text-sm md:text-base max-w-lg">
            Você está gerenciando o ambiente <strong class="text-white">{{ siteContext }}</strong>. 
            Selecione uma ação abaixo ou navegue pelo menu lateral.
          </p>
        </div>
        
        <div class="flex gap-3">
           <Button label="Novo Arquivo" icon="pi pi-plus" class="bg-[#6f942e] border-none text-black font-bold" @click="emit('create-file')" />
           <Button label="Publicar Site" icon="pi pi-cloud-upload" severity="secondary" outlined class="!border-white/20 text-white hover:bg-white/5" @click="emit('publish')" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="item in shortcuts" :key="item.folder" 
           @click="emit('navigate', item.folder)"
           class="group bg-[#141b18] hover:bg-[#1a211e] border border-white/5 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 flex flex-col items-center justify-center gap-3"
      >
        <div :class="['w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110', item.bg]">
          <i :class="[item.icon, 'text-xl', item.color]"></i>
        </div>
        <span class="text-sm font-bold text-slate-300 group-hover:text-white uppercase tracking-wider">{{ item.label }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
      
      <div class="lg:col-span-2 bg-[#141b18] border border-white/5 rounded-2xl p-6 flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-white flex items-center gap-2">
            <i class="pi pi-folder-open text-[#6f942e]"></i>
            Nesta Pasta: <span class="text-slate-500 font-mono text-sm">/{{ currentFolder }}</span>
          </h3>
          <span class="text-[10px] uppercase font-black text-slate-600 bg-black/20 px-2 py-1 rounded">{{ files.length }} Itens</span>
        </div>

        <div class="flex gap-4 mb-6">
           <div class="flex-1 bg-black/20 rounded-xl p-4 flex items-center gap-4 border border-white/5">
              <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center"><i class="pi pi-file text-blue-400"></i></div>
              <div>
                <div class="text-2xl font-black text-white">{{ fileCount }}</div>
                <div class="text-[10px] uppercase text-slate-500 font-bold">Arquivos</div>
              </div>
           </div>
           <div class="flex-1 bg-black/20 rounded-xl p-4 flex items-center gap-4 border border-white/5">
              <div class="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center"><i class="pi pi-folder text-yellow-500"></i></div>
              <div>
                <div class="text-2xl font-black text-white">{{ folderCount }}</div>
                <div class="text-[10px] uppercase text-slate-500 font-bold">Subpastas</div>
              </div>
           </div>
        </div>

        <div class="flex-1 overflow-hidden flex flex-col">
           <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Arquivos Recentes / Topo</h4>
           <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
              <div v-for="file in recentFiles" :key="file.name" class="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                 <div class="flex items-center gap-3">
                   <i class="pi pi-file text-slate-400"></i>
                   <span class="text-sm text-slate-200 font-medium">{{ file.name.replace('.md', '') }}</span>
                 </div>
                 <Button icon="pi pi-arrow-right" text rounded class="text-slate-500 hover:text-[#6f942e] !w-8 !h-8" @click="emit('navigate', file.name)" />
              </div>
              <div v-if="recentFiles.length === 0" class="text-center py-4 text-slate-600 text-xs">Nenhum arquivo nesta pasta.</div>
           </div>
        </div>
      </div>

      <div class="bg-[#141b18] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
        <div class="flex-1 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center rounded-xl relative overflow-hidden group cursor-pointer" @click="emit('open-media')">
           <div class="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors"></div>
           <div class="absolute bottom-0 left-0 p-6">
              <h3 class="text-xl font-bold text-white mb-1">Galeria de Mídia</h3>
              <p class="text-xs text-slate-300">Gerenciar uploads e imagens.</p>
           </div>
           <div class="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
             <i class="pi pi-images text-white"></i>
           </div>
        </div>

        <div class="bg-[#6f942e]/10 border border-[#6f942e]/20 p-5 rounded-xl">
           <h4 class="text-[#6f942e] font-bold text-sm mb-2 flex items-center gap-2"><i class="pi pi-info-circle"></i> Dica do dia</h4>
           <p class="text-xs text-slate-400 leading-relaxed">
             Você pode arrastar e soltar arquivos na barra lateral para reordená-los. A ordem será salva automaticamente no site.
           </p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>