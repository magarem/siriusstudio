<script setup>
import { ref } from 'vue';

const phases = ref([
  {
    title: 'Fase 1: Provisionamento Sem Atrito',
    icon: 'pi pi-bolt',
    steps: [
      { id: 1, title: 'Geração de Arquitetura em Um Clique', desc: 'Digite o nome do projeto e o Hypervisor do Sirius provisiona instantaneamente um ambiente isolado e de alta performance em Nuxt.js, totalmente pré-configurado e pronto para escalar.' },
      { id: 2, title: 'Roteamento e SSL Instantâneos', desc: 'Em poucos segundos, a nova aplicação está no ar. O Sirius gera automaticamente um subdomínio customizado, configura o proxy reverso via Caddy e protege a aplicação com um certificado SSL de renovação automática.' }
    ]
  },
  {
    title: 'Fase 2: O CMS Visual para o Cliente',
    icon: 'pi pi-desktop',
    steps: [
      { id: 3, title: 'Edição Visual em Contexto', desc: 'Ao pressionar Ctrl+Shift+E no site ao vivo, a interface do Sirius Studio CMS aparece sobreposta à tela, permitindo a edição de textos e imagens diretamente na página.' },
      { id: 4, title: 'Staging e Preview em Tempo Real', desc: 'As alterações são salvas com segurança no banco de dados isolado. Os clientes podem visualizar exatamente como suas atualizações ficarão em diferentes dispositivos antes de ir ao ar.' },
      { id: 5, title: 'Publicação Instantânea', desc: 'Com um único clique, o conteúdo atualizado é publicado para o mundo todo, sem a necessidade de reconstruir o servidor (rebuild) ou acionar um desenvolvedor.' }
    ]
  },
  {
    title: 'Fase 3: O Centro de Comando',
    icon: 'pi pi-server',
    steps: [
      { id: 6, title: 'Suspensão de Recursos', desc: 'Se um projeto precisar ser pausado ou a mensalidade expirar, o Painel Admin permite suspender o container instantaneamente, liberando memória sem deletar dados.' },
      { id: 7, title: 'Retomada Suave (Graceful)', desc: 'Pronto para voltar à ativa? Um único clique desperta o site novamente, restaurando o processo no PM2 e o roteamento de rede em milissegundos.' }
    ]
  },
  {
    title: 'Fase 4: O Pipeline CI/CD do Desenvolvedor',
    icon: 'pi pi-code',
    steps: [
      { id: 8, title: 'Clonagem Local Simplificada', desc: 'Os desenvolvedores podem extrair o ambiente exato do projeto para suas máquinas locais usando uma URL Git segura e gerada automaticamente pelo painel.' },
      { id: 9, title: 'Liberdade Total de Código', desc: 'Abra sua IDE favorita e construa componentes Vue customizados, modifique a lógica do backend ou integre APIs com zero restrições arquiteturais.' },
      { id: 10, title: 'Compilação Local Híbrida', desc: 'O Sirius utiliza uma Estratégia Híbrida Pré-Compilada, permitindo que seu computador local faça o trabalho pesado, mantendo o servidor incrivelmente rápido e leve.' },
      { id: 11, title: 'Push-to-Deploy (Git Hooks)', desc: 'Basta rodar "git push". O servidor Sirius intercepta o push, sincroniza dependências (pnpm install --prod) e substitui os arquivos ao vivo de forma inteligente.' },
      { id: 12, title: 'Atualizações sem Downtime', desc: 'O worker do Sirius limpa automaticamente o ambiente e recarrega o PM2 de forma invisível. O site é magicamente atualizado sem derrubar nenhuma requisição ativa.' }
    ]
  }
]);
</script>

<template>
  <section class="bg-[#0a0f0d] py-20 px-6 md:px-12 text-slate-200">
    <div class="max-w-4xl mx-auto">
      
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
          O Ecossistema <span class="text-[#6f942e]">Sirius</span>
        </h2>
        <p class="text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Preenchemos a lacuna entre ferramentas poderosas para desenvolvedores e um gerenciamento de clientes sem esforço. Veja como uma ideia se torna uma aplicação em minutos.
        </p>
      </div>

      <div class="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        
        <div v-for="(phase, index) in phases" :key="index" class="relative">
          
          <div class="md:flex items-center justify-center mb-8 relative z-10">
            <div class="flex items-center gap-3 bg-[#0a0f0d] pr-4 md:px-4 py-2">
              <div class="w-10 h-10 rounded-full bg-[#141b18] border border-[#6f942e]/30 flex items-center justify-center text-[#6f942e] shadow-[0_0_15px_rgba(111,148,46,0.2)]">
                <i :class="phase.icon"></i>
              </div>
              <h3 class="text-xl font-bold text-white tracking-widest uppercase text-sm">{{ phase.title }}</h3>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div 
              v-for="step in phase.steps" 
              :key="step.id"
              class="bg-[#141b18] border border-white/5 hover:border-[#6f942e]/50 transition-colors duration-300 p-6 rounded-xl group"
            >
              <div class="flex items-start gap-4">
                <div class="text-[#6f942e] font-black text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                  {{ step.id < 10 ? '0'+step.id : step.id }}
                </div>
                <div>
                  <h4 class="text-white font-bold mb-2">{{ step.title }}</h4>
                  <p class="text-sm text-slate-400 leading-relaxed">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  </section>
</template>