<script setup>
defineProps({ icon: String, title: String, description: String })
</script>

<template>
  <div class="flex flex-col p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 mb-6">
      <span :class="[icon, 'w-6 h-6 block']"></span>
    </div>
    <h3 class="text-xl font-bold text-slate-900 mb-3">{{ title }}</h3>
    <p class="text-slate-600 leading-relaxed">{{ description }}</p>
  </div>
</template>