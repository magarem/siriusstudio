<template>
  <div class="image-explorer-component flex flex-col gap-6">
    <Toast />
    
    <section class="flex flex-wrap items-center justify-between gap-4 bg-[#141b18] p-4 rounded-2xl border border-white/5">
      <div class="flex items-center gap-3 overflow-hidden">
        <Button v-if="folder !== 'images'" icon="pi pi-arrow-left" text rounded @click="goBack" class="text-[#6f942e] shrink-0" />
        
        <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          <i class="pi pi-home text-slate-500 hover:text-white cursor-pointer transition-colors" @click="navigateTo('images')"></i>
          <span class="text-slate-600 font-bold">/</span>
          <div v-for="(crumb, index) in breadcrumbs" :key="crumb.path" class="flex items-center gap-2 whitespace-nowrap">
            <span class="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-[#6f942e] transition-colors"
                  :class="index === breadcrumbs.length - 1 ? 'text-white' : 'text-slate-500'"
                  @click="navigateTo(crumb.path)">
              {{ crumb.name }}
            </span>
            <span v-if="index < breadcrumbs.length - 1" class="text-slate-600 font-bold">/</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button icon="pi pi-folder-plus" label="Nova Pasta" @click="confirmCreateFolder" class="p-button-text text-sm font-bold text-[#6f942e]" />
        
        <FileUpload 
          mode="basic" 
          name="demo[]" 
          :url="uploadUrl" 
          :key="folder"
          accept="image/*" 
          :auto="true" 
          @upload="onUpload" 
          chooseLabel="Subir Imagem" 
          class="p-button-sm bg-[#6f942e] border-none font-bold" 
        />
      </div>
    </section>

    <section class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 h-[60vh] overflow-y-auto custom-scrollbar pr-2 content-start">
      
      <div v-for="file in files" :key="file.name" 
           class="bg-[#1a1d1c] p-3 rounded-2xl border border-white/5 _hover:border-[#6f942e] transition-all group relative overflow-hidden h-40"
           :class="{ 'cursor-pointer': file.isDirectory }"
           @click="file.isDirectory ? enterFolder(file.name) : null"
      >
        <div class="w-full h-full overflow-hidden rounded-xl bg-[#0a0c0b] flex items-center justify-center relative">
          <div v-if="file.isDirectory" class="flex flex-col items-center justify-center w-full h-full _hover:bg-white/5 transition-colors">
            <i class="pi pi-folder text-5xl text-amber-500 mb-2"></i>
            <span class="text-[12px] text-amber-500/50 font-bold uppercase tracking-widest">{{ file.name }}</span>
          </div>
          
          <img v-else
            :src="getImageUrl(file.name)" 
            class="w-full h-full object-cover _group-hover:scale-110 transition-transform duration-500"
            @error="(e) => e.target.src = 'https://placehold.co/200?text=Erro'"
          />
        </div>
        
        <div class="absolute inset-0 bg-[#0f1110]/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 gap-3">
          <!-- <span class="text-[9px] font-black text-white px-2 text-center _uppercase tracking-tighter truncate w-full pointer-events-none">
             {{ file.name }}
           </span> -->
            <div class="flex gap-2 pt-20">
            
              <Button v-if="!file.isDirectory" icon="pi pi-check" severity="success" rounded @click.stop="selectImage(file.name)" title="Inserir no MD" />
              <Button v-if="!file.isDirectory" icon="pi pi-copy" severity="info" rounded @click.stop="copyImageUrl(file.name)" />
              <Button icon="pi pi-trash" severity="danger" rounded text @click.stop="deleteItem(file.name, file.isDirectory)" />
           </div>
           
        </div>
      </div>

      <div v-if="files && files.length === 0" class="col-span-full h-full flex flex-col items-center justify-center opacity-50">
        <i class="pi pi-folder-open text-4xl mb-2 text-slate-600"></i>
        <p class="text-xs uppercase tracking-widest text-slate-500">Pasta Vazia</p>
      </div>

    </section>
  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";
const toast = useToast();
const emit = defineEmits(['select']);

const siteContext = useCookie('cms_site_context');
const folder = ref('images'); 

const breadcrumbs = computed(() => {
  const cleanPath = folder.value.replace(/^\/|\/$/g, '');
  if (!cleanPath) return [];
  const parts = cleanPath.split('/');
  let currentAccumulator = '';
  return parts.map(part => {
    currentAccumulator = currentAccumulator ? `${currentAccumulator}/${part}` : part;
    return { name: part, path: currentAccumulator };
  });
});

// No script setup
const uploadUrl = computed(() => {
  // Garante que 'images/minha pasta' vire 'images%2Fminha%20pasta'
  return `/api/admin/upload?site=${siteContext.value}&folder=${encodeURIComponent(folder.value)}`;
});

const { data: files, refresh } = await useFetch('/api/admin/storage', {
  query: { site: siteContext.value, folder: folder }
});

const enterFolder = (name) => {
  // Garante que não fique "images//subpasta"
  folder.value = folder.value.endsWith('/') 
    ? `${folder.value}${name}` 
    : `${folder.value}/${name}`;
};

const navigateTo = (path) => { folder.value = path; };

const goBack = () => {
  const parts = folder.value.split('/');
  if (parts.length > 1) {
    parts.pop();
    folder.value = parts.join('/');
  }
};

const selectImage = (name) => {
  const relativePath = `/${folder.value}/${name}`; 
  emit('select', relativePath);
  toast.add({ severity: 'success', summary: 'Selecionado', life: 1000 });
};

const confirmCreateFolder = async () => {
  const name = prompt("Nome da nova pasta:");
  if (!name) return;
  const safeName = name.trim().replace(/\s+/g, '-').toLowerCase();

  try {
    await $fetch('/api/admin/mkdir', {
      method: 'POST',
      body: { site: siteContext.value, folder: folder.value, name: safeName }
    });
    refresh();
    toast.add({ severity: 'success', summary: 'Pasta criada', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro ao criar pasta', life: 3000 });
  }
};

const onUpload = () => {
  refresh();
  toast.add({ severity: 'success', summary: 'Upload concluído!', life: 2000 });
};

const getImageUrl = (fileName) => 
  `/api/admin/render-image?site=${siteContext.value}&file=${fileName}&folder=${folder.value}`;

const copyImageUrl = (name) => {
  const url = `/${folder.value}/${name}`; 
  navigator.clipboard.writeText(url).then(() => {
    toast.add({ severity: 'info', summary: 'Copiado!', life: 1500 });
  });
};

const deleteItem = async (fileName, isDir) => {
  if (!confirm(`Apagar ${isDir ? 'pasta' : 'arquivo'} ${fileName}?`)) return;
  try {
    await $fetch('/api/admin/storage', { 
      method: 'DELETE', 
      body: { site: siteContext.value, folder: folder.value, file: fileName } 
    });
    refresh();
    toast.add({ severity: 'warn', summary: 'Item excluído', life: 2000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erro ao excluir', life: 2000 });
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(111, 148, 46, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(111, 148, 46, 0.5); }

:deep(.p-fileupload-choose) {
  background: #6f942e !important;
  border-radius: 8px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>