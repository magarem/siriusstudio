<template>
  <div class="card-horizontal-video">
    <!-- Container principal com fundo transparente -->
    <div class="flex flex-col lg:flex-row gap-6 lg:gap-[50px] p-4 lg:p-1 bg-transparent rounded-xl transition-shadow duration-300">
      
      <!-- Primeira coluna: Vídeo do YouTube -->
      <div class="lg:w-1/2 ">
        <div class="mt-10 rounded-[20px] relative w-full h-75 md:h-190 lg:h-[330px]  overflow-hidden shadow-md">
          <!-- Container do vídeo -->
          <div 
            v-if="videoId"
            class="w-full h-full _bg-gray-900 cursor-pointer "
            @click="playVideo"
          >
            <!-- Thumbnail do vídeo com overlay -->
            <div class="relative w-full h-full ">
              <!-- Thumbnail -->
              <img
                :src="`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`"
                :alt="title"
                class="w-full h-full object-cover "
                @error="handleImageError"
              />
              
              <!-- Overlay com ícone de play -->
              <div class="absolute inset-0  flex items-center justify-center hover:bg-opacity-20 transition-all duration-300">
                <div class="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transform hover:scale-110 transition-all duration-300">
                  <svg class="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Placeholder se não tiver videoId -->
          <div v-else class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <svg class="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 9v6l5-3-5-3zm7-9h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2zm-5 13.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Segunda coluna: Conteúdo textual -->
      <div class="lg:w-1/2 flex flex-col">
        <!-- Título em branco -->
        <h2 class="text-2xl text-[#401709] md:text-[43px] font-bold text-[red-200] mb-6 ">
          {{ title }}
        </h2>
        
        <!-- Texto descritivo em branco -->
        <div style="color: #421406; font-size: 22px;" class="text-[#401709] mb-6 flex-grow">
          <p class="leading-relaxed text-[#401709] md:text-[22px]">
            {{ description }}
          </p>
          
          <!-- Informação extra (opcional) com fundo semi-transparente -->
          <div v-if="additionalInfo" class="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <p class="text-sm text-[#401709] italic">
              {{ additionalInfo }}
            </p>
          </div>
        </div>
        
        <!-- Botão "Saiba Mais" -->
        <div class="mt-auto">
          <a
            :href="buttonLink"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>Saiba Mais</span>
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Modal do vídeo -->
    <div 
      v-if="showVideoModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      @click="closeVideo"
    >
      <div class="relative w-full max-w-4xl" @click.stop>
        <!-- Botão fechar -->
        <button
          @click="closeVideo"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        
        <!-- Player do YouTube -->
        <div class="relative w-full pt-[56.25%]">
          <iframe
            :src="`https://www.youtube.com/embed/${videoId}?autoplay=1`"
            class="absolute inset-0 w-full h-full rounded-lg"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props do componente
interface Props {
  videoId?: string // ID do vídeo do YouTube (ex: 'dQw4w9WgXcQ')
  title: string
  description: string
  buttonLink: string
  additionalInfo?: string
}

const props = withDefaults(defineProps<Props>(), {
  videoId: '',
  additionalInfo: ''
})

// Estado do modal
const showVideoModal = ref(false)

// Métodos
const playVideo = () => {
  if (props.videoId) {
    showVideoModal.value = true
    // Bloqueia scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden'
  }
}

const closeVideo = () => {
  showVideoModal.value = false
  // Restaura scroll do body
  document.body.style.overflow = 'auto'
}

// Fallback para thumbnail caso a imagem de alta resolução não exista
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (props.videoId) {
    img.src = `https://img.youtube.com/vi/${props.videoId}/hqdefault.jpg`
  }
}

// Fecha modal com ESC
onMounted(() => {
  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeVideo()
    }
  }
  
  window.addEventListener('keydown', handleEsc)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEsc)
  })
})
</script>

<style scoped>
.card-horizontal-video {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Animações suaves */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>