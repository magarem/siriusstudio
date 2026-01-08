<template>
  <section v-if="sectionData" class="py-16 sm:py-24" style="background-color: #fae2c8; color: #010000;">
    <div class="container mx-auto px-4 max-w-5xl">
      
      <div class="text-center mb-16">
        <h2 class="text-4xl sm:text-5xl font-extrabold mb-4 uppercase tracking-tight">
          {{ sectionData.title }}
        </h2>
        <div class="h-1 w-24 bg-black mx-auto"></div>
      </div>

      <div class="flex flex-col gap-20">
        <div v-for="(teacher, index) in sortedItems" :key="index" 
             class="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 group max-w-4xl mx-auto">
          
         <div class="relative md:shrink-0 group">
  
  <div class="absolute inset-0 bg-black/10 rounded-[2rem] translate-x-4 translate-y-4 blur-lg group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>

  <div class="relative w-64 h-80 sm:w-80 sm:h-[450px] overflow-hidden rounded-[2rem] border-4 border-white shadow-2xl bg-slate-100">
    
    <div class="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] z-10 pointer-events-none"></div>

    <img 
      :src="`/images/${teacher.image || teacher.meta?.image}`" 
      :alt="teacher.name"
      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    
    <div class="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 opacity-60 pointer-events-none"></div>
  </div>
</div>

          <div class="flex-1 text-center md:text-left">
            <h3 class="text-3xl font-black mb-1">{{ teacher.name }}</h3>
            <p class="text-indigo-700 font-bold uppercase tracking-widest text-sm mb-4">
              {{ teacher.role }}
            </p>
            
            <div class="text-base leading-relaxed opacity-90 italic">
              <ContentRenderer 
                  v-if="teacher.body && typeof teacher.body === 'object'" 
                  :value="teacher" 
                />
                
                <MDC 
                  v-else-if="teacher.body" 
                  :value="teacher.body" 
                />
            </div>
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

// Puxamos os dados do arquivo facilitadores.md
// const { content } = await useContentSource('facilitadores', props.isPreview)




// 1. Dados da Seção
// Adicionamos props.isPreview na chave para evitar cache entre modos
const { getSectionData, getContentList, getSortedList } = useContentManager('facilitadores', props.isPreview)

// Executa as buscas
const { data: sectionData } = await getSectionData()
const { data: sectionItems } = await getContentList()
// Cria a lista ordenada
const sortedItems = getSortedList(sectionItems, sectionData)

console.log('TeachersSection - sectionData:', sectionData.value)
console.log('TeachersSection - sortedItems:', sortedItems.value)  

</script>

<style scoped>
.transition-transform {
  will-change: transform;
}
</style>