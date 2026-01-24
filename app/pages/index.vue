<script setup>
definePageMeta({
  layout: '' // Sem layout padrão para ter controle total da tela
})

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30 relative overflow-hidden flex flex-col">
    
    <div class="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6f942e]/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

    <header class="w-full flex justify-between items-center p-6 md:px-12 z-50">
      
      <div class="flex items-center gap-3 select-none">
        <div class="w-10 h-10 rounded-xl bg-[#6f942e]/10 border border-[#6f942e]/20 flex items-center justify-center">
          <i class="pi pi-star-fill text-[#6f942e] text-lg"></i>
        </div>
        <div class="flex flex-col">
          <h1 class="text-xl font-black text-white leading-none tracking-tighter">Sirius Studio</h1>
          <span class="text-[9px] uppercase tracking-[0.4em] text-slate-500 font-bold mt-1">Gerenciador</span>
        </div>
      </div>

      <Button 
        label="Acessar Sistema" 
        icon="pi pi-arrow-right" 
        iconPos="right"
        @click="goToLogin"
        class="bg-white text-black border-none font-bold text-xs tracking-widest px-6 py-3 hover:bg-slate-200 transition-colors rounded-full"
      />
    </header>

    <main class="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
      
      <div class="mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-mono text-[#6f942e] uppercase tracking-widest animate-fade-in-up">
        v1.0 Beta Release
      </div>

      <h2 class="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-6 leading-[0.9] animate-fade-in-up delay-100">
        GERENCIE O<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#6f942e] to-[#a3d95b]">EXTRAORDINÁRIO</span>
      </h2>

      <p class="text-slate-400 text-sm md:text-lg max-w-2xl leading-relaxed mb-10 font-light animate-fade-in-up delay-200">
        Um CMS Headless desenhado para performance e flexibilidade. 
        Edite conteúdo estruturado com Nuxt 3, SQLite e a elegância do Sirius Studio.
      </p>

      <div class="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-300">
        <Button 
          label="Começar Agora" 
          class="bg-[#6f942e] border-none text-[#0a0f0d] font-black text-sm px-8 py-4 rounded-xl hover:bg-[#5a7a25] hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(111,148,46,0.3)]"
          @click="goToLogin"
        />
        <!-- <Button 
          label="Documentação" 
          icon="pi pi-book"
          outlined
          class="border-white/10 text-white font-bold text-sm px-8 py-4 rounded-xl hover:bg-white/5"
        /> -->
      </div>

    </main>

    <footer class="p-6 text-center z-10">
      <p class="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
        &copy; 2026 Sirius Studio Core Engine - Desenvolvido por Magaweb
      </p>
    </footer>

  </div>
</template>

<style scoped>
/* Padrão de Grid no Fundo */
.bg-grid-pattern {
  background-image: linear-gradient(to right, #ffffff 1px, transparent 1px),
                    linear-gradient(to bottom, #ffffff 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Animações Simples */
.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.1); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>