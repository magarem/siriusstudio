export default defineNuxtPlugin((nuxtApp) => {
  // 1. Garante que só roda no navegador E se estiver dentro de um iframe
  if (import.meta.client && window.self !== window.top) {
    
    console.log("🔌 [Sirius Plugin] Inicializado dentro do Iframe!");

    // 2. Usa o $router injetado no app (mais seguro que useRouter() em plugins)
    nuxtApp.$router.afterEach((to) => {
      console.log("📤 [Sirius Plugin] Navegou para:", to.path);
      
      window.parent.postMessage(
        {
          type: 'SIRIUS_NAV_UPDATE',
          path: to.path,
        },
        '*'
      );
    });

    // 3. Força o envio da rota inicial após 1 segundo (garante que o Nuxt pai já carregou o listener)
    setTimeout(() => {
      const initialPath = nuxtApp.$router.currentRoute.value.path;
      console.log("📤 [Sirius Plugin] Enviando rota inicial:", initialPath);
      
      window.parent.postMessage(
        {
          type: 'SIRIUS_NAV_UPDATE',
          path: initialPath,
        },
        '*'
      );
    }, 1000);
  }
});