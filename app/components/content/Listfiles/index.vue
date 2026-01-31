<script setup>
import { computed, ref } from "vue";
import ListfilesGrid from './Grid.vue';
import ListfilesList from './List.vue';
import Supergrid from './Supergrid.vue';
import ListfilesRaw from './Raw.vue';

// --- PROPS ---
const props = defineProps({
  // Título e Ícone do bloco
  title: { type: String, default: "" },
  icon: { type: String, default: "pi pi-images" },

  // Caminho da pasta. AGORA OPCIONAL.
  // Se vazio, pega a rota atual.
  section: { type: String, default: "" },

  // Visualização: 'grid', 'list', 'supergrid' ou 'rawlist'
  view: { type: String, default: "grid" },
  
  viewparams: {
    type: Object,
    default: () => ({
      columns: 4,
      card_layout: 'vertical',
      card_showtextbox: false,
      card_showtitle: true,
      card_showdescription: true,
      card_showbody: true,
      card_img_aspectratio: '3/4',
      gap: '24px',
      card_border_radius: '12px',
      card_showaction: false,
      card_showbadges: true,
      card_minwidth: '280px'
    })
  },
  // Limite de itens
  limit: { type: Number, default: 1000 },
  cardLayout: { 
    type: String, 
    default: 'vertical',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  },
  columns: { type: Number, default: 4 },

  // MODO PASTA: Agrupa subpastas
  subfolders: { type: Boolean, default: false },

  // IMAGENS: Imagem padrão automática
  fallbackImage: { type: String, default: "/images/generic_image.png" },

  // Ícone padrão para arquivos
  fileIcon: { type: String, default: "pi pi-file" },
});

const config = useRuntimeConfig();
const route = useRoute();
const siteName = config.public.siteName;
const { isEnabled } = usePreview();

// --- LÓGICA DE SEÇÃO AUTOMÁTICA ---
const targetSection = computed(() => {
  if (props.section) return props.section;
  // Remove barras duplicadas e define content como base
  const currentPath = route.path === "/" ? "" : route.path;
  return `content${currentPath}`.replace('//', '/');
});

// --- COMPUTEDS DE AMBIENTE ---
const isDiskMode = computed(
  () => isEnabled.value === true || config.public.liveContent === true,
);

// --- CONFIGURAÇÃO VISUAL ---
const parsedViewParams = computed(() => {
  if (typeof props.viewparams === "string") {
    try {
      return JSON.parse(props.viewparams);
    } catch {
      return {};
    }
  }
  return props.viewparams || {};
});

const viewConfig = computed(() => ({
  columns: parsedViewParams.value.columns || 4,
  gap: parsedViewParams.value.gap || "1rem",
  card_showtitle: parsedViewParams.value.card_showtitle !== false,
  card_showtextbox: parsedViewParams.value.card_showtextbox !== false,
  card_showbody: parsedViewParams.value.card_showbody !== false,
  card_width: parsedViewParams.value.card_width || "auto",
  card_padding: parsedViewParams.value.card_padding || "12px",
  card_border_radius: parsedViewParams.value.card_border_radius || "12px",
  card_img_aspectratio: parsedViewParams.value.card_img_aspectratio || "4 / 5",
  card_img_object_fit: parsedViewParams.value.card_img_object_fit || "cover",
  list_card_height: parsedViewParams.value.list_card_height || "200px",
  list_img_aspectratio: parsedViewParams.value.list_img_aspectratio || "1 / 1",
  title_size: parsedViewParams.value.title_size || "16px",
  title_weight: parsedViewParams.value.title_weight || "600",
  title_color: parsedViewParams.value.title_color || "#4a3728",
}));

// --- DATA FETCHING ---
const timestamp = ref(Date.now());

const queryParams = computed(() => ({
  site: siteName,
  section: targetSection.value,
  mode: isDiskMode.value ? "preview" : "production",
  t: timestamp.value,
  nocache: 1,
}));

const {
  data: items,
  status,
  refresh,
} = await useFetch("/api/admin/superList", {
  lazy: true,
  server: false,
  query: queryParams,
  transform: (response) => (Array.isArray(response) ? response : []),
  default: () => [],
  watch: [targetSection, isDiskMode],
});

const forceRefresh = () => {
  timestamp.value = Date.now();
  refresh();
};

const loading = computed(() => status.value === "pending");

