<script setup>
import { computed } from 'vue'

// 1. Props padronizadas do Listfiles
const props = defineProps({
  items: { type: Array, required: true },
  viewparams: {
    type: Object,
    default: () => ({
      columns: 3, 
      gap: '40px',
      card_showdescription: true,
      card_border_radius: '2rem'
    })
  },
  config: { 
    type: Object, 
    default: () => ({
      imageHoverZoom: true
    })
  },
  fallbackImage: { type: String, default: '' },
  fileIcon: { type: String, default: 'pi pi-file-edit' }
})

const emit = defineEmits(['itemClick', 'imageError'])

// 2. Resolve a imagem (Suporta tanto string simples quanto array do ImageList)
const resolveImage = (item) => {
  if (item.image && Array.isArray(item.image) && item.image.length > 0) return item.image[0]
  if (typeof item.image === 'string') return item.image
  if (item.coverimage && Array.isArray(item.coverimage) && item.coverimage.length > 0) return item.coverimage[0]
  return props.fallbackImage
}

// 3. Emissores de Evento
const onItemClick = (item, event) => emit('itemClick', { item, event })

const onImageError = (event, item) => {
  if (props.fallbackImage && !event.target.src.includes(props.fallbackImage)) {
    event.target.src = props.fallbackImage
  } else {
    event.target.style.display = 'none'
  }
  emit('imageError', { event, item })
}
</script>

<template>
  <div 
    class="blog-grid"
    :style="{
      '--grid-cols': viewparams.columns || 3,
      '--grid-gap': viewparams.gap || '40px',
      '--card-border-radius': viewparams.card_border_radius || '2rem'
    }"
  >
    <article
      v-for="item in items"
      :key="item.id || item._path || item.path"
      class="group cursor-pointer flex flex-col h-full"
      @click="onItemClick(item, $event)"
    >
      <NuxtLink
        v-if="item._path || item.path"
        :to="item._path || item.path"
        class="flex flex-col h-full"
        :title="item.title"
      >
        
        <div 
          class="aspect-[16/10] bg-[#f8f6f4] mb-6 overflow-hidden shadow-sm group-hover:shadow-xl group-hover:shadow-[#c19a6b]/10 transition-all duration-500 relative"
          :style="{ borderRadius: 'var(--card-border-radius)' }"
        >
          <div v-if="item.category" class="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-[#2d241e] uppercase tracking-widest shadow-sm z-20">
            {{ item.category }}
          </div>

          <img
            v-if="resolveImage(item)"
            :src="resolveImage(item)"
            :alt="item.title"
            loading="lazy"
            class="w-full h-full object-cover transform transition-transform duration-700 ease-out"
            :class="{ 'group-hover:scale-105': config.imageHoverZoom }"
            @error="(e) => onImageError(e, item)"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
            <i :class="fileIcon" class="text-4xl"></i>
          </div>

          <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
        </div>

        <div class="flex flex-col flex-grow px-2">
          
          <div class="text-[#c19a6b] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-3">
            <span v-if="item.date"><i class="pi pi-calendar mr-1"></i> {{ item.date }}</span>
            <span v-if="item.date && item.readTime" class="w-1 h-1 bg-[#c19a6b] rounded-full opacity-50"></span>
            <span v-if="item.readTime"><i class="pi pi-clock mr-1"></i> {{ item.readTime }}</span>
          </div>
          
          <h3 class="font-serif font-black italic text-2xl text-[#2d241e] leading-tight mb-3 group-hover:text-[#c19a6b] transition-colors line-clamp-2">
            {{ item.title }}
          </h3>
          
          <p 
            v-if="viewparams.card_showdescription !== false && item.description" 
            class="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-5 flex-grow"
          >
            {{ item.description }}
          </p>

          <div class="mt-auto pt-4 border-t border-slate-100">
            <span class="text-[10px] font-bold text-[#2d241e] uppercase tracking-widest flex items-center gap-2 group-hover:text-[#c19a6b] transition-colors">
              Ler artigo completo <i class="pi pi-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
            </span>
          </div>

        </div>

      </NuxtLink>
    </article>
  </div>
</template>

<style scoped>
/* Grid Dinâmico Controlado pelo viewparams */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
  gap: var(--grid-gap);
  width: 100%;
}

/* Responsividade Base */
@media (max-width: 1024px) {
  .blog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .blog-grid {
    grid-template-columns: 1fr;
  }
}

/* Animação de entrada dos cards na lista */
article {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Escalonamento da animação para um efeito cascata suave */
article:nth-child(1) { animation-delay: 0.1s; }
article:nth-child(2) { animation-delay: 0.2s; }
article:nth-child(3) { animation-delay: 0.3s; }
article:nth-child(4) { animation-delay: 0.4s; }
</style>