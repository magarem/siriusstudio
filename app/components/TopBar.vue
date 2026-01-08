<template>
  <header
    v-if="content"
    class="fixed top-0 left-0 w-full z-50 transition-all duration-300"
    :class="{
      'bg-[#835c45] text-white backdrop-blur-md': !scrolled,   
      'bg-[#835c45]/95 text-gray-900 shadow-lg backdrop-blur-sm': scrolled   
    }"
  >
    <div class="flex justify-between items-center py-4 px-6 md:px-12 max-w-7xl mx-auto">
      
     <NuxtLink
  to="/"
  class="group flex flex-col items-center no-underline"
>
  <span 
    class="text-2xl md:text-3xl font-serif tracking-widest transition-all duration-500 uppercase"
    :class="{
      'text-[#fdfcf0]': !scrolled,
      'text-[#fdfcf0]': scrolled
    }"
    style="font-family: 'Times New Roman', serif;"
  >
    {{ content.title }}
  </span>
  
  <div 
    class="h-[1px] bg-current transition-all duration-500 ease-in-out opacity-30 group-hover:opacity-100"
    :class="{ 'w-0 group-hover:w-16': true }"
    style="margin-top: 2px;"
  ></div>
</NuxtLink>

      <nav class="hidden md:flex space-x-8">
        <NuxtLink
          v-for="item in content.navigation"
          :key="item.to"
          :to="item.to"
          class="relative text-xl font-serif tracking-tight transition-all duration-300 group/link"
          :class="{
            'text-[#fdfcf0]': !scrolled,
            'text-[#fdfcf0]': scrolled
          }"
        >
          {{ item.label }}
          <span 
            class="absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-300 opacity-40"
            :class="{ 
              'bg-[#fdfcf0] group-hover/link:w-full': !scrolled, 
              'bg-[#4a3728] group-hover/link:w-full': scrolled 
            }"
          ></span>
        </NuxtLink>
      </nav>

      <div class="md:hidden relative">
        <button
          @click="toggleMenu"
          class="focus:outline-none transition-colors duration-300"
          :class="{ 'text-[#fdfcf0]': !scrolled, 'text-[#4a3728]': scrolled }"
        >
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-4 w-64 bg-[#fdfcf0] shadow-2xl rounded-sm py-4 border border-[#d1b253]/30"
        >
          <NuxtLink
            v-for="item in content.navigation"
            :key="item.to"
            :to="item.to"
            class="block px-8 py-4 text-[#4a3728] font-serif uppercase tracking-[0.2em] text-sm hover:bg-[#d1b253]/10 transition-colors"
            @click="menuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  isPreview: { type: Boolean, default: false }
})

// Usamos nosso Composable para carregar o settings.md
const { content } = await useContentSource('settings', props.isPreview)

const menuOpen = ref(false)
const scrolled = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const onScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>