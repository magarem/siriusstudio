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
              :src="img"
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
          v-for="(_, i) in carrossel.images"
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

const route = useRoute()
const currentSlide = ref(0);
let timer = null;

// --- A CORREÇÃO PRINCIPAL ESTÁ AQUI ---
// Movemos toda a lógica de API para o TOPO do script.
// Assim, a variável 'carrossel' nasce antes de ser usada.

const apiPrefix = computed(() => {
  const isPreview = route.query.preview !== undefined && route.query.preview !== 'false'
  return isPreview ? '/api/preview' : '/api/page'
})

const fetchOptions = {
  lazy: true,
  server: false,
  query: { t: Date.now() },
  watch: [apiPrefix]
}

// O fetch acontece AGORA. A variável 'carrossel' passa a existir.
const { data: carrossel } = await useFetch(() => `${apiPrefix.value}/_home/carrossel`, fetchOptions)


// --- LÓGICA DO SLIDER ---
// Agora podemos usar 'carrossel' tranquilamente aqui embaixo

const nextSlide = () => {
  // Verificação de segurança: se carrossel for null ou não tiver imagens, para.
  const images = carrossel.value?.data.images || [];
  if (images.length === 0) return;
  
  currentSlide.value = (currentSlide.value + 1) % images.length;
};

// Observa mudanças nas imagens para resetar o slide
watch(() => carrossel.value?.images, () => {
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