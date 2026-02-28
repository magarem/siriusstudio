<script setup>
defineProps({
  title: String,
  description: String,
  align: { type: String, default: 'center' }
})
</script>

<template>
  <section class="py-16 sm:py-24 px-4">
    <div class="max-w-7xl mx-auto">
      <div :class="['mb-12 max-w-3xl mx-auto', align === 'center' ? 'text-center' : 'text-left mx-0']">
        <h2 v-if="title" class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{{ title }}</h2>
        <p v-if="description" class="mt-4 text-lg text-slate-600 leading-relaxed">{{ description }}</p>
      </div>
      
      <ContentSlot :use="$slots.content" />
    </div>
  </section>
</template>