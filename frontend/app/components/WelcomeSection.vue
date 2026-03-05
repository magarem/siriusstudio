<template>
  <section v-if="content" class="py-16 sm:py-24" style="background-color: #fbead8; color: #010000;">
    <div class="container mx-auto px-4 max-w-6xl">
      
      <header class="mb-12 text-center lg:text-left">
        <h2 class="text-5xl sm:text-5xl font-black uppercase tracking-tighter mb-4">
          {{ content.title }}
        </h2>
        <div class="h-2 w-32 bg-black mx-auto lg:mx-0"></div>
      </header>

      <div class="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        
        <div class="w-full lg:w-1/2 order-2 lg:order-1">
          <div class="space-y-8 text-lg sm:text-xl leading-relaxed text-justify">
            <p v-if="content.highlight" class="font-bold text-2xl border-l-4 border-black pl-6 py-2">
              {{ content.highlight }}
            </p>

            <div class="content-body">
              <div v-if="isPreview" v-html="content.bodyHtml" class="markdown-render"></div>
              <ContentRenderer v-else :value="staticPage" />
            </div>
          </div>
        </div>

        <div class="w-full lg:w-1/2 order-1 lg:order-2 lg:sticky lg:top-10">
          <div class="relative group">
            <div class="absolute inset-0 border-2 border-black rounded-3xl translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
            
              <div class="relative aspect-video overflow-hidden rounded-3xl shadow-2xl bg-black">
                <iframe 
                  v-if="content.youtubeId"
                  class="absolute inset-0 w-full h-full"
                  :src="`https://www.youtube.com/embed/${content.youtubeId}?rel=0&modestbranding=1&showinfo=0`"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
                
              </div>


            
          </div>




           <div class="mt-10 p-10 bg-white border-2 border-[#25D366]/30 rounded-[2rem] shadow-lg flex flex-col items-center text-center">
        <h3 class="text-xl font-serif text-[#4a3728] mb-4">Dúvidas e Matrículas</h3>
        
        <a 
        :href="`https://wa.me/+5521980661112`"
        target="_blank"
        class="flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-2xl transition-all transform hover:scale-105 shadow-md group"
        >
        <i class="pi pi-whatsapp text-2xl group-hover:animate-bounce"></i>
        <span class="text-2xl font-black">Contato</span>
        </a>
        
        <p class="mt-4 text-sm text-gray-600 font-bold uppercase tracking-widest">
        Atendimento direto via WhatsApp
        </p>
    </div>




          
       
       
       
        </div>


        


      </div>
    </div>
  </section>
</template>
<script setup>

const props = defineProps({
  isPreview: { type: Boolean, default: false }
})

const { content, staticPage } = await useContentSource('welcome', props.isPreview)
</script>

<style scoped>
/* Garante que o v-html (Preview) tenha os mesmos estilos do ContentRenderer (Produção) */
.content-body :deep(p), 
.markdown-render :deep(p) {
  margin-bottom: 2rem;
}

.content-body :deep(strong),
.markdown-render :deep(strong) {
  color: #010000;
  background-image: linear-gradient(transparent 70%, #fff 30%);
  font-weight: 800;
}
</style>