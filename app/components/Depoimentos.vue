<template>
  <section v-if="content" class="py-12 sm:py-20" style="background-color: #fae2c8; color: #010000;">
    <div class="container mx-auto px-4 max-w-5xl">
      
      <div class="text-center mb-10">
        <h2 class="text-3xl sm:text-4xl font-extrabold mb-3 uppercase tracking-tighter font-serif">
          {{ content.title }}
        </h2>
        <p v-if="content.subtitle" class="text-base opacity-80 font-serif italic">
          {{ content.subtitle }}
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <div 
          v-for="(video, index) in content.testimonials" 
          :key="index"
          @click="openVideo(video.youtubeId)"
          class="group cursor-pointer flex flex-col bg-white/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div class="relative aspect-[4/5] bg-black">
            <img 
              :src="`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`" 
              class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              alt="Capa do depoimento"
            />
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <div class="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm">
                 <div class="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>

          <!--div class="p-3 bg-white/40">
            <h3 class="font-bold text-sm truncate">{{ video.name }}</h3>
            <p class="text-[10px] opacity-60 uppercase tracking-widest truncate">{{ video.location }}</p>
          </div-->
        </div>
      </div>

      <Dialog 
        v-model:visible="displayVideo" 
        modal 
        :dismissableMask="true"
        :showHeader="false"
        class="w-[95vw] max-w-4xl"
        :pt="{
          root: { class: 'bg-transparent border-none shadow-none overflow-hidden' },
          mask: { class: 'backdrop-blur-md bg-black/90' },
          content: { class: 'p-0 bg-black rounded-xl overflow-hidden' }
        }"
      >
        <div class="aspect-video w-full">
          <iframe 
            v-if="displayVideo"
            :src="`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&rel=0&modestbranding=1`"
            class="w-full h-full border-none"
            allow="autoplay; encrypted-media; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>

        <button 
          @click="displayVideo = false"
          class="fixed top-4 right-4 z-[1300] w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md border border-white/30 transition-all duration-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </Dialog>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  isPreview: { type: Boolean, default: false }
})

// Puxamos os dados do arquivo depoimentos.md
const { content } = await useContentSource('depoimentos', props.isPreview)

const displayVideo = ref(false);
const selectedVideoId = ref('');

const openVideo = (id) => {
  selectedVideoId.value = id;
  displayVideo.value = true;
};
</script>

<style scoped>
.aspect-\[4\/5\] { aspect-ratio: 4 / 5; }
.aspect-video { aspect-ratio: 16 / 9; }

:deep(.p-dialog-mask) {
    z-index: 1100 !important;
}
</style>