<template>
  <section v-if="content" class="py-16 sm:py-24" style="background-color: #fbead8;">
    <div class="container mx-auto px-4 max-w-6xl">
      
      <div v-if="content.title" class="mb-16 text-center">
        <h2 class="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black">
          {{ content.title }}
        </h2>
        <div class="h-1.5 w-24 bg-black mx-auto mt-4"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(item, index) in content.items" 
          :key="index"
          class="group bg-white/40 hover:bg-white transition-all duration-300 p-8 rounded-3xl border border-black/5 hover:border-black/20 shadow-sm hover:shadow-xl flex flex-col h-full"
        >
          <div class="mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-black text-[#fbead8] font-bold text-xl group-hover:scale-110 transition-transform">
            {{ index + 1 }}
          </div>

          <h3 class="text-xl font-black uppercase leading-tight mb-4 text-black min-h-[3rem]">
            {{ item.title }}
          </h3>
          
          <div class="w-10 h-1 bg-black/20 mb-4 group-hover:w-full transition-all duration-500"></div>
          
          <p class="text-slate-700 leading-relaxed text-sm sm:text-base italic">
            {{ item.description }}
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  isPreview: { type: Boolean, default: false },
  // Nome do arquivo MD sem a extensão
  source: { type: String, default: 'yoga-beneficios' }
})

// Puxa os dados do MD (frontmatter)
const { content } = await useContentSource(props.source, props.isPreview)
</script>

<style scoped>
/* Efeito de hover suave para os cards */
.group {
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>