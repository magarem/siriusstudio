<script setup>
import { computed, ref } from 'vue';

// --- PROPS ---
const props = defineProps({
  // Título e Ícone do bloco
  title: { type: String, default: '' },
  icon: { type: String, default: 'pi pi-images' },
  
  // Caminho da pasta (Ex: 'content/atrativos')
  section: { type: String, required: true },
  
  // Visualização: 'grid', 'list' ou 'rawlist'
  view: { type: String, default: 'grid' }, 
  
  // Limite de itens
  limit: { type: Number, default: 1000 },
  
  // Configurações visuais extras
  viewparams: { type: [Object, String], default: () => ({}) },
  
  // MODO PASTA: Agrupa subpastas
  subfolders: { type: Boolean, default: false },

  // IMAGENS: Imagem padrão automática (Vertical)
  fallbackImage: { type: String, default: '/images/generic_image.png' }, 
  
  // Ícone padrão para arquivos
  fileIcon: { type: String, default: 'pi pi-file' } 
});

const config = useRuntimeConfig();
const siteName = config.public.siteName;
const { isEnabled } = usePreview();

// --- COMPUTEDS DE AMBIENTE ---
const isDiskMode = computed(() => 
  isEnabled.value === true || config.public.liveContent === true
);

// --- CONFIGURAÇÃO VISUAL ---
const parsedViewParams = computed(() => {
  if (typeof props.viewparams === 'string') {
    try { return JSON.parse(props.viewparams); } catch { return {}; }
  }
  return props.viewparams || {};
});

const viewConfig = computed(() => ({
  columns: parsedViewParams.value.columns || 4,
  gap: parsedViewParams.value.gap || '1rem',
  card_showtitle: parsedViewParams.value.card_showtitle !== false,
  card_width: parsedViewParams.value.card_width || 'auto',
  card_padding: parsedViewParams.value.card_padding || '12px',
  card_border_radius: parsedViewParams.value.card_border_radius || '12px',
  card_img_aspectratio: parsedViewParams.value.card_img_aspectratio || '4 / 5',
  card_img_object_fit: parsedViewParams.value.card_img_object_fit || 'cover',
  list_card_height: parsedViewParams.value.list_card_height || '200px',
  list_img_aspectratio: parsedViewParams.value.list_img_aspectratio || '1 / 1',
  title_size: parsedViewParams.value.title_size || '16px',
  title_weight: parsedViewParams.value.title_weight || '600',
  title_color: parsedViewParams.value.title_color || '#4a3728',
}));

// --- DATA FETCHING ---
const timestamp = ref(Date.now());

const queryParams = computed(() => ({
  site: siteName,
  section: props.section,
  mode: isDiskMode.value ? 'preview' : 'production',
  t: timestamp.value, 
  nocache: 1
}));

const { data: items, status, refresh } = await useFetch('/api/admin/superList', {
  lazy: true,
  server: false,
  query: queryParams,
  transform: (response) => Array.isArray(response) ? response : [],
  default: () => [],
  watch: [() => props.section, isDiskMode] 
});

const forceRefresh = () => {
  timestamp.value = Date.now();
  refresh();
};

const loading = computed(() => status.value === 'pending');

// --- TRATAMENTO DE IMAGEM QUEBRADA ---
const onImageError = (event) => {
  if (props.fallbackImage && event.target.src.indexOf(props.fallbackImage) === -1) {
    event.target.src = props.fallbackImage;
  } else {
    event.target.style.display = 'none';
    const placeholder = event.target.parentElement.querySelector('.placeholder');
    if (placeholder) placeholder.style.display = 'flex';
  }
};

