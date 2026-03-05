<script setup>
import { ref } from 'vue';

const props = defineProps({
  siteContext: { type: String, default: 'Carregando...' },
  siteUrl: { type: String, default: '' },
  currentFolder: String,
  currentFile: String,
  loadingSave: Boolean,
  loadingPublish: Boolean,
  showMetaSidebar: Boolean,
  isRawMode: Boolean
});

// Definindo explicitamente todos os eventos
const emit = defineEmits([
  'toggle-sidebar', 'toggle-meta', 'toggle-raw', 
  'save', 'publish', 'logout', 'open-media', 'go-dashboard', 'preview',
  'open-backup'
]);

// --- MENU DE USUÁRIO ---
const menu = ref();
const userMenuItems = ref([
  { separator: true },
  {
    label: 'Sair (Logout)',
    icon: 'pi pi-power-off',
    class: 'text-red-400',
    command: () => emit('logout')
  }
]);

const toggleUserMenu = (event) => {
  menu.value.toggle(event);
};

const goToBackup = () => {
  emit('open-backup');
};
</script>

<template>
  <header class="h-16 w-full bg-[#141b18] border-b border-white/5 relative z-50">
      <div class="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div class="absolute -top-10 -left-10 w-32 h-32 bg-[#6f942e]/10 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 flex justify-between items-center h-full px-6">
        
        <div class="flex items-center gap-4">
           <div class="flex items-center gap-3 pr-4 border-r border-white/5 h-10">
            
            <Button 
                icon="pi pi-bars" 
                text 
                @click="emit('toggle-sidebar')" 
                class="!w-8 !h-8 !p-0 text-[#6f942e] hover:bg-[#6f942e]/10 cursor-pointer" 
                v-tooltip.bottom="'Explorer'" 
            />

            <div 
              class="flex items-center gap-3 select-none pl-1 cursor-pointer group"
              @click="emit('go-dashboard')"
              title="Voltar ao Dashboard"
            >
              <h1 class="text-[20px] font-black text-white leading-none tracking-tighter flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <i class="pi pi-star-fill text-[#6f942e] text-[15px]"></i> 
                <span class="hidden sm:inline">Sirius Studio</span>
              </h1>

              <div class="h-5 w-px bg-white/10 mx-1"></div>

              <div class="flex flex-col justify-center">
                 <span class="text-[9px] uppercase tracking-widest text-slate-500 font-bold leading-none mb-0.5">Projeto</span>
                 <span class="text-sm font-bold text-[#6f942e] leading-none tracking-wide">
                   {{ siteContext }}
                 </span>
              </div>
            </div>

          </div>
        </div>

        <div class="flex items-center gap-2">

          <Button 
            text 
            @click="emit('open-media')" 
            v-tooltip.bottom="'Galeria de Mídia'"
            class="text-slate-400 hover:text-white hover:bg-white/5 !px-3 cursor-pointer"
          >
            <i class="pi pi-images"></i>
            <span class="hidden lg:inline ml-2 font-medium text-xs uppercase tracking-wide">Mídia</span>
          </Button>

          <Button 
              :loading="loadingSave" 
              @click="emit('save')" 
              :disabled="!currentFile" 
              class="bg-[#6f942e] border-none text-black hover:bg-[#5a7a25] transition-all !px-4 cursor-pointer" 
          >
              <i class="pi pi-save" v-if="!loadingSave"></i>
              <span class="hidden lg:inline ml-2 font-bold text-xs tracking-widest">SALVAR</span>
          </Button>

          <Button 
              outlined 
              @click="emit('preview')"
              :disabled="!currentFile && !siteUrl"
              class="!border-white/20 !text-slate-200 hover:!bg-white/5 hover:!text-white hover:!border-[#6f942e] transition-colors !px-3 cursor-pointer"
              v-tooltip.bottom="'Live Preview'"
          >
              <i class="pi pi-external-link"></i>
              <span class="hidden lg:inline ml-2 font-bold text-xs tracking-widest">PREVIEW</span>
          </Button>

          <Button 
              outlined 
              :loading="loadingPublish"
              @click="emit('publish')" 
              class="!border-white/20 !text-slate-200 hover:!bg-purple-500/10 hover:!text-purple-300 hover:!border-purple-500/50 transition-colors !px-3 cursor-pointer" 
              v-tooltip.bottom="'Atualizar Site Público'"
          >
              <i class="pi pi-cloud-upload" v-if="!loadingPublish"></i>
              <span class="hidden lg:inline ml-2 font-bold text-xs tracking-widest">PUBLICAR</span>
          </Button>

          <div class="w-px h-6 bg-white/10 mx-2"></div>

          <div class="flex items-center gap-1">
             <Button 
              text 
              rounded
              @click="goToBackup"
              class="!w-9 !h-9 !p-0 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              v-tooltip.bottom="'Configurações'"
            >
              <i class="pi pi-cog text-lg"></i>
            </Button>

            <div class="relative">
              <Button 
                type="button" 
                @click="toggleUserMenu" 
                class="!p-1 !w-auto !h-auto !bg-transparent !border-none hover:!bg-white/5 rounded-full flex gap-2 items-center transition-colors cursor-pointer"
              >
                <Avatar icon="pi pi-user" shape="circle" class="!bg-indigo-500/20 !text-indigo-400 border border-indigo-500/30" />
                <i class="pi pi-angle-down text-slate-500 text-xs mr-1"></i>
              </Button>
              <Menu ref="menu" :model="userMenuItems" :popup="true" class="!bg-[#1a211e] !border-white/10 !min-w-[180px]" />
            </div>
          </div>

        </div>
      </div>
  </header>
</template>

<style scoped>
/* Estilos mantidos iguais, apenas garantindo override do PrimeVue */
:deep(.p-menu) {
  padding: 0.5rem;
  border-radius: 12px;
  background: #1a211e;
  border: 1px solid rgba(255,255,255,0.1);
  z-index: 9999;
}
:deep(.p-menu .p-menuitem-content) {
  background: transparent !important;
}
:deep(.p-menu .p-menuitem-link) {
  padding: 0.75rem 1rem;
  color: #94a3b8;
  border-radius: 8px;
  transition: all 0.2s;
}
:deep(.p-menu .p-menuitem-link:hover) {
  background: rgba(255,255,255,0.05) !important;
  color: #fff;
}
:deep(.p-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer !important;
}
</style>