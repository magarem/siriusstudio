<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
    <Toast />
    <div class="max-w-6xl mx-auto">
      
      <header class="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 class="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <i class="pi pi-server text-indigo-500"></i>
            Sirius Studio
          </h1>
          <p class="text-slate-400 mt-1 flex items-center gap-2">
            <span class="bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
              {{ siteContext }}
            </span>
            <span class="text-sm">Gerenciando Ativos</span>
          </p>
        </div>
        
        <div class="flex items-end gap-4">
          <div v-if="selectedFolder !== 'images'" class="flex flex-col gap-2">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Novo Arquivo</label>
            <div class="flex gap-2">
              <InputText v-model="newFileName" placeholder="nome.md" class="w-48 p-inputtext-sm" @keyup.enter="createFile" />
              <Button icon="pi pi-plus" severity="primary" @click="createFile" :loading="creating" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pasta / Subpasta</label>
            <Select 
              v-model="selectedFolder" 
              :options="folders" 
              filter
              class="w-64" 
              placeholder="Selecione a pasta"
            />
          </div>

          <Button icon="pi pi-sign-out" severity="danger" text @click="logout" title="Sair" />
        </div>
      </header>

      <main>
        <div v-if="selectedFolder.includes('images')">
          
          <section class="mb-10">
            <FileUpload 
              name="images[]" 
              url="/api/admin/upload" 
              :multiple="true" 
              accept="image/*" 
              :maxFileSize="5000000"
              @upload="onUpload" 
              @error="onUploadError"
              :auto="true"
              class="custom-upload"
            >
              <template #empty>
                <div class="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/30 hover:bg-slate-800/60 transition-all cursor-pointer group">
                  <div class="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i class="pi pi-cloud-upload text-3xl text-indigo-500"></i>
                  </div>
                  <p class="text-slate-300 font-medium">Arraste as imagens para aqui</p>
                  <p class="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">PNG, JPG ou WEBP até 5MB</p>
                </div>
              </template>
            </FileUpload>
          </section>

          <section class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div v-for="file in files" :key="file.name" 
                 class="bg-slate-800 p-2 rounded-xl border border-slate-700 hover:border-indigo-500 transition-all group relative shadow-lg overflow-hidden">
              
              <div class="aspect-square overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center">
                <img 
                  :src="getImageUrl(file.name)" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  @error="(e) => e.target.src = 'https://placehold.co/200?text=Erro+Preview'"
                />
              </div>
              
              <div class="mt-2 text-[10px] font-mono truncate text-slate-400 px-1 text-center font-bold">
                {{ file.name }}
              </div>
              
              <div class="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 gap-2">
                 <Button icon="pi pi-copy" class="p-button-rounded p-button-info p-button-text bg-slate-800" @click="copyImageUrl(file.name)" />
                 <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text bg-slate-800" @click="deleteItem(file.name)" />
              </div>
            </div>
          </section>
        </div>

        <div v-else class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
         <DataTable :value="files" :loading="pending" class="p-datatable-sm" stripedRows>
  <template #empty>
     <div class="text-center py-20 text-slate-500">
       <i class="pi pi-folder-open text-4xl mb-4 block opacity-10"></i>
       Nenhum item em <span class="text-indigo-400">{{ selectedFolder }}</span>.
     </div>
  </template>

  <template #header v-if="selectedFolder.includes('/')">
    <Button 
      icon="pi pi-arrow-left" 
      label="Voltar" 
      class="p-button-text p-button-sm text-slate-400" 
      @click="goBack" 
    />
  </template>

  <Column field="name" header="Nome">
    <template #body="slotProps">
      <div 
        class="flex items-center gap-3 font-mono cursor-pointer hover:text-white transition-colors"
        @click="slotProps.data.isDirectory ? enterFolder(slotProps.data.name) : goToEdit(slotProps.data.name)"
      >
        <i :class="slotProps.data.isDirectory ? 'pi pi-folder text-yellow-500' : getFileIcon(slotProps.data.name)"></i>
        
        <span :class="{'text-indigo-200': !slotProps.data.isDirectory, 'text-yellow-200 font-bold': slotProps.data.isDirectory}">
          {{ slotProps.data.name }}{{ slotProps.data.isDirectory ? '/' : '' }}
        </span>
      </div>
    </template>
  </Column>

  <Column header="Ações" class="w-48 text-right px-6">
    <template #body="slotProps">
      <div class="flex gap-2 justify-end">
        <Button 
          v-if="!slotProps.data.isDirectory"
          icon="pi pi-pencil" 
          class="p-button-text p-button-sm" 
          @click="goToEdit(slotProps.data.name)" 
        />
        <Button 
          icon="pi pi-trash" 
          class="p-button-text p-button-danger p-button-sm" 
          @click="deleteItem(slotProps.data.name)" 
        />
      </div>
    </template>
  </Column>
