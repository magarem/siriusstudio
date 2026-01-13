// siriusstudio/nuxt.config.ts
import Aura from "@primevue/themes/aura";
export default defineNuxtConfig({
  runtimeConfig: {
    storagePath: process.env.STORAGE_PATH,
    jwtSecret: process.env.JWT_SECRET || "chave-de-emergencia-sirius-123",
    public: {
      uploadPath: process.env.NUXT_PUBLIC_UPLOAD_PATH || "public/images",
    },
  },
  css: ["primeicons/primeicons.css"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/content",
    "@nuxt/image",
    "@primevue/nuxt-module",
  ],
  primevue: {
    options: {
      ripple: true,
      theme: { preset: Aura },
    },
    autoImport: true,
  },
  // Força o Nuxt a vasculhar todos os componentes do SiriusStudio
  components: [{ path: "./components", pathPrefix: false }],
  // pages: true // No Nuxt 3 isso é automático se houver a pasta /pages
});
