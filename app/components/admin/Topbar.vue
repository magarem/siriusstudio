<script setup>
defineProps({
  siteContext: {
    type: String,
    default: 'Carregando...'
  },
  currentFolder: String,
  currentFile: String,
  loadingSave: Boolean,
  loadingPublish: Boolean, // <--- NOVA PROP
  showMetaSidebar: Boolean,
  isRawMode: Boolean
});



// Adicione 'publish' na lista de emits
const emit = defineEmits(['toggle-sidebar', 'toggle-meta', 'toggle-raw', 'save', 'publish', 'logout', 'open-media', 'go-dashboard']);
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-[#141b18] border-b border-white/5 h-14 px-4 flex justify-between items-center shadow-md relative overflow-hidden group">
      <div class="absolute -top-10 -left-10 w-32 h-32 bg-[#6f942e]/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex items-center gap-4 z-10 h-full">
         <div class="flex items-center gap-2 pr-4 border-r border-white/5 h-8">
          <Button icon="pi pi-bars" text @click="emit('toggle-sidebar')" class="!w-8 !h-8 !p-0 text-[#6f942e] hover:bg-[#6f942e]/10" v-tooltip.bottom="'Explorer'" />
          <Button v-if="!isRawMode" :icon="showMetaSidebar ? 'pi pi-sliders-h' : 'pi pi-sliders-v'" text @click="emit('toggle-meta')" :class="showMetaSidebar ? 'text-[#6f942e] bg-[#6f942e]/10' : 'text-slate-500 hover:text-white'" class="!w-8 !h-8 !p-0 transition-colors" v-tooltip.bottom="'Metadados'" />
          <div 
            class="flex flex-col select-none pl-2 justify-center cursor-pointer hover:opacity-80 transition-opacity"
            @click="emit('go-dashboard')"
            title="Ir para Dashboard"
          >
            <h1 class="text-sm font-black text-white leading-none tracking-tighter flex items-center gap-2">
              <i class="pi pi-star-fill text-[#6f942e] text-[10px]"></i> SIRIUS STUDIO
            </h1>
            <span class="text-[10px] uppercase tracking-widest text-[#6f942e] opacity-60 leading-none mt-1 pl-5">
              {{ siteContext }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2 select-none text-[14px]">
           <span class="uppercase tracking-widest text-[#6f942e] font-black opacity-60">{{ siteContext }}</span>
        </div>
      </div>

      <div class="flex gap-2 z-10">
        <Button 
          label="Media" 
          icon="pi pi-images" 
          size="small" 
          text
          class="!text-[10px] !font-bold tracking-widest text-slate-300 hover:text-white"
          @click="emit('open-media')" 
          v-tooltip.bottom="'Gerenciar Imagens'"
        />

        <div class="w-px h-6 bg-white/10 mx-1 self-center"></div>

        <Button 
          label="Publicar" 
          icon="pi pi-cloud-upload" 
          size="small" 
          :loading="loadingPublish"
          @click="emit('publish')" 
          class="bg-blue-600 border-none px-4 py-1 font-bold text-[10px] tracking-widest hover:bg-blue-700 text-white mr-2" 
          v-tooltip.bottom="'Rodar npm run build'"
        />

        <div class="w-px h-6 bg-white/10 mx-1 self-center"></div>

        <Button 
          :label="isRawMode ? 'Visual' : 'Fonte'" 
          :icon="isRawMode ? 'pi pi-eye' : 'pi pi-code'" 
          size="small" severity="secondary" text class="!text-[10px] !font-bold tracking-widest"
          @click="emit('toggle-raw')" 
        />
        
        <Button label="Salvar" icon="pi pi-save" size="small" :loading="loadingSave" @click="emit('save')" :disabled="!currentFile" class="bg-[#6f942e] border-none px-4 py-1 font-bold text-[10px] tracking-widest hover:bg-[#5a7a25]" />
        <Button icon="pi pi-sign-out" severity="danger" text size="small" class="!w-8 !h-8 !p-0" @click="emit('logout')" v-tooltip.bottom="'Sair'" />
      </div>
  </header>
</template>