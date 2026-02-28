<script setup>
defineProps({ title: String, description: String })
</script>

<template>
  <section class="py-16 bg-slate-50 px-4">
    <div class="max-w-7xl mx-auto text-center">
      <h2 class="text-3xl font-bold text-slate-900">{{ title }}</h2>
      <p class="mt-4 max-w-2xl mx-auto text-lg text-slate-600">{{ description }}</p>
      
      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <ContentSlot :use="$slots.items" />
      </div>
    </div>
  </section>
</template>