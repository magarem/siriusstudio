<script setup>
defineProps({ 
  id: String,
  title: String, 
  icon: String
})
</script>

<template>
  <div :id="id" class="bg-emerald-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl my-16 text-center max-w-5xl mx-auto scroll-mt-24 mx-4">
    <div v-if="icon" class="mb-6 inline-flex justify-center items-center rounded-full bg-white/20 p-4">
      <span :class="[icon, 'w-8 h-8 block']"></span>
    </div>
    <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">{{ title }}</h2>
    
    <div class="text-lg text-emerald-50 mb-10 max-w-3xl mx-auto leading-relaxed">
      <ContentSlot :use="$slots.default" unwrap="p" />
    </div>
    
    <div v-if="$slots.actions" class="flex flex-col sm:flex-row justify-center items-center gap-4">
      <ContentSlot :use="$slots.actions" unwrap="p" />
    </div>
  </div>
</template>