// --- LÓGICA DE AGRUPAMENTO ---
const displayedItems = computed(() => {
  const rawItems = items.value || [];

  if (!props.subfolders) {
    return rawItems.slice(0, props.limit);
  }

  const foldersMap = {};

  rawItems.forEach(item => {
    let relativePath = item.path.replace(props.section, '');
    if (relativePath.startsWith('/')) relativePath = relativePath.substring(1);
    const parts = relativePath.split('/');

    if (parts.length > 0) {
      const folderName = parts[0];
      if (!folderName || folderName.includes('.')) return; 

      if (!foldersMap[folderName]) {
        foldersMap[folderName] = {
          title: folderName.charAt(0).toUpperCase() + folderName.slice(1).replace(/-/g, ' '),
          path: `${props.section}/${folderName}`.replace('//', '/'), 
          image: item.image,
          isFolder: true, 
          count: 1
        };
      } else {
        foldersMap[folderName].count++;
      }
    }
  });

  return Object.values(foldersMap).slice(0, props.limit);
});
</script>

<template>
  <div class="list-container">
    
    <h3 v-if="title" class="list-title">
      <i :class="icon"></i> {{ title }}
    </h3>

    <div v-if="loading && items.length === 0" class="w-full h-20 flex items-center justify-center text-gray-400">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <div v-else-if="!loading && displayedItems.length === 0" class="w-full py-8 text-center text-gray-500 border border-dashed border-gray-300 rounded">
      <p>Nenhum item em: <strong>{{ section }}</strong></p>
      <button @click="forceRefresh" class="mt-2 text-xs underline text-blue-600 hover:text-blue-800 cursor-pointer">
        Forçar Atualização
      </button>
    </div>

    <div v-else class="fade-in">
      
      <div v-if="view === 'grid'" class="custom-grid">
        <NuxtLink 
          v-for="item in displayedItems" 
          :key="item.path"
          :to="item.path"
          class="custom-card grid-card group"
        >
          <div class="card-image-wrapper">
            <div v-if="item.isFolder && item.image" class="folder-overlay">
              <i class="pi pi-folder text-white text-3xl drop-shadow-md"></i>
            </div>
            
            <img v-if="item.image" :src="item.image" loading="lazy" :alt="item.title" @error="onImageError" />
            <img v-else-if="fallbackImage" :src="fallbackImage" loading="lazy" class="fallback-img" alt="Capa Padrão" />

            <div v-else class="placeholder bg-dark-blue">
               <i :class="item.isFolder ? 'pi pi-folder' : fileIcon" class="text-5xl text-white opacity-90"></i>
            </div>
            
            <div v-if="item.image || fallbackImage" class="placeholder hidden bg-dark-blue">
               <i :class="item.isFolder ? 'pi pi-folder' : fileIcon" class="text-5xl text-white opacity-90"></i>
            </div>
          </div>

          <div v-if="viewConfig.card_showtitle" class="card-content">
            <h2 class="flex items-center gap-2">
              {{ item.title }}
              <span v-if="item.count" class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-normal">
                {{ item.count }}
              </span>
            </h2>
          </div>
        </NuxtLink>
      </div>

      <div v-else-if="view === 'list'" class="custom-list">
        <NuxtLink 
          v-for="item in displayedItems" 
          :key="item.path"
          :to="item.path"
          class="custom-card list-card group"
        >
          <div class="list-image-wrapper">
             <div v-if="item.isFolder && item.image" class="folder-overlay">
               <i class="pi pi-folder text-white text-2xl drop-shadow-md"></i>
             </div>

            <img v-if="item.image" :src="item.image" loading="lazy" :alt="item.title" @error="onImageError" />
            <img v-else-if="fallbackImage" :src="fallbackImage" loading="lazy" class="fallback-img" />
            
            <div v-else class="placeholder bg-dark-blue">
              <i :class="item.isFolder ? 'pi pi-folder' : fileIcon" class="text-4xl text-white opacity-90"></i>
            </div>

             <div v-if="item.image || fallbackImage" class="placeholder hidden bg-dark-blue">
                <i :class="item.isFolder ? 'pi pi-folder' : fileIcon" class="text-4xl text-white opacity-90"></i>
             </div>
          </div>
          <div class="list-content">
            <h4 class="flex items-center gap-2">
              {{ item.title }}
              <span v-if="item.count" class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {{ item.count }} itens
              </span>
            </h4>
            <p v-if="item.description" class="excerpt">{{ item.description }}</p>
            <span class="read-more">{{ item.isFolder ? 'Abrir Pasta' : 'Ver Detalhes' }} →</span>
          </div>
        </NuxtLink>
      </div>

    <div v-else-if="view === 'rawlist'" class="flex flex-col w-full">
        <NuxtLink 
          v-for="item in displayedItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 py-1 text-gray-700 hover:text-blue-600 hover:underline"
        >
          <i 
            class="pi"
            :class="item.isFolder ? 'pi-folder text-yellow-500' : `${fileIcon.replace('pi ', '')} text-gray-400`" 
          ></i>
          
          <span>{{ item.title }}</span>

          <span v-if="item.count" class="text-xs text-gray-400 ml-1">
            ({{ item.count }})
          </span>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ANIMAÇÃO */
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.list-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #4a3728;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.list-container {
  width: 100%;
  margin-bottom: 30px;
}

