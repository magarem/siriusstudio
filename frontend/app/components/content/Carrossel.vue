<template>
  <section v-if="carrossel?.data?.images?.length > 0" class="w-full mt-0 _mb-10">
    
    <div class="relative overflow-hidden w-full h-[300px] md:h-[600px] shadow-sm group">
      <div v-for="(img, index) in carrossel.data.images" :key="index">
        <transition name="fade">
          <div
            v-if="currentSlide === index"
            class="absolute inset-0 w-full h-full"
          >
            <img
              :src="getImageUrl(img)"
              class="w-full h-full object-cover block transform transition-transform duration-[2000ms] ease-out group-hover:scale-110 opacity-100 contrast-[0.85] brightness-[1.05] saturate-70"
            />
            <div
              class="absolute inset-0 bg-[#4a3728]/10 group-hover:bg-[#4a3728]/20 transition-colors duration-700"
            ></div>
          </div>
        </transition>
      </div>

      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        <button
          v-for="(_, i) in carrossel.data.images"
          :key="i"
          @click="currentSlide = i"
          class="w-2 h-2 rounded-full transition-all duration-300 shadow-md"
          :class="currentSlide === i ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

const route = useRoute();
const currentSlide = ref(0);
let timer = null;

// 1. Detecta Preview para o helper de imagens
const isPreview = computed(() => {
  return route.query.preview === 'true' || (import.meta.client && window.location.hostname.startsWith('preview.'));
});

// 2. Helper de Imagem (com cache buster para edição em tempo real)
const getImageUrl = (img) => {
  let url = `/assets/_home/carrossel/${img}`;
  if (isPreview.value) {
      url += `?preview=true&t=${Date.now()}`;
  }
  return url;
};

// 3. O FETCH MÁGICO DO SIRIUS UNIFICADO

// e repassamos toda a query da URL (incluindo o ?preview=true) para o Bun
const { data: carrossel } = await useFetch('/api/content/_home/carrossel', {
  lazy: true,
  server: false,
  query: computed(() => {
    // Mescla um timestamp para evitar cache no Nuxt com as queries da rota atual
    return { ...route.query, t: Date.now() };
  }),
  watch: [() => route.query]
});


// --- LÓGICA DO SLIDER ---

const nextSlide = () => {
  // Acesso seguro aos dados unificados
  const images = carrossel.value?.data?.images || [];
  if (images.length === 0) return;
  
  currentSlide.value = (currentSlide.value + 1) % images.length;
};

// Observa mudanças estruturais no CMS para resetar o slide
watch(() => carrossel.value?.data?.images, () => {
  currentSlide.value = 0;
}, { deep: true });

onMounted(() => {
  timer = setInterval(nextSlide, 5000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>