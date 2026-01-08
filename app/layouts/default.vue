<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <main class="flex-1 mt-10">

       <div v-if="isPreviewMode" class="preview-bar">
      <div class="flex items-center justify-center gap-3">
        <i class="pi pi-exclamation-triangle animate-pulse"></i>
        <span>MODO PREVIEW ATIVO</span>
        <a href="/" class="exit-btn">Sair do Preview</a>
      </div>
    </div>
  

    <TopBar />
      <slot />
    </main>
    <WhatsAppFab />
    <footer class="bg-gray-800 text-white py-6 text-center text-sm">
      <p>&copy; 2026 Índia Sagrada. Todos os direitos reservados. Produzido pelo Magaweb</p>
    </footer>
  </div>
</template>
