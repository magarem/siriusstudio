<script setup>
definePageMeta({
  layout: "", // Sem layout padrão
});

const router = useRouter();

const goToLogin = () => {
  router.push("/login");
};

// Lista de funcionalidades para o Grid
const features = [
  {
    icon: "pi pi-globe",
    title: "CMS Agnóstico",
    desc: "Funciona externamente e independente do site controlado. Use com Vue, React, PHP ou HTML puro.",
  },
  {
    icon: "pi pi-pencil",
    title: "Para Criadores",
    desc: "Interface intuitiva para quem é da comunicação. Edite textos, troque fotos e gerencie conteúdo sem tocar em código.",
  },
  {
    icon: "pi pi-code",
    title: "Para Desenvolvedores",
    desc: "Mude o comportamento e organização das páginas com componentes pré-moldados e lógica Vue/Nuxt.",
  },
  {
    icon: "pi pi-palette",
    title: "Para Designers",
    desc: "Monte o design system com estrutura simples, limpa e classes utilitárias, sem amarras de temas complexos.",
  },
  {
    icon: "pi pi-database",
    title: "Flat File Store",
    desc: "Adeus bancos de dados complexos. Tudo roda com SQLite e arquivos locais. Backup simples (copiar e colar).",
  },
  {
    icon: "pi pi-lock-open",
    title: "Zero Git Dependency",
    desc: "Edite em produção sem medo. O versionamento de conteúdo é interno, sem obrigar o cliente a saber Git.",
  },
  {
    icon: "pi pi-clone",
    title: "Preview & Produção",
    desc: "Mantenha versões de rascunho e produção rodando paralelamente. Aprove antes de publicar.",
  },
  {
    icon: "pi pi-search",
    title: "SEO Otimizado",
    desc: "Campos dedicados para Meta Tags, Open Graph e Schema. Tudo o que o Google precisa para encontrar seu site.",
  },
  {
    icon: "pi pi-bolt",
    title: "Alta Performance",
    desc: "Construído sobre a engine Nitro do Nuxt 3. Respostas instantâneas via API JSON para seu frontend.",
  },
];
</script>

