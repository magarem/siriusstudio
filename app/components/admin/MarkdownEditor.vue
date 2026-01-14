<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: { type: String, default: '' },
  currentFolder: { type: String, default: '' },
  currentFile: { type: String, default: '' },
  isRawMode: { type: Boolean, default: false }
});

const emit = defineEmits(['update:content', 'open-image', 'toggle-raw']);

// O v-model do textarea usa essa computada para ler e escrever
const localContent = computed({
  get() {
    return props.content;
  },
  set(newValue) {
    emit('update:content', newValue);
  }
});
</script>

<template>
  <main class="bg-[#141b18] rounded-[0.5vw] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative h-full">
    
    <div class="px-6 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center z-10 select-none">
       
       <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-sm bg-black/40 flex items-center justify-center border border-white/5">
             <i :class="isRawMode ? 'pi pi-code' : 'pi pi-file-edit'" class="text-[#6f942e] text-xs"></i>
          </div>
          <div class="flex flex-col">
             <span class="text-[8px] uppercase tracking-[0.2em] font-black text-slate-500">
               {{ isRawMode ? 'Modo Código' : 'Editor Padrão' }}
             </span>
             <div class="flex items-center gap-1 text-[11px] font-mono">
                <span class="text-[#6f942e] opacity-80">{{ currentFolder }}</span>
                <span class="text-slate-600">/</span>
                <span class="text-slate-200 font-bold">{{ currentFile }}</span>
             </div>
          </div>
       </div>

       <div class="flex items-center gap-2">
          
          <Button 
            :label="isRawMode ? 'Sair do Raw' : 'Modo Raw'" 
            :icon="isRawMode ? 'pi pi-eye' : 'pi pi-code'" 
            text 
            size="small" 
            class="!text-[10px] !font-bold tracking-widest text-slate-400 hover:text-white transition-colors"
            @click="emit('toggle-raw')" 
          />
          
          <div class="h-4 w-px bg-white/10 mx-1"></div>

          <Button 
            label="Imagem" 
            icon="pi pi-image" 
            text 
            size="small" 
            class="!text-[10px] !font-bold tracking-widest text-slate-400 hover:text-white transition-colors" 
            @click="emit('open-image')" 
          />
       </div>
    </div>

    <div class="flex-1 relative overflow-hidden bg-[#0f1211]">
        <textarea 
            v-model="localContent" 
            class="w-full h-full p-7 bg-transparent text-indigo-50 font-mono text-[14px] leading-[1.8] outline-none resize-none custom-scrollbar" 
            spellcheck="false" 
            placeholder="Carregando conteúdo..."
        ></textarea>
    </div>

  </main>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
</style>