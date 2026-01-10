<script setup>
defineProps({
  visible: Boolean,
  files: Array,
  currentFolder: String,
  currentFile: String
});

const emit = defineEmits(['update:visible', 'navigate', 'select', 'back', 'change-root', 'create-file', 'create-folder']);

const roots = ['content', 'pages', 'components', 'data', 'layout'];

const removeExtension = (filename) => filename.replace(/\.[^/.]+$/, "");
</script>

<template>
  <Drawer :visible="visible" @update:visible="emit('update:visible', $event)" header="Explorer" class="w-80 bg-[#141b18] border-r border-white/5">
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-folder-open text-[#6f942e]"></i>
        <span class="text-xs font-black uppercase tracking-widest text-slate-400">Navegação</span>
      </div>
    </template>
    
    <div class="flex flex-col h-full w-full">
      <div class="p-3 border-b border-white/5 bg-[#141b18] shrink-0 z-10">
        <div class="flex gap-2 mb-4">
           <Button label="ARQUIVO" icon="pi pi-file-plus" class="flex-1 bg-[#6f942e] border-none text-black font-black text-[10px] tracking-widest" @click="emit('create-file')" />
           <Button label="PASTA" icon="pi pi-folder-plus" class="flex-1 bg-white/10 border-none text-slate-300 hover:bg-white/20 font-black text-[10px] tracking-widest" @click="emit('create-folder')" />
        </div>

        <div class="bg-black/20 p-2 rounded-sm border border-white/5 flex flex-wrap gap-1">
          <button v-for="root in roots" :key="root"
                  @click="emit('change-root', root)"
                  :class="['text-[9px] px-2 py-1 rounded uppercase font-bold transition-all', currentFolder.startsWith(root) ? 'bg-[#6f942e] text-black' : 'bg-white/5 text-slate-500 hover:text-white']">
            {{ root }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div v-if="currentFolder.includes('/')" @click="emit('back')" class="flex items-center gap-3 p-3 rounded-sm cursor-pointer hover:bg-[#6f942e]/10 text-[#6f942e] border border-dashed border-[#6f942e]/20 mb-2">
          <i class="pi pi-arrow-up text-xs"></i><span class="text-xs font-bold uppercase tracking-widest">.. / Voltar</span>
        </div>
        
        <div v-for="file in files" :key="file.name" @click="file.isDirectory ? emit('navigate', file.name) : emit('select', file.name)"
             :class="['flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-all border border-transparent mb-1', currentFile === file.name ? 'bg-[#6f942e]/10 border-[#6f942e]/30 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300']">
          <i :class="[file.isDirectory ? 'pi pi-folder text-yellow-600 text-lg' : 'pi pi-file text-indigo-400 text-lg']"></i>
          <span class="text-sm font-medium truncate">{{ file.isDirectory ? file.name : removeExtension(file.name) }}</span>
        </div>
      </div>
    </div>
  </Drawer>
</template>