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

// 2. Detecta Preview (mantido para logica visual, se necessario)
const isPreview = computed(() => {
  return route.query.preview === 'true' || (import.meta.client && window.location.hostname.startsWith('preview.'));
});

// 3. Fetch do Source UNIFICADO
const sourceEndpoint = computed(() => {
  if (!props.source) return null;
  // Aponta sempre para o endpoint unificado do Elysia
  const cleanPath = props.source.replace(/^\//, '').replace(/\.md$/, '');
  return `/api/content/${cleanPath}`; 
});

// O Nuxt anexa automaticamente o route.query na URL final
const { data: fetchedData } = await useFetch(sourceEndpoint, {
  key: `card-video-${props.source}`,
  immediate: !!props.source,
  query: computed(() => route.query), // Repassa '?preview=true' e outras queries para o Bun
  watch: [sourceEndpoint, () => route.query]
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
  if (!color) return '#000000';
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) || 0;
  const g = parseInt(hex.substr(2, 2), 16) || 0;
  const b = parseInt(hex.substr(4, 2), 16) || 0;
  
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