// siriusstudio/nuxt.config.ts
import Aura from '@primevue/themes/aura';
export default defineNuxtConfig({
  runtimeConfig: {
      storagePath: process.env.STORAGE_PATH,

    // Deixamos vazio ou com valores padrão no motor.
    // O site satélite é quem preencherá isso no seu próprio .env
    jwtSecret: process.env.JWT_SECRET || 'chave-de-emergencia-sirius-123',
   public: {
      // Ao usar o process.env aqui, você força o Node a olhar o .env
      // se o mapeamento automático do Nuxt falhar por causa dos Layers
      uploadPath: process.env.NUXT_PUBLIC_UPLOAD_PATH || 'public/images',
    }
  },
  css: [
    'primeicons/primeicons.css'
  ],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss', 
    '@nuxt/content', 
    '@nuxt/image', 
    '@primevue/nuxt-module'
  ],
  primevue: {
    options: {
      ripple: true,
      theme: { preset: Aura }
    },
    autoImport: true
  },
  // Força o Nuxt a vasculhar todos os componentes do SiriusStudio
  components: [
    { path: './components', pathPrefix: false }
  ]
  // pages: true // No Nuxt 3 isso é automático se houver a pasta /pages
})