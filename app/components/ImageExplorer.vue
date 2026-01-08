<template>
  <div class="image-explorer-component">
    <Toast />
    
    <section class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="file in files" :key="file.name" 
           class="bg-slate-800 p-2 rounded-lg border border-slate-700 hover:border-[#6f942e] transition-all group relative overflow-hidden">
        
        <div class="aspect-square overflow-hidden rounded bg-slate-950 flex items-center justify-center">
          <img 
            :src="getImageUrl(file.name)" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform"
            @error="(e) => e.target.src = 'https://placehold.co/200?text=Erro'"
          />
        </div>
        
        <div class="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
           <Button icon="pi pi-copy" severity="info" rounded @click="copyImageUrl(file.name)" title="Copiar Caminho" />
           
           <Button icon="pi pi-check" severity="success" rounded @click="selectImage(file.name)" title="Selecionar" />
           <Button icon="pi pi-trash" severity="danger" rounded text @click="deleteItem(file.name)" />
        </div>
        
        <div class="mt-2 text-[9px] font-mono truncate text-slate-500 text-center">{{ file.name }}</div>
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

// Busca as imagens
const { data: files, refresh } = await useFetch('/api/admin/storage', {
  query: { site: siteContext, folder: folder }
});
const copyImageUrl = (name) => {
  // O caminho público da imagem
  const url = `/images/${name}`; 
  
  // Comando de cópia para o clipboard
  navigator.clipboard.writeText(url).then(() => {
    // Usamos o toast para avisar que deu certo
    toast.add({ 
      severity: 'info', 
      summary: 'Copiado', 
      detail: 'Caminho da imagem copiado com sucesso!', 
      life: 2000 
    });
  });
};
const getImageUrl = (fileName) => `/api/admin/render-image?site=${siteContext.value}&file=${fileName}&folder=${folder.value}`;

const selectImage = (name) => {
  const url = `/images/${name}`;
  emit('select', url);
  toast.add({ severity: 'info', summary: 'Selecionada', detail: url, life: 2000 });
};

const deleteItem = async (fileName) => {
  if (!confirm(`Apagar ${fileName}?`)) return;
  await $fetch('/api/admin/storage', { method: 'DELETE', body: { site: siteContext.value, folder: folder.value, file: fileName } });
  refresh();
};

const onUpload = () => { refresh(); toast.add({ severity: 'success', summary: 'Upload OK', life: 2000 }); };
</script>