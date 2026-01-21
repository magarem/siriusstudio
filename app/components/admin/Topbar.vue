<script setup>
import { ref, computed } from 'vue';

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

const emit = defineEmits([
  'toggle-sidebar', 'toggle-meta', 'toggle-raw', 
  'save', 'publish', 'logout', 'open-media', 'go-dashboard'
]);

// --- 1. MENU DE USUÁRIO (Mantido) ---
const menu = ref();
const userMenuItems = ref([
  // {
  //   label: 'Meu Perfil',
  //   icon: 'pi pi-user',
  //   command: () => { console.log('Ir para perfil') }
  // },
  // {
  //   label: 'Sistema',
  //   icon: 'pi pi-cog',
  //   command: () => { console.log('Configurações') }
  // },
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

// ... dentro de <script setup>

const previewLink = computed(() => {
  let url = props.siteUrl || '';
  
  // 1. Normaliza a URL base do site
  if (url && !url.startsWith('http') && !url.includes('localhost')) {
    url = `https://${url}`;
  }
  if (url.endsWith('/')) url = url.slice(0, -1);
  
  if (!url) return '#'; 
  if (!props.currentFile) return url; // Se não tiver arquivo, vai pra home

  // 2. MONTAGEM DO CAMINHO COMPLETO
  // Se currentFile já tiver barras (ex: via busca), usa ele. 
  // Se não, junta com a pasta atual.
  let fullPath = props.currentFile.includes('/') 
      ? props.currentFile 
      : `${props.currentFolder}/${props.currentFile}`;

  // 3. LIMPEZA (Lógica de Roteamento do Nuxt Content)
  
  // Remove pastas de sistema 'content/' ou 'pages/' do início, pois elas não vão na URL final
  if (fullPath.startsWith('content/')) fullPath = fullPath.replace('content/', '');
  if (fullPath.startsWith('pages/')) fullPath = fullPath.replace('pages/', '');

  // Remove a extensão do arquivo (.md, .vue, etc)
  fullPath = fullPath.replace(/\.[^/.]+$/, "");

  // Tratamento de Index (Home da pasta)
  // Ex: /blog/_index -> /blog/
  if (fullPath.endsWith('/_index') || fullPath === '_index') {
      fullPath = fullPath.replace('_index', '');
  }
  if (fullPath.endsWith('/index') || fullPath === 'index') {
      fullPath = fullPath.replace('index', '');
  }

  // Garante barra inicial
  if (!fullPath.startsWith('/')) fullPath = '/' + fullPath;

  // Remove barra final duplicada se sobrar (exceto se for raiz)
  if (fullPath !== '/' && fullPath.endsWith('/')) {
      fullPath = fullPath.slice(0, -1);
  }

  // Retorna URL completa
  return `${url}${fullPath}?preview=true`;
});
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-[#141b18] border-b border-white/5 h-16 px-6 flex justify-between items-center shadow-md relative overflow-hidden">
      <div class="absolute -top-10 -left-10 w-32 h-32 bg-[#6f942e]/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex items-center gap-4 z-10 h-full">
         <div class="flex items-center gap-2 pr-4 border-r border-white/5 h-8">
          <Button icon="pi pi-bars" text @click="emit('toggle-sidebar')" class="!w-8 !h-8 !p-0 text-[#6f942e] hover:bg-[#6f942e]/10" v-tooltip.bottom="'Explorer'" />
          <div 
            class="flex items-center gap-3 select-none pl-2 cursor-pointer hover:opacity-80 transition-opacity"
            @click="emit('go-dashboard')"
            title="Voltar ao Dashboard"
          >
            <h1 class="text-sm font-black text-white leading-none tracking-tighter flex items-center gap-2">
              <i class="pi pi-star-fill text-[#6f942e] text-[10px]"></i> SIRIUS STUDIO
            </h1>
            <div class="h-3 w-px bg-white/20"></div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-[#6f942e] leading-none pt-0.5">
              {{ siteContext }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 z-10">

        <Button 
          text 
          @click="emit('open-media')" 
          v-tooltip.bottom="'Galeria de Mídia'"
          class="text-slate-400 hover:text-white hover:bg-white/5 !px-3"
        >
          <i class="pi pi-images"></i>
          <span class="hidden lg:inline ml-2 font-medium text-xs uppercase tracking-wide">Mídia</span>
        </Button>

      <Button 
          :loading="loadingSave" 
          @click="emit('save')" 
          :disabled="!currentFile" 
          class="bg-[#6f942e] border-none text-black hover:bg-[#5a7a25] transition-all !px-4" 
      >
          <i class="pi pi-save" v-if="!loadingSave"></i>
          <span class="hidden lg:inline ml-2 font-bold text-xs tracking-widest">SALVAR</span>
      </Button>

      <Button 
          outlined 
          @click="emit('preview')"
          :disabled="!currentFile && !siteUrl"
          class="!border-white/20 !text-slate-200 hover:!bg-white/5 hover:!text-white hover:!border-[#6f942e] transition-colors !px-3"
          v-tooltip.bottom="'Live Preview'"
      >
          <i class="pi pi-external-link"></i>
          <span class="hidden lg:inline ml-2 font-bold text-xs tracking-widest">PREVIEW</span>
      </Button>

      <Button 
        outlined 
        :loading="loadingPublish"
        @click="emit('publish')" 
        class="!border-white/20 !text-slate-200 hover:!bg-purple-500/10 hover:!text-purple-300 hover:!border-purple-500/50 transition-colors !px-3" 
        v-tooltip.bottom="'Atualizar Site Público'"
      >
          <i class="pi pi-cloud-upload" v-if="!loadingPublish"></i>
          <span class="hidden lg:inline ml-2 font-bold text-xs tracking-widest">PUBLICAR</span>
      </Button>

        <div class="w-px h-6 bg-white/10 mx-2"></div>

        <div class="relative">
          <Button 
            type="button" 
            @click="toggleUserMenu" 
            class="!p-1 !w-auto !h-auto !bg-transparent !border-none hover:!bg-white/5 rounded-full flex gap-2 items-center transition-colors"
          >
            <Avatar icon="pi pi-user" shape="circle" class="!bg-indigo-500/20 !text-indigo-400 border border-indigo-500/30" />
            <i class="pi pi-angle-down text-slate-500 text-xs mr-1"></i>
          </Button>
          
          <Menu ref="menu" :model="userMenuItems" :popup="true" class="!bg-[#1a211e] !border-white/10 !min-w-[180px]" />
        </div>

      </div>
  </header>
</template>

<style scoped>
:deep(.p-menu) {
  padding: 0.5rem;
  border-radius: 12px;
  background: #1a211e;
  border: 1px solid rgba(255,255,255,0.1);
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
:deep(.p-menu .p-menuitem-icon) {
  color: inherit;
  font-size: 0.9rem;
}
:deep(.p-menu .p-menuitem-text) {
  color: inherit;
  font-weight: 500;
  font-size: 0.85rem;
}
:deep(.p-menu .p-menuitem-separator) {
  border-top: 1px solid rgba(255,255,255,0.05);
  margin: 0.5rem 0;
}
:deep(.p-button) {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>