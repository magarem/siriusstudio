<script setup>
defineProps({
  items: { type: Array, required: true },
  fileIcon: { type: String, default: 'pi pi-file' }
});
</script>

<template>
  <div class="flex w-full flex-col gap-2 px-3">
     
    <NuxtLink
      v-for="item in items"
      :key="item._path"
      :to="item._path"
      style="text-decoration: none !important;"
      class="group flex items-center gap-4 rounded-xl border border-transparent border-b-gray-100 py-3 transition-all duration-200 ease-out _hover:bg-gray-50"
    >
      <div class="flex-shrink-0">
        <i class="pi text-6xl transition-transform duration-200 _group-hover:scale-110 md:text-7xl leading-none"
          :class="item.isFolder ? 'pi-folder text-yellow-500' : `${fileIcon.replace('pi ', '')} text-gray-400`">
        </i>
      </div>

      <span class="text-lg font-medium text-gray-700 transition-colors _group-hover:text-blue-600 md:text-xl">
        {{ item.title }}
      </span>

      <span v-if="item.count" class="ml-auto rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500 transition-colors _group-hover:bg-white">
        {{ item.count }}
      </span>
    </NuxtLink>
  </div>
</template>

