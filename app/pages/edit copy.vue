<script setup>
definePageMeta({ layout: '' })
    
const route = useRoute();
const { site, folder, file } = route.query;

// Busca o conteúdo do arquivo
const { data: fileData, pending, error } = await useFetch('/api/admin/storage', {
  query: { site, folder, file }
});

const content = ref('');

// Transforma "content/pousadas/suites" em [{label: 'content', path: 'content'}, {label: 'pousadas', path: 'content/pousadas'}...]
const breadcrumbs = computed(() => {
  if (!folder) return [];
  const parts = folder.split('/');
  return parts.map((part, index) => {
    return {
      label: part,
      path: parts.slice(0, index + 1).join('/')
    };
  });
});

// Função para voltar para uma pasta específica no index
const navigateToFolder = (path) => {
  navigateTo({
    path: '/',
    query: { folder: path } // O index.vue deve estar preparado para ler essa query no onMounted
  });
};

watch(fileData, (newData) => {
  if (newData && newData.content) {
    content.value = newData.content;
  }
}, { immediate: true });

async function saveFile() {
  try {
    await $fetch('/api/admin/storage', {
      method: 'POST',
      body: { site, folder, file, content: content.value }
    });
    alert("Salvo com sucesso!");
  } catch (err) {
    alert("Erro ao salvar");
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 p-8 text-white">
    <div v-if="pending" class="flex items-center gap-3 italic text-slate-400">
      <i class="pi pi-spin pi-spinner"></i> Carregando editor...
    </div>
    
    <div v-else-if="error" class="bg-red-900/20 border border-red-500 p-4 rounded-lg text-red-200">
      <i class="pi pi-exclamation-circle mr-2"></i>
      Erro ao carregar o arquivo: {{ folder }}/{{ file }}
    </div>

    <div v-else>
      <header class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2 font-mono text-sm">
          <i class="pi pi-home text-slate-500 cursor-pointer hover:text-white" @click="navigateTo('/')"></i>
          <span class="text-slate-600">/</span>
          
          <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
            <span 
              class="text-indigo-400 hover:text-indigo-300 cursor-pointer underline-offset-4 hover:underline"
              @click="navigateToFolder(crumb.path)"
            >
              {{ crumb.label }}
            </span>
            <span v-if="index < breadcrumbs.length - 1" class="text-slate-600">/</span>
          </template>
          
          <span class="text-slate-600">/</span>
          <span class="text-white font-bold">{{ file }}</span>
        </div>

        <div class="flex gap-2">
           <Button label="Voltar" icon="pi pi-arrow-left" text @click="navigateTo('/')" class="text-slate-400" />
           <Button label="Salvar" icon="pi pi-save" severity="success" @click="saveFile" />
        </div>
      </header>
      
      <textarea 
        v-model="content" 
        class="w-full h-[80vh] p-6 bg-slate-800 border border-slate-700 rounded-xl font-mono text-indigo-100 outline-none focus:border-indigo-500 shadow-inner resize-none"
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>