/* CARD GERAL */
.custom-card {
  text-decoration: none;
  color: inherit;
  border: 1px solid #e2e8f0;
  border-radius: v-bind('viewConfig.card_border_radius');
  overflow: hidden;
  background: #fdfdfd;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  display: flex;
  padding: 0;
  width: v-bind('viewConfig.card_width');
}

.custom-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

/* IMAGENS E PLACEHOLDERS */
.folder-overlay {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  background: rgba(0,0,0,0.4);
  padding: 8px;
  border-bottom-left-radius: 12px; 
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

img, .fallback-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  display: block;
  margin: 0;
  padding: 0;
}

.custom-card:hover img {
  transform: scale(1.05);
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

/* --- FUNDO AZUL ESCURO PARA PLACEHOLDERS --- */
.bg-dark-blue {
  background-color: #1e293b;
  transition: background-color 0.3s ease;
}

.group:hover .bg-dark-blue {
  background-color: #334155;
}

.hidden { display: none !important; }

/* === GRID VIEW === */
.custom-grid {
  display: grid;
  grid-template-columns: repeat(v-bind('viewConfig.columns'), 1fr);
  gap: v-bind('viewConfig.gap');
  width: 100%;
  margin-top: 0;
}

.grid-card { flex-direction: column; }

.grid-card .card-image-wrapper {
  width: 100%;
  aspect-ratio: v-bind('viewConfig.card_img_aspectratio');
  overflow: hidden;
  position: relative;
  background: #1e293b;
  margin: 0;
  padding: 0;
  display: block;
}

.grid-card .card-image-wrapper img {
  object-fit: v-bind('viewConfig.card_img_object_fit');
}

.grid-card .card-content {
  padding: v-bind('viewConfig.card_padding');
}

.grid-card .card-content h2 {
  color: v-bind('viewConfig.title_color');
  font-size: v-bind('viewConfig.title_size');
  font-weight: v-bind('viewConfig.title_weight');
  margin: 0;
  line-height: 1.3;
}

/* === LIST VIEW === */
.custom-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  margin-top: 0;
}

.list-card {
  flex-direction: row;
  height: v-bind('viewConfig.list_card_height');
}

.list-image-wrapper {
  height: 100%;
  aspect-ratio: v-bind('viewConfig.list_img_aspectratio');
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: #1e293b;
  margin: 0;
  padding: 0;
}

.list-content {
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.list-content h4 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.list-content .excerpt {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more {
  margin-top: auto;
  color: #d1b253;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-top: 10px;
}

/* RESPONSIVIDADE */
@media (max-width: 1024px) {
  .custom-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .custom-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px;
  }

  .list-card {
    flex-direction: column;
    height: auto;
  }
  
  .list-image-wrapper {
    width: 100%;
    aspect-ratio: 16/9;
  }
  
  .list-content {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .custom-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>