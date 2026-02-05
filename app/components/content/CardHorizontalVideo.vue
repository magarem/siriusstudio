<template>
  <div _class="card-horizontal-video" :class="customClass">
    <!-- Container principal com fundo transparente -->
    <div class=" flex flex-col lg:flex-row gap-6 lg:gap-[30px] p-0 md:p-0 p-0 m-0  lg:p-1 bg-transparent md:rounded-xl transition-shadow duration-300">
      
      <!-- Primeira coluna: Vídeo do YouTube -->
      <div class="lg:w-1/2">
        <div class="md:mt-15 md:rounded-[20px] relative w-full h-75 md:h-190 lg:h-[330px] overflow-hidden shadow-md">
          <!-- Container do vídeo -->
          <div 
            v-if="videoId"
            class="w-full h-full cursor-pointer"
            @click="playVideo"
          >
            <!-- Thumbnail do vídeo com overlay -->
            <div class="relative w-full h-full">
              <!-- Thumbnail -->
              <img
                :src="`https://img.youtube.com/vi/${videoId}/${imageQuality}.jpg`"
                :alt="title"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              
              <!-- Overlay com ícone de play -->
              <div v-if="showPlayButton" class="absolute inset-0 flex items-center justify-center hover:bg-opacity-20 transition-all duration-300">
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
      <div class="px-5 mb-7" :class="['lg:w-1/2 flex flex-col', layoutReverse ? 'lg:order-first' : '']">
        <!-- Título -->
        <h2 
          class="text-2xl md:text-[43px] font-bold mb-6"
          :style="{ color: titleColor }"
        >
          {{ title }}
        </h2>
        
        <!-- Texto descritivo -->
        <div class="mb-2 flex-grow" :style="{ color: textColor, fontSize: '20px' }">
          <!-- <p class="leading-relaxed md:text-[22px]"> -->
            {{ description }}
          <!-- </p> -->
          
          <!-- Informação extra (opcional) com fundo semi-transparente -->
          <div 
            v-if="additionalInfo" 
            class="mt-2 p-3 rounded-lg backdrop-blur-sm"
            :style="{ backgroundColor: `${buttonColor}15` }"
          >
            <p class="text-sm italic" :style="{ color: textColor + 'aa' }">
              {{ additionalInfo }}
            </p>
          </div>
        </div>
        
        <!-- Botão "Saiba Mais" -->
        <div v-if="buttonLink" class="mt-5">
          <a
            :href="buttonLink"
            rel="noopener noreferrer"
            class="inline-flex items-center px-6 py-3 font-medium md:rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            :style="{
              backgroundColor: buttonColor,
              color: buttonTextColor || '#ffffff'
            }"
            @mouseover="e => e.target.style.backgroundColor = buttonHoverColor || darkenColor(buttonColor, 20)"
            @mouseleave="e => e.target.style.backgroundColor = buttonColor"
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
      class="fixed inset-0 z-50 flex items-center justify-center _bg-black bg-opacity-50 p-4"
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
            class="absolute inset-0 w-full h-full rounded-lg shadow-2xl"
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
// 1. PRIMEIRO: Definir as props
interface Props {
  // --- PROPS DIRETAS ---
  videoId?: string
  title?: string
  description?: string
  buttonLink?: string
  additionalInfo?: string
  
  // --- NOVAS PROPS PARA CUSTOMIZAÇÃO ---
  titleColor?: string
  textColor?: string
  buttonColor?: string
  buttonHoverColor?: string
  buttonTextColor?: string
  imageHeightDesktop?: number
  imageHeightMobile?: number
  imageQuality?: string
  showPlayButton?: boolean
  layoutReverse?: boolean
  roundedCorners?: number
  gapSize?: string
  customClass?: string
  
  // --- MODO CMS ---
  source?: string
  data?: any
}

// Definir props com defaults
const props = withDefaults(defineProps<Props>(), {
  videoId: '',
  title: '',
  description: '',
  buttonLink: '',
  additionalInfo: '',
  titleColor: '#401709',
  textColor: '#421406',
  buttonColor: '#d97706',
  buttonHoverColor: '#b45309',
  buttonTextColor: '#ffffff',
  imageHeightDesktop: 330,
  imageHeightMobile: 256,
  imageQuality: 'maxresdefault',
  showPlayButton: true,
  layoutReverse: false,
  roundedCorners: 20,
  gapSize: 'gap-[50px]',
  customClass: '',
  source: '',
  data: null
});

const route = useRoute();

// 2. Detecta Preview
const isPreview = computed(() => {
  return route.query.preview === 'true' || (import.meta.client && window.location.hostname.startsWith('preview.'));
});