<template>
  <div
    class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30 relative flex flex-col overflow-x-hidden"
  >
    <div
      class="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"
    ></div>
    <div
      class="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#6f942e]/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"
    ></div>
    <div
      class="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow delay-700"
    ></div>

    <header
      class="w-full flex justify-between items-center p-6 md:px-12 z-50 fixed top-0 left-0 bg-[#0a0f0d]/80 backdrop-blur-md border-b border-white/5"
    >
      <div class="flex items-center gap-3 select-none">
        <div
          class="w-10 h-10 rounded-xl bg-[#6f942e]/10 border border-[#6f942e]/20 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(111,148,46,0.3)]"
        >
          <i class="pi pi-star-fill text-[#6f942e] text-lg"></i>
        </div>
        <div class="flex flex-col">
          <h1
            class="text-xl font-black text-white leading-none tracking-tighter"
          >
            Sirius Studio
          </h1>
          <span
            class="text-[9px] uppercase tracking-[0.4em] text-slate-500 font-bold mt-1"
            >Headless CMS</span
          >
        </div>
      </div>

      <Button
        label="Acessar Painel"
        icon="pi pi-arrow-right"
        iconPos="right"
        @click="goToLogin"
        class="bg-white text-black border-none font-bold text-xs tracking-widest px-6 py-2.5 hover:bg-slate-200 transition-colors rounded-full"
      />
    </header>

    <main
      class="flex-1 flex flex-col items-center pt-32 pb-20 px-4 relative z-10 w-full max-w-7xl mx-auto"
    >
      <section
        class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 w-full"
      >
        <div
          class="flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-up"
        >
          <div
            class="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-mono text-[#6f942e] uppercase tracking-widest inline-block shadow-[0_0_20px_-5px_rgba(111,148,46,0.3)]"
          >
            v2.0 Beta
          </div>

          <h2
            class="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9] drop-shadow-2xl"
          >
            Sirius Studio
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-[#6f942e] via-[#a3d95b] to-white animate-text-shimmer bg-[length:200%_auto]"
              >2.0</span
            >
          </h2>
          <span class="mt-0 text-4xl md:text-5xl lg:text-6xl"
            >O controle do seu site em suas mãos, sem complicações. </span
          ><br />
          <!-- <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#6f942e] via-[#a3d95b] to-white animate-text-shimmer bg-[length:200%_auto]">MÁGICA</span> -->

          <p
            class="text-slate-400 text-sm md:text-lg max-w-xl leading-relaxed mb-8 font-light"
          >
            A nova geração do CMS Headless que transforma complexidade em
            simplicidade. Gerencie experiências digitais extraordinárias sem
            tocar em uma linha de código se não quiser.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              label="Experimentar a Mágica"
              icon="pi pi-sparkles"
              class="bg-[#6f942e] border-none text-[#0a0f0d] font-black text-sm px-8 py-4 rounded-xl hover:bg-[#5a7a25] hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(111,148,46,0.6)] flex-1 sm:flex-initial justify-center"
              @click="goToLogin"
            />
          </div>
        </div>

        <div
          _class="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center animate-fade-in-up delay-200"
        >
          <div
            _class="w-full h-full _bg-[#6f942e]/5 border border-[#6f942e]/20 rounded-3xl relative overflow-hidden group p-4 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(111,148,46,0.2)] backdrop-blur-sm"
          >
            <div
              _class="absolute inset-0 bg-gradient-to-tr from-[#6f942e]/20 via-transparent to-blue-500/10 opacity-60 group-hover:scale-110 transition-transform duration-1000"
            ></div>
            <div
              _class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#6f942e]/30 to-transparent opacity-40 animate-pulse-slow"
            ></div>

            <div
              class="relative z-10 w-full h-full flex flex-col items-center justify-center"
            >
              <img
                src="/hero.png"
                alt="Sirius Magic CMS"
                class="w-full h-full rounded-2xl object-contain filter drop-shadow-[0_0_30px_rgba(111,148,46,0.5)] transform group-hover:scale-105 transition-transform duration-700 animate-float"
              />

              <p
                class="absolute bottom-4 text-[#a3d95b] font-mono uppercase tracking-[0.3em] text-[10px] font-bold text-shadow-neon animate-pulse bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm"
              >
                CMS Magic Engine 2.0
              </p>
            </div>

            <div
              class="absolute top-1/4 left-1/4 w-16 h-16 bg-[#6f942e]/20 rounded-full blur-xl animate-float delay-100"
            ></div>
            <div
              class="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-float delay-500"
            ></div>
          </div>
        </div>
      </section>

      <section
        class="w-full animate-fade-in-up delay-300 mt-10 border-t border-white/5 pt-5"
      >
        <!-- <div class="text-center mb-16">
          <h3 class="text-3xl font-bold text-white mb-3">Poderoso & Flexível</h3>
          <p class="text-slate-500 text-base max-w-2xl mx-auto">Tudo o que você precisa para gerenciar experiências digitais modernas, do conteúdo ao código.</p>
        </div> -->

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(feat, index) in features"
            :key="index"
            class="group p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-[#6f942e]/30 hover:from-white/[0.06] transition-all duration-300 hover:-translate-y-2 shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(111,148,46,0.15)]"
          >
            <div
              class="w-14 h-14 rounded-xl bg-[#6f942e]/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#6f942e]/20 transition-all duration-300 ring-1 ring-[#6f942e]/20 group-hover:ring-[#6f942e]/40"
            >
              <i
                :class="feat.icon"
                class="text-[#6f942e] text-2xl group-hover:text-[#a3d95b] transition-colors"
              ></i>
            </div>
            <h4
              class="text-xl font-bold text-white mb-3 group-hover:text-[#a3d95b] transition-colors"
            >
              {{ feat.title }}
            </h4>
            <p class="text-slate-400 text-sm leading-relaxed">
              {{ feat.desc }}
            </p>
          </div>
        </div>
      </section>
    </main>

    <footer
      class="p-8 text-center z-10 border-t border-white/5 bg-[#0a0f0d]/50 backdrop-blur-md"
    >
      <div class="flex flex-col items-center gap-4">
        <div
          class="w-8 h-8 rounded bg-[#6f942e]/20 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
        >
          <i class="pi pi-star-fill text-[#6f942e] text-xs"></i>
        </div>
        <p
          class="text-[10px] text-slate-600 font-mono uppercase tracking-widest"
        >
          &copy; 2026 Sirius Studio Core Engine • Desenvolvido por Magaweb
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Padrão de Grid no Fundo */
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, #ffffff 1px, transparent 1px),
    linear-gradient(to bottom, #ffffff 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: linear-gradient(to bottom, transparent, black, transparent);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 30%,
    black 70%,
    transparent 100%
  );
}

/* Animações */
.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

/* Nova animação para flutuar elementos */
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* Efeito de brilho no texto "MÁGICA" */
.animate-text-shimmer {
  animation: textShimmer 3s linear infinite;
}
@keyframes textShimmer {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

.text-shadow-neon {
  text-shadow: 0 0 10px rgba(163, 217, 91, 0.5);
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
.delay-300 {
  animation-delay: 0.3s;
}
.delay-500 {
  animation-delay: 0.5s;
}
.delay-700 {
  animation-delay: 0.7s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
