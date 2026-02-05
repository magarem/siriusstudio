<script setup>
import { computed } from 'vue';
import Carousel from 'primevue/carousel';

const props = defineProps({
  // --- PROPS DIRETAS ---
  source: { type: String, default: null },
  image: { type: String, default: null },
  images: { type: Array, default: null },
  link: { type: String, default: null },
  title: { type: String, default: null },
  subtitle: { type: String, default: null },

  // --- NOVO PARÂMETRO ---
  // Aceita valores como '16px', '1rem', '50%', etc.
  borderRadius: { type: String, default: '0px' },

  // --- MODO CMS ---
  data: {
    type: [String, Object],
    default: null
  },

  paddingClass: {
    type: String,
    default: '' 
  },
  
  // Configs do Carrossel
  autoplayInterval: { type: Number, default: 5000 },
  circular: { type: Boolean, default: true }
});

const route = useRoute();

// 1. Detecta Preview
const isPreview = computed(() => {
  return route.query.preview === 'true' || (import.meta.client && window.location.hostname.startsWith('preview.'));
});

// 2. Fetch do Source
const sourceEndpoint = computed(() => {
  if (!props.source) return null;
  const cleanPath = props.source.replace(/^\//, '').replace(/\.md$/, '');
  return isPreview.value ? `/api/preview/${cleanPath}` : `/api/page/${cleanPath}`;
});

const { data: fetchedData } = await useFetch(sourceEndpoint, {
  key: `banner-${props.source}`,
  immediate: !!props.source,
  watch: [sourceEndpoint]
});

// --- COMPUTED PARA BORDA (Prioridade: CMS > Prop) ---
const finalBorderRadius = computed(() => {
  if (fetchedData.value?.data) {
    // Tenta pegar do CMS (suporta camelCase ou snake_case do TOML)
    const d = fetchedData.value.data;
    if (d.borderRadius) return d.borderRadius;
    if (d.border_radius) return d.border_radius;
  }
  return props.borderRadius;
});

// 3. Helper de Imagem
const getImageUrl = (imgPath, contextPath = null) => {
  if (!imgPath) return '';
  if (imgPath.startsWith('http') || imgPath.startsWith('/assets')) return imgPath;

  let url = imgPath;
  if (!url.startsWith('/')) {
    let folder = contextPath !== null ? contextPath : route.path;
    folder = folder.replace(/^\//, '').replace(/\.md$/, ''); 
    url = folder ? `/assets/${folder}/${imgPath}` : `/assets/${imgPath}`;
  }

  if (isPreview.value) {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}preview=true&t=${Date.now()}`;
  }
  return url;
};

// 4. COMPUTED PRINCIPAL: Normaliza tudo para um Array de Slides
const bannerSlides = computed(() => {
  let rawImages = [];
  let commonData = { link: '', title: '', subtitle: '' };
  let contextPath = null;

  // A. Props Manuais (Array ou String)
  if (props.images && props.images.length) {
    rawImages = props.images;
    commonData = { link: props.link, title: props.title, subtitle: props.subtitle };
  } else if (props.image) {
    rawImages = [props.image];
    commonData = { link: props.link, title: props.title, subtitle: props.subtitle };
  }

  // B. Source Fetch (CMS)
  else if (fetchedData.value?.data) {
    const d = fetchedData.value.data;
    contextPath = props.source;
    // Pega array 'images' ou string única 'image'
    if (d.images && Array.isArray(d.images)) rawImages = d.images;
    else if (d.image) rawImages = [d.image];

    commonData = { 
      link: d.link || d.url, 
      title: d.title, 
      subtitle: d.subtitle || d.description 
    };
  }

  // C. Data Prop (CMS Legado)
  else if (props.data) {
    if (typeof props.data === 'string') {
      rawImages = [props.data];
    } else {
      const d = props.data;
      if (d.images && Array.isArray(d.images)) rawImages = d.images;
      else if (d.image) rawImages = [d.image];

      commonData = { 
        link: d.link || d.url, 
        title: d.title, 
        subtitle: d.subtitle 
      };
    }
  }

  // Monta o array final de objetos
  return rawImages.map(imgStr => ({
    src: getImageUrl(imgStr, contextPath),
    ...commonData
  }));
});
</script>

<template>
  <section 
    v-if="bannerSlides.length > 0" 
    class="w-full bg-[#fae9d7]" 
    :class="paddingClass"
  >
    <div 
      class="w-full h-[300px] md:h-[500px] relative overflow-hidden group md:rounded-[var(--banner-radius)]"
      :style="{ '--banner-radius': finalBorderRadius }"
    >
     
      <Carousel 
        v-if="bannerSlides.length > 1" 
        :value="bannerSlides" 
        :numVisible="1" 
        :numScroll="1" 
        :circular="circular" 
        :autoplayInterval="autoplayInterval"
        :showNavigators="true"
        :showIndicators="false"
        class="h-full w-full custom-banner-carousel"
        contentClass="h-full"
        containerClass="h-full"
      >
        <template #item="{ data }">
          <NuxtLink 
            :to="data.link || ''" 
            :class="['block w-full h-full relative', { 'cursor-default': !data.link }]"
          >
            <img 
              :src="data.src" 
              :alt="data.title" 
              class="absolute inset-0 w-full h-full object-cover object-center" 
              loading="lazy" 
            />
          </NuxtLink>
        </template>
      </Carousel>

      <NuxtLink 
        v-else
        :to="props.link || ''" 
        :class="['block w-full h-full relative', { 'cursor-default': !props.link }]"
      >
        <img
          :src="bannerSlides[0].src"
          :alt="bannerSlides[0].title || 'Banner'"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover object-center"
        />
      </NuxtLink>

    </div>
  </section>
</template>

<style scoped>

/* Mantém apenas os estilos do carousel */
.custom-banner-carousel .p-carousel-content,
.custom-banner-carousel .p-carousel-container,
.custom-banner-carousel .p-carousel-item {
    height: 100%;
}

.custom-banner-carousel .p-carousel-prev,
.custom-banner-carousel .p-carousel-next {
    background: rgba(0,0,0,0.3);
    color: white;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    margin: 0 1rem;
    transition: background 0.3s;
}
.custom-banner-carousel .p-carousel-prev:hover,
.custom-banner-carousel .p-carousel-next:hover {
    background: #d97706;
}
</style>