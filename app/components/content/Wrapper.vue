<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
  
  // Padding interno (Gordura)
  padding: { type: String, default: 'py-12 md:py-0' },
  
  // Margem externa (Distância)
  margin: { type: String, default: 'md:mb-30' },
  
  maxWidth: { type: String, default: 'max-w-7xl' },
  bg: { type: String, default: 'bg-transparent' },
  titleAlign: { type: String, default: 'text-center' },
  titleColor: { type: String, default: 'text-[#421406]' }
});

// AQUI ESTÁ O SEGREDO:
// Criamos uma string computada que junta tudo e remove espaços vazios.
// Isso evita conflitos no :class e garante que o valor sempre exista.
const wrapperClasses = computed(() => {
  return [
    props.bg,
    props.padding,
    props.margin
  ].filter(Boolean).join(' '); // .filter(Boolean) remove strings vazias ou null
});
</script>

<template>
  <section class="w-full md:mb-25" :class="wrapperClasses">
    
    <div class="mx-auto px-6" :class="maxWidth">
      
      <div v-if="title" class="mb-10" :class="titleAlign">
        <h2 
          class="text-3xl md:text-5xl font-black tracking-tight mb-3"
          :class="titleColor"
        >
          {{ title }}
        </h2>
        
        <p v-if="subtitle" class="text-lg text-gray-600 max-w-2xl mx-auto">
          {{ subtitle }}
        </p>
        
        <div 
          v-if="titleAlign === 'text-center'"
          class="h-1 w-20 bg-[#d97706] mx-auto mt-4 rounded-full opacity-80"
        ></div>
      </div>

      <div class="wrapper-content">
        <slot />
      </div>

    </div>
  </section>
</template>