// --- HELPER: RESOLVE ASSETS URL (NOVO) ---
const resolveSmartImage = (itemPath, imgName) => {
  if (!imgName) return props.fallbackImage;
  // Se já for link externo ou absoluto da public
  if (imgName.startsWith('http') || imgName.startsWith('/')) return imgName;

  // Se for local (apenas nome do arquivo), precisamos montar o caminho
  // itemPath vem como: "content/atrativos/bistro/_index.md"
  
  // 1. Remove o nome do arquivo para pegar a pasta pai
  let folderPath = itemPath.substring(0, itemPath.lastIndexOf('/'));
  
  // 2. Remove o prefixo 'content/' pois a rota /assets/ assume base no content
  folderPath = folderPath.replace(/^content\//, '').replace(/^content/, '');
  
  // 3. Retorna URL do Túnel
  return `/assets/${folderPath}/${imgName}`.replace('//', '/');
};

// --- HELPER: LIMPA O LINK PARA NAVEGAÇÃO ---
const resolveLink = (itemPath) => {
  // De: content/atrativos/bistro/_index.md
  // Para: /atrativos/bistro
  return itemPath
    .replace(/^content/, '')
    .replace('/_index.md', '')
    .replace('/index', '')
    .replace('/index.md', '')
    .replace('.md', '');
};

// --- LÓGICA DE PROCESSAMENTO E AGRUPAMENTO ---
const displayedItems = computed(() => {
  const rawItems = items.value || [];

  // MODO 1: Lista Plana (Transforma URLs de imagem e Links)
  if (!props.subfolders) {
    return rawItems.slice(0, props.limit).map(item => ({
      ...item,
      // Garante que a imagem use o túnel de assets se for local
      image: resolveSmartImage(item.path, item.image),
      // Garante que o link (_path) seja limpo para navegação Nuxt
      path: resolveLink(item.path),
      _path: resolveLink(item.path)
    }));
  }

  // MODO 2: Agrupamento por Pastas (Subfolders = true)
  const foldersMap = {};

  rawItems.forEach((item) => {
    // Calcula caminho relativo à seção atual
    let relativePath = item.path.replace(targetSection.value, "");
    if (relativePath.startsWith("/")) relativePath = relativePath.substring(1);
    const parts = relativePath.split("/");

    if (parts.length > 0) {
      const folderName = parts[0];
      // Ignora arquivos soltos na raiz da seção ou arquivos ocultos
      if (!folderName || folderName.includes(".")) return;

      if (!foldersMap[folderName]) {
        // Cria a entrada da pasta
        foldersMap[folderName] = {
          title:
            folderName.charAt(0).toUpperCase() +
            folderName.slice(1).replace(/-/g, " "),
          // O link da pasta é: seção_atual + / + nome_pasta
          _path: `${targetSection.value}/${folderName}`.replace(/^content/, '').replace("//", "/").replace("/index",""),
          // Usa a imagem do primeiro item encontrado como capa, processada
          image: resolveSmartImage(item.path, item.image),
          isFolder: true,
          count: 1,
        };
      } else {
        foldersMap[folderName].count++;
        // Opcional: Se a pasta já existe mas não tinha imagem, tenta pegar deste item
        if (!foldersMap[folderName].image || foldersMap[folderName].image === props.fallbackImage) {
           foldersMap[folderName].image = resolveSmartImage(item.path, item.image);
        }
      }
    }
  });

  return Object.values(foldersMap).slice(0, props.limit);
});

// --- TRATAMENTO DE IMAGEM QUEBRADA ---
const onImageError = (event) => {
  if (props.fallbackImage && event.target.src.indexOf(props.fallbackImage) === -1) {
    event.target.src = props.fallbackImage;
  } else {
    event.target.style.display = "none";
    const placeholder = event.target.parentElement.querySelector(".placeholder");
    if (placeholder) placeholder.style.display = "flex";
  }
};
</script>

<template>
  <div class="list-container">
    <h3 v-if="title" class="list-title"><i :class="icon"></i> {{ title }}</h3>
    
    <div
      v-if="loading && items.length === 0"
      class="w-full h-20 flex items-center justify-center text-gray-400"
    >
      <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <div
      v-else-if="!loading && displayedItems.length === 0"
      class="w-full py-8 text-center text-gray-500 border border-dashed border-gray-300 rounded"
    >
      <p>
        Nenhum item em: <strong>{{ targetSection }}</strong>
      </p>
      <button
        @click="forceRefresh"
        class="mt-2 text-xs underline text-blue-600 hover:text-blue-800 cursor-pointer"
      >
        Forçar Atualização
      </button>
    </div>

    <div v-else class="fade-in">
  
      <ListfilesGrid 
        v-if="view === 'grid'" 
        :items="displayedItems" 
        :viewConfig="viewConfig" 
        :fallbackImage="fallbackImage"
        :fileIcon="fileIcon"
      />

      <ListfilesList 
        v-else-if="view?.toLowerCase() === 'list'" 
        :items="displayedItems" 
        :viewConfig="viewConfig" 
        :fallbackImage="fallbackImage"
        :fileIcon="fileIcon"
      />

      <Supergrid
        v-else-if="view?.toLowerCase() === 'supergrid'"
        :items="displayedItems"
        :viewparams="viewparams"
      />

      <ListfilesRaw 
        v-else-if="view?.toLowerCase() === 'rawlist'" 
        :items="displayedItems" 
        :fileIcon="fileIcon"
      />
    </div>
  </div>
</template>

<style scoped>
/* ANIMAÇÃO */
.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

/* --- ESTILOS COMPARTILHADOS QUE PODEM SER USADOS PELOS SUB-COMPONENTES SE NECESSÁRIO --- */
.custom-card {
  text-decoration: none;
  color: inherit;
  border: 1px solid #e2e8f0;
  border-radius: v-bind("viewConfig.card_border_radius");
  overflow: hidden;
  background: #fdfdfd;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  display: flex;
  padding: 0;
  width: v-bind("viewConfig.card_width");
}

.custom-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1e293b;
}

/* Helpers */
.hidden { display: none !important; }
</style>