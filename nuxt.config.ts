// siriusstudio/nuxt.config.ts
import Aura from "@primevue/themes/aura";
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      exclude: [
        "@codemirror/state",
        "@codemirror/view",
        "@codemirror/commands",
        "@codemirror/language",
      ],
    },
  },
  runtimeConfig: {
    storagePath: process.env.STORAGE_PATH,
    jwtSecret: process.env.JWT_SECRET || "chave-de-emergencia-sirius-123",
    public: {
      siteURL: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      uploadPath: process.env.NUXT_PUBLIC_UPLOAD_PATH || "public/images",
    },
  },
  // css: [
  //   'primeicons/primeicons.css'],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/mdc",
    "@nuxtjs/tailwindcss",
    "@nuxt/image",
    "@primevue/nuxt-module",
  ],
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          prefix: "p",
          darkModeSelector: "system",
          cssLayer: false,
        },
      },
    },
    autoImport: true,
  }, // 2. A Mágica do Proxy
  routeRules: {
    "/api/**": {
      // Lemos a variável do Docker Compose aqui no servidor!
      proxy: process.env.NUXT_PUBLIC_API_BASE
        ? `${process.env.NUXT_PUBLIC_API_BASE}/api/**`
        : "http://localhost:8080/api/**",
    },
    "/assets/**": { proxy: "http://localhost:8080/assets/**" },
  },
  // 3. Otimização para o Bun (Opcional, mas recomendado já que migramos o Dockerfile)
  nitro: {
    preset: "bun",
  },
  // Força o Nuxt a vasculhar todos os componentes do SiriusStudio
  components: [{ path: "./components", pathPrefix: false }],
  // pages: true // No Nuxt 3 isso é automático se houver a pasta /pages
});
