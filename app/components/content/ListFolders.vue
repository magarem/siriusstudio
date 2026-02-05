<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  // O caminho base. Ex: 'content/atrativos'
  section: { type: String, required: true },
  // Quantas colunas?
  cols: { type: Number, default: 4 }
});

const config = useRuntimeConfig();

// --- 1. BUSCAR DADOS ---
// Usamos o mesmo endpoint que já funciona, mas focado em trazer tudo para filtrarmos localmente
const { data: items, status } = await useFetch('/api/admin/superList', {
  lazy: true,
  server: false,
  query: {
    site: config.public.siteName,
    section: props.section,
    mode: 'production',
    nocache: 1
  },
  // Garante que sempre seja array
  transform: (res) => Array.isArray(res) ? res : [],
  default: () => []
});

const loading = computed(() => status.value === 'pending');

// --- 2. LÓGICA DE EXTRAÇÃO DE PASTAS ---
const folders = computed(() => {
  const rawList = items.value || [];
  const foldersMap = new Map();

  rawList.forEach(file => {
    // Passo A: Remove a raiz da string. 
    // De: 'content/atrativos/templos/templo1.md' -> Para: '/templos/templo1.md'
    let relative = file.path.replace(props.section, '');
    if (relative.startsWith('/')) relative = relative.substring(1);

    // Passo B: Pega a primeira parte do caminho
    const parts = relative.split('/');
    const folderName = parts[0];

    // Validações:
    // 1. Se folderName for vazio, pula.
    // 2. Se tiver ponto (ex: 'index.md'), é arquivo na raiz, ignora.
    if (!folderName || folderName.includes('.')) return;

    // Passo C: Cria ou Atualiza a Pasta no Mapa
    if (!foldersMap.has(folderName)) {
      foldersMap.set(folderName, {
        name: folderName,
        // Formata o título: 'alimentacao-vegana' -> 'Alimentacao Vegana'
        title: folderName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        // Cria o link para a próxima página
        path: `${props.section}/${folderName}`.replace('//', '/'),
        // Pega a imagem do arquivo para usar de capa da pasta
        image: file.image,
        count: 1
      });
    } else {
      // Se a pasta já existe, incrementa o contador
      foldersMap.get(folderName).count++;
    }
  });

  return Array.from(foldersMap.values());
});
</script>

<template>
  <div class="w-full mb-10">
    
    <h3 v-if="title" class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 border-gray-200">
      {{ title }}
    </h3>
    <div v-if="loading" class="py-10 text-center text-gray-400">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <div v-else-if="folders.length === 0" class="py-10 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
      Nenhuma subpasta encontrada em: <span class="font-mono text-xs">{{ section }}</span>
    </div>

    <div v-else class="grid grid-cols-2 gap-4" :class="`md:grid-cols-${cols}`">
      
      <NuxtLink 
        v-for="folder in items" 
        :key="folder.path"
        :to="folder.path"
        class="group relative h-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div class="absolute inset-0 bg-gray-800">
          <img 
            v-if="folder.image" 
            :src="folder.image" 
            class="w-full h-full object-cover opacity-50 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
            alt="Folder Cover"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 opacity-80"></div>
        </div>

        <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
          
          <!-- <i class="pi pi-folder text-4xl text-yellow-400 mb-2 drop-shadow-md group-hover:-translate-y-1 transition-transform"></i> -->
          
          <span class="text-white font-bold text-lg leading-tight drop-shadow-md">
            {{ folder.title }}
          </span>

          <!-- <span class="mt-2 text-[10px] uppercase tracking-wider font-semibold bg-black/40 text-white px-2 py-1 rounded-full backdrop-blur-sm">
            {{ folder.count }} itens
          </span> -->

        </div>

      </NuxtLink>

    </div>

  </div>
</template>