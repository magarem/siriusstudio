<script setup>
const props = defineProps({
  content: String,
  currentFolder: String,
  currentFile: String
});

const emit = defineEmits(['update:content', 'open-image']);

// Proxy para v-model funcionar
const localContent = computed({
  get: () => props.content,
  set: (val) => emit('update:content', val)
});
</script>

<template>
  <main class="bg-[#141b18] rounded-[0.5vw] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative h-full">
    <div class="px-8 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center z-10">
       <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-sm bg-black/40 flex items-center justify-center border border-white/5">
             <i class="pi pi-file-edit text-[#6f942e] text-xs"></i>
          </div>
          <div class="flex flex-col">
             <span class="text-[8px] uppercase tracking-[0.2em] font-black text-slate-500">Editando</span>
             <div class="flex items-center gap-1 text-[11px] font-mono">
                <span class="text-[#6f942e] opacity-80">{{ currentFolder }}</span>
                <span class="text-slate-600">/</span>
                <span class="text-slate-200 font-bold">{{ currentFile }}</span>
             </div>
          </div>
       </div>
       <Button label="Inserir Imagem" icon="pi pi-image" text size="small" class="text-[10px]" @click="emit('open-image')" />
    </div>
    <textarea v-model="localContent" class="flex-1 p-7 bg-transparent text-indigo-50 font-mono text-[14px] leading-[1.8] outline-none resize-none custom-scrollbar z-0" spellcheck="false" placeholder="# Escreva seu conteúdo Markdown aqui..."></textarea>
  </main>
</template>