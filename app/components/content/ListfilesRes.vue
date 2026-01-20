<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  section: { type: String, required: true },
  icon: { type: String, default: 'pi pi-images' },
  view: { type: String, default: 'grid' }, 
  limit: { type: Number, default: 1000 },
  viewparams: { 
    type: [Object, String], 
    default: () => ({})
  }
  // Removi as props de sortBy e sortOrder pois não vamos mais usar
});

const config = useRuntimeConfig();
const siteName = config.public.siteName;

// Integração Preview
const { isEnabled } = usePreview();

const isDiskMode = computed(() => 
  isEnabled.value === true || config.public.liveContent === true
);

// Parse viewparams
const parsedViewParams = computed(() => {
  if (typeof props.viewparams === 'string') {
    try {
      return JSON.parse(props.viewparams);
    } catch { return {}; }
  }
  return props.viewparams || {};
});

// Configurações com valores padrão
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

/**
 * DATA FETCHING
 */
const { data: rawItems, status, refresh } = await useAsyncData(
  `list-${props.section}-${props.limit}`,
  async () => {
    // A. MODO PREVIEW / DISK (Usa a API que respeita _order.yml)
    if (isDiskMode.value) {
      try {
        console.log("storage!")
        const rawFiles = await $fetch('/api/admin/storage', {
          query: { site: siteName, folder: props.section }
        });
        
        if (!Array.isArray(rawFiles)) return [];

        // O map preserva a ordem do array original
        return rawFiles
          .filter(f => !f.isDirectory && f.name !== 'index.md' && !f.name.startsWith('_'))
          .map(f => {
             const cleanPath = props.section.replace(/^content\/?/, '');
             const cleanFile = f.name.replace(/\.[^/.]+$/, "");
             return {
               title: f.data?.title || f.name.replace('.md', ''),
               description: f.data?.description,
               image: f.data?.images?.[0] || f.data?.topimages?.[0] || null,
               date: f.data?.date || f.data?.publishDate || null,
               path: `/${cleanPath}/${cleanFile}`.replace(/\/+/g, '/'),
               key: f.name // Use um ID único se possível, mas nome serve
             };
          });
      } catch (e) { 
        console.error('Preview fetch error:', e);
        return []; 
      }
    }

    // B. MODO PRODUÇÃO
    else {
      try {
        const result = await $fetch('/api/list', {
          query: { section: props.section }
        });
        return Array.isArray(result) ? result : [];
      } catch (e) {
        console.error('Prod fetch error:', e);
        return [];
      }
    }
  },
  {
    // Força atualização se mudar a seção ou o modo
    watch: [() => props.section, isDiskMode],
    // Opcional: transforme o payload para garantir que não haja "cache" de ordenação antiga
    transform: (data) => data
  }
);

// Computed corrigido para garantir a ordem da API
const items = computed(() => {
  if (!rawItems.value || !Array.isArray(rawItems.value)) return [];
  
  // CORREÇÃO AQUI:
  // Usamos [...array] para criar uma cópia nova e limpa.
  // Isso impede que proxies ou ordenações residuais afetem a exibição.
  const originalOrderList = [...rawItems.value];
  
  // Aplica apenas o limite, mantendo a ordem exata que veio do rawItems
  const limited = originalOrderList.slice(0, props.limit);
  
  return limited;
});

const pending = computed(() => status.value === 'pending');
</script>

<template>
  <div class="list-container">
     <h3 v-if="title" class="list-title">
      <i :class="icon"></i> {{ title }}
    </h3>

    <div v-if="pending" class="w-full h-20 flex items-center justify-center text-gray-400">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <div v-else-if="!items || items.length === 0" class="w-full py-8 text-center text-gray-500">
      Nenhum item encontrado na seção: {{ section }}
    </div>

    <div v-else>
      <!-- Debug info (remova em produção) -->
      <!-- <div class="text-xs text-gray-400 mb-2">
        Mostrando {{ items.length }} de {{ rawItems?.length || 0 }} items
      </div> -->
      
      <!-- GRID VIEW -->
      <div 
        v-if="view === 'grid'" 
        class="custom-grid"
      >
        <NuxtLink 
          v-for="item in items" 
          :key="item.key"
          :to="item.path"
          class="custom-card grid-card"
        >
          <div class="card-image-wrapper">
            <img 
              v-if="item.image" 
              :src="item.image" 
              loading="lazy" 
              :alt="item.title" 
            />
            <div v-else class="placeholder">
              <i class="pi pi-image text-4xl opacity-20"></i>
            </div>
          </div>
          
          <div v-if="viewConfig.card_showtitle" class="card-content">
            <h2>{{ item.title }}</h2>
          </div>
        </NuxtLink>
      </div>

      <!-- LIST VIEW -->
      <div v-else-if="view === 'list'" class="custom-list">
        <NuxtLink 
          v-for="item in items" 
          :key="item.key"
          :to="item.path"
          class="custom-card list-card"
        >
          <div class="list-image-wrapper">
            <img 
              v-if="item.image" 
              :src="item.image" 
              loading="lazy" 
              :alt="item.title" 
            />
            <div v-else class="placeholder">
              <i class="pi pi-image text-4xl opacity-20"></i>
            </div>
          </div>
          
          <div class="list-content">
            <h4>{{ item.title }}</h4>
            <p v-if="item.description" class="excerpt">
              {{ item.description }}
            </p>
            <span class="read-more">Ler mais →</span>
          </div>
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<style scoped>
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

/* === CARD GERAL === */
.custom-card {
  text-decoration: none;
  color: inherit;
  border: 1px solid #e2e8f0;
  border-radius: v-bind('viewConfig.card_border_radius');
  overflow: hidden;
  background: #f0dcc7;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  padding: 0;
  width: v-bind('viewConfig.card_width');
}

.custom-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* === GRID VIEW DINÂMICO === */
.custom-grid {
  display: grid;
  grid-template-columns: repeat(v-bind('viewConfig.columns'), 1fr);
  gap: v-bind('viewConfig.gap');
  width: 100%;
  margin-top: 20px;
}

.grid-card {
  flex-direction: column;
}

.grid-card .card-image-wrapper {
  width: 100%;
  aspect-ratio: v-bind('viewConfig.card_img_aspectratio');
  overflow: hidden;
  background: #396896;
  display: flex;
  margin: 0;
  padding: 0;
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
}

/* === LIST VIEW === */
.custom-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  margin-top: 20px;
}

.list-card {
  flex-direction: row;
  height: v-bind('viewConfig.list_card_height');
}

.list-image-wrapper {
  height: 100%;
  aspect-ratio: v-bind('viewConfig.list_img_aspectratio');
  flex-shrink: 0;
  background: #f1f5f9;
  overflow: hidden;
  position: relative;
  display: flex;
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
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
}

.list-content .excerpt {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
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

/* IMAGENS E PLACEHOLDERS */
img {
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
  color: #cbd5e1;
  background: #f8fafc;
}

/* RESPONSIVIDADE */
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
    aspect-ratio: 1 / 1;
  }
  
  .list-content {
    padding: 15px;
  }
}

@media (max-width: 400px) {
  .custom-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>