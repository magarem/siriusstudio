<template>
  <div class="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-3">
    <div class="relative group">
      <i class="pi pi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 group-focus-within:text-indigo-400 transition-colors"></i>
      <input 
        v-model="search" 
        type="text" 
        placeholder="Filtrar componentes..." 
        class="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-8 pr-3 text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
      />
    </div>

    <div class="space-y-1.5">
      <div v-for="comp in filteredComponents" :key="comp"
        @click="$emit('select', comp)"
        class="px-2 py-2 rounded border border-transparent hover:border-slate-800 hover:bg-slate-800/50 transition-all cursor-pointer group flex items-center justify-between"
      >
        <div class="flex items-center gap-2.5 truncate">
          <div class="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center">
            <i class="pi pi-box text-[10px] text-blue-400"></i>
          </div>
          <span class="text-[11px] font-mono text-slate-400 group-hover:text-slate-200 truncate">{{ comp }}</span>
        </div>
        
        <div class="flex items-center gap-2">
           <button @click.stop="$emit('copy', comp)" class="opacity-0 group-hover:opacity-100 p-1 hover:text-indigo-400 transition-all" title="Copiar Tag">
            <i class="pi pi-copy text-[10px]"></i>
          </button>
          <i class="pi pi-file-edit text-[10px] text-slate-600 group-hover:text-indigo-500"></i>
        </div>
      </div>

      <div v-if="filteredComponents.length === 0" class="py-8 text-center text-slate-600">
        <i class="pi pi-filter-slash mb-2"></i>
        <p class="text-[10px] uppercase tracking-wider">Nenhum encontrado</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// No Nuxt 3, ref, computed e watch são auto-importados, 
// mas se você tiver problemas, adicione o import de 'vue'.
const props = defineProps(['refreshTrigger'])
const emit = defineEmits(['select', 'copy'])

const search = ref('')

// Adicionei 'pending' para podermos mostrar um feedback visual se quiser
const { data: components, refresh, pending } = await useFetch('/api/components-list')

// O watcher está correto para disparar o refresh vindo do pai
watch(() => props.refreshTrigger, () => {
  refresh()
})

const filteredComponents = computed(() => {
  // Garantir que components.value existe e é um array antes de filtrar
  const list = Array.isArray(components.value) ? components.value : []
  if (!search.value) return list
  
  const s = search.value.toLowerCase()
  return list.filter(c => c.toLowerCase().includes(s))
})
</script>