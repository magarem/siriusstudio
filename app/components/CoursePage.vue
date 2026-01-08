<template>
  <main v-if="content" class="min-h-screen bg-[#fdfcf0] py-16">
    <div class="container mx-auto px-4 max-w-6xl">
      
      <section class="flex flex-col lg:flex-row gap-12 items-center mb-24">
        <div class="lg:w-1/2">
           <h2 class="text-5xl md:text-3xl font-serif text-[#4a3728] leading-tight mb-6">
            {{ content.subtitle }}
          </h2>
            <h1 class="text-5xl md:text-5xl font-serif text-[#4a3728] leading-tight mb-6">
            {{ content.title }}
          </h1>
          
         <div class="text-xl text-gray-700 leading-relaxed mb-8">
  <div v-if="isPreview" v-html="content.bodyHtml" class="markdown-render"></div>
  <ContentRenderer v-else :value="staticPage" />
</div> <div class="flex flex-row flex-wrap items-center gap-4">
  <div class="flex items-center bg-[#4a3728] text-white px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs md:text-sm shadow-md">
    <i class="pi pi-clock mr-2 text-amber-400"></i>
    {{ content.cargaHoraria }}
  </div>

  <div class="flex items-center border-2 border-[#4a3728] bg-white text-[#4a3728] px-5 py-2 rounded-full font-bold text-xs md:text-sm shadow-sm">
    <i class="pi pi-calendar mr-2"></i>
    Início: {{ content.inicio }}
  </div>
</div>
        </div>

        <div class="lg:w-1/2 relative group">
          <div class="absolute inset-0 bg-black/5 translate-x-4 translate-y-4 rounded-[2rem] blur-xl"></div>
          <div class="relative overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl h-[500px]">
             <img src="/images/turma_meditando.jpg" class="w-full h-full object-cover" alt="Prática de Yoga" />
          </div>
        </div>
      </section>

      <section class="mb-24">
        <h2 class="text-4xl font-serif text-[#4a3728] mb-12 text-center">O que você vai aprender</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="item in content.programacao" 
            :key="item"
            class="p-6 bg-white border border-[#4a3728]/10 rounded-2xl hover:border-[#4a3728]/40 transition-colors shadow-sm"
          >
            <i class="pi pi-check-circle text-green-700 mr-2"></i>
            <span class="text-gray-800">{{ item }}</span>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-[3rem] p-10 lg:p-16 shadow-2xl border border-gray-50">
        <div class="flex flex-col lg:flex-row gap-16 items-center">
          <div class="w-64 h-64 rounded-full overflow-hidden border-8 border-[#fdfcf0] shadow-xl shrink-0">
             <img src="/images/paravyoma.png" class="w-full h-full object-cover" alt="Pedro Paravyoma" />
          </div>
          <div>
            <h2 class="text-3xl font-serif text-[#4a3728] mb-6">Seu Instrutor: {{ content.instrutor }}</h2>
            <ul class="space-y-4">
              <li v-for="info in content.bioInstrutor" :key="info" class="flex items-start gap-3">
                <span class="text-[#4a3728] font-bold">ॐ</span>
                <span class="text-lg text-gray-700">{{ info }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div class="mt-24 text-center">
        <p class="text-sm font-bold uppercase tracking-[0.3em] mb-4">Informações e Matrículas</p>
        <a 
          :href="`https://wa.me/55${content.contato.replace(/\D/g,'')}`"
          target="_blank"
          class="inline-block bg-[#25D366] text-white text-2xl font-black px-12 py-6 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <i class="pi pi-whatsapp mr-2"></i> {{ content.contato }}
        </a>
      </div>

    </div>
  </main>
</template>

<script setup>
const props = defineProps({
  isPreview: { type: Boolean, default: false }
})

// Leitura dos dados via useContentSource conforme solicitado
const { content, staticPage } = await useContentSource('formacao-yogaterapia', props.isPreview)
</script>