</DataTable>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";
definePageMeta({ layout: '' })

const toast = useToast();
const siteContext = useCookie('cms_site_context');
const selectedFolder = ref('content');
const newFileName = ref('');
const creating = ref(false);

if (!siteContext.value) { navigateTo('/login'); }

// 1. BUSCA DE PASTAS AUTOMÁTICA
const { data: availableFolders } = await useFetch('/api/admin/folders', {
  query: { site: siteContext },
  watch: [siteContext]
});

const folders = computed(() => {
  const defaults = ['content', 'images', 'pages', 'layouts', 'components'];
  return availableFolders.value?.length > 0 ? availableFolders.value : defaults;
});

// Função para entrar em uma subpasta
const enterFolder = (folderName) => {
  // Atualiza o selectedFolder (ex: 'content' vira 'content/pousadas')
  selectedFolder.value = `${selectedFolder.value}/${folderName}`;
};

// Função para voltar um nível
const goBack = () => {
  const parts = selectedFolder.value.split('/');
  if (parts.length > 1) {
    parts.pop(); // Remove o último nível
    selectedFolder.value = parts.join('/');
  }
};



// 2. BUSCA DE ARQUIVOS (Reativo ao trocar a pasta)
const { data: files, pending, refresh } = await useFetch('/api/admin/storage', {
  query: { site: siteContext, folder: selectedFolder },
  watch: [selectedFolder]
});

// 3. CRIAR ARQUIVO
const createFile = async () => {
  if (!newFileName.value) return;
  creating.value = true;
  try {
    await $fetch('/api/admin/storage', {
      method: 'POST',
      body: {
        site: siteContext.value,
        folder: selectedFolder.value,
        file: newFileName.value,
        content: '---\ntitle: Novo\n---\n' 
      }
    });
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Arquivo criado!', life: 3000 });
    newFileName.value = '';
    refresh();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar arquivo', life: 5000 });
  } finally {
    creating.value = false;
  }
};

// 4. DELETAR ITEM (Imagem ou Arquivo)
const deleteItem = async (fileName) => {
  if (!confirm(`Deseja realmente apagar ${fileName}?`)) return;
  try {
    await $fetch('/api/admin/storage', {
      method: 'DELETE',
      body: {
        site: siteContext.value,
        folder: selectedFolder.value,
        file: fileName
      }
    });
    toast.add({ severity: 'warn', summary: 'Apagado', detail: 'O arquivo foi removido.', life: 3000 });
    refresh();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível apagar.', life: 5000 });
  }
};

const getImageUrl = (fileName) => {
  return `/api/admin/render-image?site=${siteContext.value}&file=${fileName}&folder=${selectedFolder.value}`;
};

const goToEdit = (fileName) => {
  navigateTo({
    path: '/edit',
    query: { 
      site: siteContext.value, 
      folder: selectedFolder.value, // <--- Isso garante que mandamos 'content/pousadas'
      file: fileName 
    }
  });
};

const logout = () => {
  siteContext.value = null;
  navigateTo('/login');
};

// Ajuste na função de ícones para incluir pastas se necessário
const getFileIcon = (name) => {
  if (name.endsWith('.md')) return 'pi pi-file-edit text-indigo-400';
  if (name.endsWith('.vue')) return 'pi pi-code text-blue-400';
  if (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.webp')) return 'pi pi-image text-emerald-400';
  return 'pi pi-file text-slate-500';
};

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

const onUpload = () => {
  toast.add({ severity: 'success', summary: 'Upload OK', detail: 'Imagens salvas!', life: 3000 });
  refresh(); 
};

const onUploadError = () => {
  toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha no upload.', life: 5000 });
};

// No script setup do index.vue
watch(siteContext, () => {
  refreshFolders(); // Força a API de pastas a procurar novamente
});

</script>

<style scoped>
:deep(.p-fileupload) { border: none; background: transparent; }
:deep(.p-fileupload-buttonbar) { background: transparent; border: none; padding: 0 0 1rem 0; }
:deep(.p-fileupload-content) { background: transparent; border: none; padding: 0; }
:deep(.p-progressbar) { height: 4px; background: #1e293b; }
:deep(.p-progressbar-value) { background: #6366f1; }
</style>