// 3. Fetch do Source
const sourceEndpoint = computed(() => {
  if (!props.source) return null;
  const cleanPath = props.source.replace(/^\//, '').replace(/\.md$/, '');
  return isPreview.value ? `/api/preview/${cleanPath}` : `/api/page/${cleanPath}`;
});

const { data: fetchedData } = await useFetch(sourceEndpoint, {
  key: `card-video-${props.source}`,
  immediate: !!props.source,
  watch: [sourceEndpoint]
});

// 4. COMPUTED PRINCIPAL: Normaliza os dados
const cardData = computed(() => {
  let data = {
    videoId: '',
    title: '',
    description: '',
    buttonLink: '',
    additionalInfo: '',
    titleColor: '#401709',
    textColor: '#421406',
    buttonColor: '#d97706',
    buttonHoverColor: '#b45309',
    buttonTextColor: '#ffffff',
    imageHeightDesktop: 330,
    imageHeightMobile: 256,
    imageQuality: 'maxresdefault',
    showPlayButton: true,
    layoutReverse: false,
    roundedCorners: 20,
    gapSize: 'gap-[50px]',
    customClass: ''
  };

  // A. Source Fetch (CMS)
  if (fetchedData.value?.data) {
    const d = fetchedData.value.data;
    Object.assign(data, d);
  }
  
  // B. Data Prop (CMS Legado)
  else if (props.data) {
    if (typeof props.data === 'string') {
      // Se for string, assume que é description
      data.description = props.data;
    } else {
      Object.assign(data, props.data);
    }
  }
  
  // C. Props Manuais (sobrescrevem tudo)
  if (props.videoId) data.videoId = props.videoId;
  if (props.title) data.title = props.title;
  if (props.description) data.description = props.description;
  if (props.buttonLink) data.buttonLink = props.buttonLink;
  if (props.additionalInfo) data.additionalInfo = props.additionalInfo;
  if (props.titleColor) data.titleColor = props.titleColor;
  if (props.textColor) data.textColor = props.textColor;
  if (props.buttonColor) data.buttonColor = props.buttonColor;
  if (props.buttonHoverColor) data.buttonHoverColor = props.buttonHoverColor;
  if (props.buttonTextColor) data.buttonTextColor = props.buttonTextColor;
  if (props.imageHeightDesktop) data.imageHeightDesktop = props.imageHeightDesktop;
  if (props.imageHeightMobile) data.imageHeightMobile = props.imageHeightMobile;
  if (props.imageQuality) data.imageQuality = props.imageQuality;
  if (props.showPlayButton !== undefined) data.showPlayButton = props.showPlayButton;
  if (props.layoutReverse !== undefined) data.layoutReverse = props.layoutReverse;
  if (props.roundedCorners) data.roundedCorners = props.roundedCorners;
  if (props.gapSize) data.gapSize = props.gapSize;
  if (props.customClass) data.customClass = props.customClass;

  return data;
});

// 5. Computed para valores específicos (para usar no template)
const videoId = computed(() => cardData.value.videoId);
const title = computed(() => cardData.value.title);
const description = computed(() => cardData.value.description);
const buttonLink = computed(() => cardData.value.buttonLink);
const additionalInfo = computed(() => cardData.value.additionalInfo);
const titleColor = computed(() => cardData.value.titleColor);
const textColor = computed(() => cardData.value.textColor);
const buttonColor = computed(() => cardData.value.buttonColor);
const buttonHoverColor = computed(() => cardData.value.buttonHoverColor);
const buttonTextColor = computed(() => cardData.value.buttonTextColor);
const imageQuality = computed(() => cardData.value.imageQuality);
const showPlayButton = computed(() => cardData.value.showPlayButton);
const layoutReverse = computed(() => cardData.value.layoutReverse);
const customClass = computed(() => cardData.value.customClass);

// 6. Estado do modal
const showVideoModal = ref(false);

// 7. Função para escurecer cor (para hover)
function darkenColor(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const darken = 1 - (percent / 100);
  
  const newR = Math.floor(r * darken);
  const newG = Math.floor(g * darken);
  const newB = Math.floor(b * darken);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// 8. Métodos
const playVideo = () => {
  if (videoId.value) {
    showVideoModal.value = true;
    document.body.style.overflow = 'hidden';
  }
};

const closeVideo = () => {
  showVideoModal.value = false;
  document.body.style.overflow = 'auto';
};

// Fallback para thumbnail caso a imagem de alta resolução não exista
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (videoId.value) {
    const qualities = ['sddefault', 'hqdefault', 'mqdefault', 'default'];
    const currentQuality = imageQuality.value;
    
    if (currentQuality === 'maxresdefault') {
      img.src = `https://img.youtube.com/vi/${videoId.value}/sddefault.jpg`;
    } else {
      const currentIndex = qualities.indexOf(currentQuality);
      if (currentIndex > -1 && currentIndex < qualities.length - 1) {
        img.src = `https://img.youtube.com/vi/${videoId.value}/${qualities[currentIndex + 1]}.jpg`;
      }
    }
  }
};

// Fecha modal com ESC
onMounted(() => {
  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeVideo();
    }
  };
  
  window.addEventListener('keydown', handleEsc);
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEsc);
  });
});
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