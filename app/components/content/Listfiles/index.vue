<script setup>
import { computed, ref, watch } from "vue";
import ListfilesGrid from "./Grid.vue";
import ListfilesList from "./List.vue";
import Supergrid from "./Supergrid.vue";
import ListfilesRaw from "./Raw.vue";
import Carrosel from "./Carrosel.vue";
import Blog from "./Blog.vue";

// --- PROPS ---
const props = defineProps({
  source: { type: String, default: null },
  title: { type: String, default: null },
  icon: { type: String, default: null },
  section: { type: String, default: null },
  view: { type: String, default: null },
  viewparams: { type: [Object, String], default: null },
  limit: { type: Number, default: null },
  columns: { type: Number, default: null },
  subfolders: { type: Boolean, default: null },
  fallbackImage: { type: String, default: "/images/generic_image.png" },
  fileIcon: { type: String, default: "pi pi-file" },
});

const config = useRuntimeConfig();
const route = useRoute();
const siteName = config.siteId;

// =============================================================================
// 1. LÓGICA DE FETCH DA CONFIGURAÇÃO (SOURCE UNIFICADO)
// =============================================================================

const isPreview = computed(() => {
  return route.query.preview === "true" || (import.meta.client && window.location.hostname.startsWith('preview.'));
});

// Agora aponta sempre para o Cérebro do Conteúdo (/api/content)
const sourceEndpoint = computed(() => {
  if (!props.source) return null;
  const cleanPath = props.source
    .replace(/^\//, "")
    .replace(/\.json$/, "")
    .replace(/\.md$/, "")
    .replace(/\.toml$/, "");
  return `/api/content/${cleanPath}`;
});

// Repassa a query da URL (incluindo o preview=true) para o Bun
const { data: fetchedConfig } = await useFetch(sourceEndpoint, {
  key: `listfiles-config-${props.source}`,
  immediate: !!props.source,
  query: computed(() => route.query),
  watch: [sourceEndpoint, () => route.query],
  lazy: true,
});

// =============================================================================
// 2. MERGE DE PARÂMETROS (FINAL PARAMS)
// =============================================================================

const defaults = {
  title: "",
  icon: "pi pi-images",
  section: "",
  view: "grid",
  limit: 1000,
  subfolders: false,
  viewparams: {
    columns: 4,
    card_layout: "vertical",
    card_showtextbox: false,
    card_showtitle: true,
    card_showdescription: true,
    card_showbody: true,
    card_img_aspectratio: "3/4",
    gap: "24px",
    card_border_radius: "12px",
    card_showaction: false,
    card_showbadges: true,
    card_minwidth: "200px",
  },
};

const finalParams = computed(() => {
  const rawFile = fetchedConfig.value?.data || fetchedConfig.value || {};

  let fileViewParams = rawFile.viewparams || {};
  let propViewParams = props.viewparams || {};

  if (typeof propViewParams === "string") {
    try {
      propViewParams = JSON.parse(propViewParams);
    } catch {
      propViewParams = {};
    }
  }

  return {
    title: props.title ?? rawFile.title ?? defaults.title,
    icon: props.icon ?? rawFile.icon ?? defaults.icon,
    section: props.section ?? rawFile.section ?? defaults.section,
    view: props.view ?? rawFile.view ?? defaults.view,
    limit: props.limit ?? rawFile.limit ?? defaults.limit,
    subfolders: props.subfolders ?? rawFile.subfolders ?? defaults.subfolders,
    viewparams: {
      ...defaults.viewparams,
      ...fileViewParams,
      ...propViewParams,
    },
  };
});

// =============================================================================
// 3. LÓGICA INTERNA E SELEÇÃO DE SEÇÃO
// =============================================================================

const viewConfig = computed(() => {
  const vp = finalParams.value.viewparams;
  return {
    columns: vp.columns || 4,
    gap: vp.gap || "1rem",
    card_showtitle: vp.card_showtitle !== false,
    card_showtextbox: vp.card_showtextbox !== false,
    card_showbody: vp.card_showbody !== false,
    card_width: vp.card_width || "auto",
    card_padding: vp.card_padding || "12px",
    card_border_radius: vp.card_border_radius || "12px",
    card_img_aspectratio: vp.card_img_aspectratio || "4 / 5",
    card_img_object_fit: vp.card_img_object_fit || "cover",
    list_card_height: vp.list_card_height || "200px",
    list_img_aspectratio: vp.list_img_aspectratio || "1 / 1",
    title_size: vp.title_size || "16px",
    title_weight: vp.title_weight || "600",
    title_color: vp.title_color || "#4a3728",
  };
});

const targetSection = computed(() => {
  let sec = "";
  if (finalParams.value.section) {
    sec = finalParams.value.section;
  } else {
    const currentPath = route.path === "/" ? "" : route.path;
    sec = `content${currentPath}`;
  }
  sec = sec.replace(/\/+/g, "/");
  if (!sec.startsWith('content')) {
      sec = sec.startsWith('/') ? `content${sec}` : `content/${sec}`;
  }
  return sec;
});

// =============================================================================
// 4. DATA FETCHING (ITENS SUPERLIST)
// =============================================================================

const timestamp = ref(Date.now());

// Mesclamos a query da rota com as necessidades da superlist
const queryParams = computed(() => ({
  ...route.query,
  site: siteName,
  section: targetSection.value, 
  t: timestamp.value,
}));

// Rota corrigida para /api/admin/superlist (minúsculo)
const { data: items, status, refresh } = await useFetch("/api/admin/superlist", {
  lazy: true,
  server: false,
  query: queryParams,
  watch: [queryParams], 
  transform: (response) => {
    const list = Array.isArray(response) 
      ? response 
      : (response?.data || response?.files || []);
    return Array.isArray(list) ? list : [];
  },
  default: () => [],
});

const loading = computed(() => status.value === "pending");

const forceRefresh = () => {
  timestamp.value = Date.now();
};

// --- HELPERS DE IMAGEM E LINK COM CACHE BUSTER ---
const resolveSmartImage = (itemPath, imgName) => {
  if (!imgName) return props.fallbackImage;
  if (imgName.startsWith("http") || imgName.startsWith("/")) return imgName;

  let folderPath = itemPath.substring(0, itemPath.lastIndexOf("/"));
  folderPath = folderPath.replace(/^content\//, "").replace(/^content/, "");
  
  let url = `/assets/${folderPath}/${imgName}`.replace(/\/\//g, "/");
  
  if (isPreview.value) {
    url += `?preview=true&t=${Date.now()}`;
  }
  return url;
};

const resolveLink = (itemPath) => {
  return itemPath
    .replace(/^content/, "")
    .replace("/_index.md", "")
    .replace("/index", "")
    .replace("/index.md", "")
    .replace(".md", "");
};

// --- PROCESSAMENTO FINAL DOS ITENS ---
const displayedItems = computed(() => {
  const rawItems = items.value.filter(x => x.title[0] !== "_");
  const limit = finalParams.value.limit; 
  const useSubfolders = finalParams.value.subfolders;

  if (!useSubfolders) {
    return rawItems.slice(0, limit).map((item) => ({
      ...item,
      image: resolveSmartImage(item.path, item.image),
      path: resolveLink(item.path),
      _path: resolveLink(item.path),
    }));
  }

  const foldersMap = {};
  rawItems.forEach((item) => {
    let relativePath = item.path.replace(targetSection.value, "");
    if (relativePath.startsWith("/")) relativePath = relativePath.substring(1);
    const parts = relativePath.split("/");

    if (parts.length > 0) {
      const folderName = parts[0];
      if (!folderName || folderName.includes(".")) return;

      if (!foldersMap[folderName]) {
        foldersMap[folderName] = {
          title: folderName.charAt(0).toUpperCase() + folderName.slice(1).replace(/-/g, " "),
          _path: `${targetSection.value}/${folderName}`
            .replace(/^content/, "")
            .replace(/\/+/g, "/")
            .replace("/index", ""),
          image: resolveSmartImage(item.path, item.image),
          isFolder: true,
          count: 1,
        };
      } else {
        foldersMap[folderName].count++;
        if (!foldersMap[folderName].image || foldersMap[folderName].image === props.fallbackImage) {
          foldersMap[folderName].image = resolveSmartImage(item.path, item.image);
        }
      }
    }
  });

  return Object.values(foldersMap).slice(0, limit);
});
</script>
<template>
  
   <SectionWrapper 
    v-if="finalParams"
    :title="finalParams.title" 
    :subtitle="finalParams.subtitle" 
    :showFooterLine="false"
  >
  <div class="list-container">
    <!-- <h3 v-if="finalParams.title" class="list-title">
      <i v-if="finalParams.icon" :class="finalParams.icon"></i>
      {{ finalParams.title }}
    </h3> -->

    <div
      v-if="loading && (!items || items.length === 0)"
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
        v-if="finalParams.view === 'grid'"
        :items="displayedItems"
        :viewConfig="viewConfig"
        :fallbackImage="fallbackImage"
        :fileIcon="fileIcon"
      />

      <ListfilesList
        v-else-if="finalParams.view?.toLowerCase() === 'list'"
        :items="displayedItems"
        :viewConfig="viewConfig"
        :fallbackImage="fallbackImage"
        :fileIcon="fileIcon"
      />

      <Supergrid
        v-else-if="finalParams.view?.toLowerCase() === 'supergrid'"
        :items="displayedItems"
        :viewparams="finalParams.viewparams"
      />

      <ListfilesRaw
        v-else-if="finalParams.view?.toLowerCase() === 'rawlist'"
        :items="displayedItems"
        :fileIcon="fileIcon"
      />

       <Blog
        v-else-if="finalParams.view?.toLowerCase() === 'blog'"
        :items="displayedItems"
        :viewparams="finalParams.viewparams"
        :fallbackImage="fallbackImage"
        :fileIcon="fileIcon"
      />

      <Carrosel
        v-else-if="finalParams.view?.toLowerCase() === 'carrosel'"
        :items="displayedItems"
        :viewparams="finalParams.viewparams"
        :fallbackImage="fallbackImage"
        :fileIcon="fileIcon"
      />
    </div>
  </div>
  </SectionWrapper>
</template>

<style scoped>
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
.hidden {
  display: none !important;
}
</style>