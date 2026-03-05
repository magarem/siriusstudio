<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  viewparams: {
    type: Object,
    default: () => ({
      columns: 4, 
      card_img_aspectratio: '4/5', 
      gap: '14px',
      card_border_radius: '1.5rem',
      filter_key: 'roast' 
    })
  },
  config: { 
    type: Object, 
    default: () => ({ imageHoverZoom: true })
  },
  fallbackImage: { type: String, default: '' },
  fileIcon: { type: String, default: 'pi pi-image' }
})

const emit = defineEmits(['itemClick', 'imageError'])

// --- REFS PARA O CARROSSEL E SETAS ---
const carouselTrackRef = ref(null)

const scroll = (direction) => {
  // Como usamos <transition-group>, precisamos acessar o $el para pegar a div real no DOM
  const track = carouselTrackRef.value?.$el || carouselTrackRef.value
  if (!track) return

  // Rola 70% da largura visível da tela por clique para uma experiência fluida
  const scrollAmount = track.clientWidth * 0.7 
  
  track.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

// --- SISTEMA DE FILTROS INTELIGENTE ---
const activeFilter = ref('Todos')

const filterKey = computed(() => props.viewparams.filter_key || 'roast')

const availableFilters = computed(() => {
  const keys = new Set()
  props.items.forEach(item => {
    if (item[filterKey.value]) keys.add(item[filterKey.value])
  })
  if (keys.size === 0) return []
  return ['Todos', ...Array.from(keys)]
})

const filteredItems = computed(() => {
  if (activeFilter.value === 'Todos') return props.items
  return props.items.filter(item => item[filterKey.value] === activeFilter.value)
})

// --- CÁLCULO DE LARGURA DO CARD ---
const cardWidthStyle = computed(() => {
  const cols = props.viewparams.columns || 4
  const gap = parseInt(props.viewparams.gap) || 14
  return `calc((100% - ${(cols - 1) * gap}px) / ${cols})`
})

const onImageError = (event, item, fallback) => {
  if (fallback && !event.target.src.includes(fallback)) {
    event.target.src = fallback
  } else {
    event.target.style.display = 'none'
    const container = event.target.parentElement
    if (container) container.classList.add('has-error')
  }
  emit('imageError', { event, item })
}

const resolveImage = (item) => {
  if (item.coverimage && Array.isArray(item.coverimage) && item.coverimage.length > 0) {
    return item.coverimage[0];
  }
  return item.image; 
}

const onItemClick = (item, event) => emit('itemClick', { item, event })
</script>

<template>
  <div 
    class="carousel-container py-0"
    :style="{
      '--carousel-gap': viewparams.gap || '14px',
      '--card-border-radius': viewparams.card_border_radius || '1.5rem',
      '--image-aspect-ratio': viewparams.card_img_aspectratio || '4/5',
      '--card-width-desktop': cardWidthStyle
    }"
  >
    
    <div v-if="availableFilters.length > 0" class="flex items-center gap-3 overflow-x-auto px-4 md:px-0 mb-8 pb-2 hide-scrollbar justify-center">
      <button 
        v-for="filter in availableFilters" 
        :key="filter"
        @click="activeFilter = filter"
        class="whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 border"
        :class="activeFilter === filter 
          ? 'bg-[#c19a6b] text-white border-[#c19a6b] shadow-md' 
          : 'bg-transparent text-slate-500 border-slate-200 hover:border-[#c19a6b] hover:text-[#c19a6b]'"
      >
        {{ filter }}
      </button>
    </div>

    <div class="relative w-full group/nav">
      
      <button 
        @click="scroll('left')" 
        class="absolute left-2 md:-left-5 top-[35%] -translate-y-1/2 z-20 w-12 h-12 bg-white/95 backdrop-blur-sm text-[#2d241e] rounded-full flex items-center justify-center shadow-lg border border-slate-100 hover:bg-[#c19a6b] hover:text-white transition-all duration-300 opacity-90 md:opacity-0 md:group-hover/nav:opacity-100 cursor-pointer"
        aria-label="Rolar para a esquerda"
      >
        <i class="pi pi-chevron-left text-xl"></i>
      </button>

      <transition-group 
        ref="carouselTrackRef" 
        name="list" 
        tag="div" 
        class="carousel-track hide-scrollbar px-4 md:px-0"
      >
        <article
          v-for="item in filteredItems"
          :key="item.id || item._path || item.title"
          class="carousel-item snap-center group cursor-pointer"
          @click="onItemClick(item, $event)"
        >
          <NuxtLink
            v-if="item._path"
            :to="item._path"
            class="h-full flex flex-col transition-all duration-500"
          >
            
            <div 
              class="card-image-container relative bg-[#f8f6f4] overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[#c19a6b]/20 mb-5"
              :style="{ borderRadius: 'var(--card-border-radius)' }"
            >
              <div v-if="item.sca_score" class="absolute top-4 left-4 bg-[#2d241e] text-white w-10 h-10 rounded-full flex flex-col items-center justify-center shadow-md transform -rotate-12 z-20">
                <span class="text-xs font-black leading-none">{{ item.sca_score.replace(/\D/g, '') }}</span>
              </div>

              <div class="image-wrapper w-full h-full relative z-10">
                <img
                  v-if="resolveImage(item)"
                  :src="resolveImage(item)"
                  :alt="item.title"
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-700 ease-out"
                  :class="{ 'group-hover:scale-110': config.imageHoverZoom }"
                  @error="(e) => onImageError(e, item, fallbackImage)"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-[#d1c8c0]">
                  <i :class="fileIcon" class="text-4xl"></i>
                </div>
              </div>
            </div>

            <div class="flex flex-col px-2 text-center md:text-left">
              <h3 class="font-serif font-black italic text-xl md:text-2xl text-[#2d241e] leading-tight line-clamp-1 group-hover:text-[#c19a6b] transition-colors mb-1">
                {{ item.title }}
              </h3>
              
              <span v-if="item.notes" class="text-xs font-medium text-slate-400 mb-2 truncate block">
                {{ item.notes }}
              </span>

              <div class="mt-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Por</span>
                <span class="text-xl font-black text-[#c19a6b]" v-if="item.price">
                  R$ {{ item.price }}
                </span>
                <span v-else class="text-sm font-medium text-slate-400">
                  Ver detalhes
                </span>
              </div>
            </div>

          </NuxtLink>
        </article>
      </transition-group>

      <button 
        @click="scroll('right')" 
        class="absolute right-2 md:-right-5 top-[35%] -translate-y-1/2 z-20 w-12 h-12 bg-white/95 backdrop-blur-sm text-[#2d241e] rounded-full flex items-center justify-center shadow-lg border border-slate-100 hover:bg-[#c19a6b] hover:text-white transition-all duration-300 opacity-90 md:opacity-0 md:group-hover/nav:opacity-100 cursor-pointer"
        aria-label="Rolar para a direita"
      >
        <i class="pi pi-chevron-right text-xl"></i>
      </button>

    </div>
  </div>
</template>

<style scoped>
.carousel-container {
  width: 100%;
  position: relative;
}

.carousel-track {
  display: flex;
  gap: var(--carousel-gap);
  overflow-x: auto;
  padding-bottom: 2rem; 
  padding-top: 1rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth; /* Garante que a rolagem seja sempre suave */
}

.carousel-item {
  flex: none;
  width: 75vw; 
}

.card-image-container {
  aspect-ratio: var(--image-aspect-ratio);
}

@media (min-width: 768px) {
  .carousel-item { width: 40vw; }
}

@media (min-width: 1024px) {
  .carousel-item { width: var(--card-width-desktop); }
}

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.list-enter-active,
.list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateY(20px) scale(0.95); }
.list-leave-to { opacity: 0; transform: scale(0.95); }
.list-leave-active { position: absolute; }
</style>