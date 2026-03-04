// siriusstudio/nuxt.config.ts
import Aura from "@primevue/themes/aura";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

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
    // Removemos o storagePath e jwtSecret daqui! O Bun cuida disso agora.
    public: {
      siteURL: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8080",
    },
  },

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
  }, 

  // A Mágica do Proxy: Nuxt fala com Bun sem problemas de CORS!
  routeRules: {
    "/api/**": { 
      proxy: (process.env.NUXT_PUBLIC_API_BASE || "http://127.0.0.1:8080") + "/api/**" 
    },
    "/assets/**": { 
      proxy: (process.env.NUXT_PUBLIC_API_BASE || "http://127.0.0.1:8080") + "/assets/**" 
    }
  },

  // Otimização total para o Bun
  nitro: {
    preset: "bun",
  },

  // Força o Nuxt a vasculhar todos os componentes do SiriusStudio
  components: [{ path: "./components", pathPrefix: false }],
});