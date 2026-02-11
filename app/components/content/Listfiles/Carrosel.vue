<script setup>
import { computed } from 'vue'

// 1. Mantemos exatamente as mesmas Props do SuperGrid para compatibilidade
const props = defineProps({
  items: { type: Array, required: true },
  viewparams: {
    type: Object,
    default: () => ({
      columns: 4, // Quantos itens aparecem na tela (desktop)
      card_showtextbox: true,
      card_showtitle: true,
      card_img_aspectratio: '4/5', // Padrão mais vertical do catálogo
      gap: '24px',
      card_border_radius: '32px', // Arredondado estilo catálogo
      card_showdescription: true,
      card_showaction: true,
    })
  },
  config: { 
    type: Object, 
    default: () => ({
      imageHoverZoom: true
    })
  },
  fallbackImage: { type: String, default: '' },
  fileIcon: { type: String, default: 'pi pi-file' }
})

const emit = defineEmits(['itemClick', 'imageError'])

// 2. Computed para calcular a largura do card baseado nas colunas
const cardWidthStyle = computed(() => {
  const cols = props.viewparams.columns || 4
  const gap = parseInt(props.viewparams.gap) || 24
  
  // Cálculo: (100% - (espaços * tamanho_gap)) / número_colunas
  // Ex: 4 colunas com gap 24px
  return `calc((100% - ${(cols - 1) * gap}px) / ${cols})`
})

const onImageError = (event, item, fallback) => {
  if (fallback && !event.target.src.includes(fallback)) {
    event.target.src = fallback
  } else {
    event.target.style.display = 'none'
    // Mostra placeholder se imagem falhar
    const container = event.target.parentElement
    if (container) {
      container.classList.add('has-error')
    }
  }
  emit('imageError', { event, item })
}

const onItemClick = (item, event) => {
  emit('itemClick', { item, event })
}
</script>

<template>
 
  <div 
    class="carousel-container hide-scrollbar"
    :style="{
      '--carousel-gap': viewparams.gap || '24px',
      '--card-border-radius': viewparams.card_border_radius || '32px',
      '--image-aspect-ratio': viewparams.card_img_aspectratio || '4/5',
      '--card-width-desktop': cardWidthStyle
    }"
  >
    <div class="carousel-track">
      
      <article
        v-for="item in items"
        :key="item.id || item.path"
        class="carousel-item snap-center"
        @click="onItemClick(item, $event)"
      >
        <NuxtLink
          v-if="item._path"
          :to="item._path"
          class="card-link h-full flex flex-col bg-white border border-yellow-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md overflow-hidden"
          :style="{ borderRadius: 'var(--card-border-radius)' }"
        >
          
          <div class="card-image-container relative bg-yellow-50">
            <div class="image-wrapper w-full h-full">
            
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500"
                :class="{ 'hover:scale-105': config.imageHoverZoom }"
                @error="(e) => onImageError(e, item, fallbackImage)"
              />
              
              <div v-else class="w-full h-full flex items-center justify-center text-yellow-300">
                <i :class="fileIcon" class="text-4xl"></i>
              </div>
            </div>

            <div v-if="item.badge" class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-yellow-800 shadow-sm">
              {{ item.badge }}
            </div>
          </div>

          <div v-if="viewparams.card_showtextbox" class="p-6 flex flex-col flex-grow space-y-3">
            
            <div v-if="viewparams.card_showtitle" class="space-y-1">
              <h3 class="font-bold text-xl text-gray-900 leading-tight line-clamp-2">
                {{ item.title }}
              </h3>
              <div v-if="item.subtitle" class="text-xs font-semibold text-yellow-600 uppercase tracking-wider">
                {{ item.subtitle }}
              </div>
            </div>

            <p 
              v-if="item.description && viewparams.card_showdescription" 
              class="text-gray-500 text-sm leading-relaxed line-clamp-3"
            >
              {{ item.description }}
            </p>

            <div class="mt-auto pt-4 border-t border-yellow-100 flex justify-between items-center">
              
              <div class="text-sm font-medium text-gray-400">
                {{ item.footerInfo || 'Ver detalhes' }}
              </div>

              <div v-if="viewparams.card_showaction" class="h-10 w-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-700 transition-colors group-hover:bg-yellow-500 group-hover:text-white">
                <i class="pi pi-arrow-right"></i>
              </div>

            </div>
          </div>

        </NuxtLink>
      </article>

    </div>
  </div>
</template>

<style scoped>
.carousel-container {
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* O Track é o container longo que rola */
.carousel-track {
  display: flex;
  gap: var(--carousel-gap);
  overflow-x: auto;
  padding-bottom: 2rem; /* Espaço para shadow não cortar */
  padding-top: 0.5rem;
  
  /* Comportamento de Snap */
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

/* O Item Individual */
.carousel-item {
  flex: none;
  
  /* Largura Responsiva */
  width: 85vw; /* Mobile: Quase tela cheia */
}

/* Aspect Ratio Control */
.card-image-container {
  aspect-ratio: var(--image-aspect-ratio);
}

/* Tablets (md) */
@media (min-width: 768px) {
  .carousel-item {
    width: 45vw; /* Tablet: 2 itens e meio */
  }
}

/* Desktop (lg) - Usa o cálculo baseado nas colunas */
@media (min-width: 1024px) {
  .carousel-item {
    width: var(--card-width-desktop);
  }
  
  /* No desktop, se couber tudo, remove o overflow para não mostrar barra desnecessária */
  /* Opcional: manter o scroll sempre se preferir */
}

/* Utilitário para esconder Scrollbar */
.hide-scrollbar .carousel-track::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar .carousel-track {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
