<script setup>
import yaml from 'js-yaml';
import { useToast } from "primevue/usetoast";

// Componentes
import AdminSidebar from '~/components/admin/Sidebar.vue';
import AdminTopbar from '~/components/admin/Topbar.vue';
import AdminMetaEditor from '~/components/admin/MetaEditor.vue';
import AdminMarkdownEditor from '~/components/admin/MarkdownEditor.vue';

definePageMeta({ layout: '' });

const toast = useToast();
const route = useRoute();
const siteContext = useCookie('cms_site_context');

// Estados
const showSidebar = ref(false);
const showMetaSidebar = ref(true);
const currentFile = ref(route.query.file || '');
const currentFolder = ref(route.query.folder || 'content');
const loadingSave = ref(false);
const form = ref({ frontmatter: {}, content: '' });

// Modais
const showCreateModal = ref(false);
const showFolderModal = ref(false);
const showImageModal = ref(false);
const imageTarget = ref(null);
const newFileForm = ref({ name: '', type: 'default' });
const newFolderName = ref('');

// --- DATA FETCHING ---
const { data: files, refresh: refreshFiles } = await useFetch('/api/admin/storage', {
  query: { site: siteContext, folder: currentFolder },
  watch: [currentFolder]
});

const { data: fileData } = await useAsyncData('file-content', 
  () => currentFile.value ? $fetch('/api/admin/storage', { params: { site: siteContext.value, folder: currentFolder.value, file: currentFile.value } }) : null,
  { watch: [currentFile] }
);

const { data: schemaData } = await useFetch('/api/admin/schema', {
  query: { site: siteContext, folder: currentFolder, filename: computed(() => currentFile.value ? currentFile.value.split('/').pop() : '') },
  watch: [currentFolder, currentFile]
});

// --- COMPUTEDS ---
const currentModel = computed(() => {
  if (!schemaData.value) return { fields: [] };
  const fmSchema = form.value.frontmatter?.schema;
  const filename = currentFile.value.split('/').pop();
  const mapSchema = schemaData.value.mapping?.[filename];
  
  const typeKey = fmSchema || mapSchema || 'default';
  return schemaData.value.types?.[typeKey] || { fields: [] };
});

const availableTypes = computed(() => {
  if (!schemaData.value?.types) return [{ key: 'default', label: 'Padrão', icon: 'pi-file' }];
  return Object.entries(schemaData.value.types).map(([key, val]) => ({
    key,
    label: val.label || key,
    icon: val.icon || 'pi-file',
    description: val.description || ''
  }));
});

// --- WATCHERS (Data Parsing & Repair) ---
const parseMD = (full) => {
  try {
    const parts = full.split('---');
    if (parts.length >= 3) {
      form.value.frontmatter = yaml.load(parts[1]) || {};
      form.value.content = parts.slice(2).join('---').trim();
    } else {
      form.value.frontmatter = {};
      form.value.content = full;
    }
  } catch (e) { console.error(e); }
};

watch(fileData, (newData) => { if (newData?.content) parseMD(newData.content); }, { immediate: true });

// --- WATCHER DE CORREÇÃO (CORRIGIDO FINAL) ---
// Removemos qualquer referência a 'collapsedFields' aqui.
// A responsabilidade visual agora é do componente filho (MetaEditor).

// --- WATCHER INTELIGENTE (Carrega e Converte Dados) ---
watch(currentModel, (newModel) => {
  if (!newModel?.fields || !form.value.frontmatter) return;
  const fm = form.value.frontmatter;

  newModel.fields.forEach(field => {
    const data = fm[field.key];
    if (!Array.isArray(data)) return;

    // TRATAMENTO: Simple List (Converte ["Texto"] -> [{text: "Texto", _uuid: ...}])
    if (field.type === 'simple_list') {
      // Se detectarmos strings simples, convertemos para objetos para a edição fluir
      if (data.length > 0 && typeof data[0] !== 'object') {
        fm[field.key] = data.map(str => ({ text: str, _uuid: crypto.randomUUID() }));
      }
      // Se for array vazio ou já for objeto mas sem UUID
      else {
        data.forEach(item => {
           if (typeof item === 'object' && !item._uuid) item._uuid = crypto.randomUUID();
        });
      }
    }

    // TRATAMENTO: Repeater (Adiciona UUID se faltar)
    if (field.type === 'repeater') {
      data.forEach(item => { 
        if (item && typeof item === 'object' && !item._uuid) item._uuid = crypto.randomUUID(); 
      });
    }
  });
}, { immediate: true, deep: true });




// --- AÇÕES ---
const navigate = {
  enterFolder: (f) => currentFolder.value = `${currentFolder.value}/${f}`,
  goBack: () => {
    const parts = currentFolder.value.split('/');
    if (parts.length > 1) { parts.pop(); currentFolder.value = parts.join('/'); }
  },
  selectFile: (f) => {
    currentFile.value = f;
    window.history.pushState({}, '', `?file=${f}&folder=${currentFolder.value}`);
    showSidebar.value = false;
  },
  changeRoot: (r) => currentFolder.value = r
};

const createActions = {
  openFile: () => { newFileForm.value = { name: '', type: 'default' }; showCreateModal.value = true; },
  openFolder: () => { newFolderName.value = ''; showFolderModal.value = true; },
  handleFile: async () => {
    let name = newFileForm.value.name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name.endsWith('.md')) name += '.md';
    const content = `---\n${yaml.dump({ schema: newFileForm.value.type, title: newFileForm.value.name, date: new Date().toISOString().split('T')[0] })}---\n\n# ${newFileForm.value.name}`;
    await $fetch('/api/admin/storage', { method: 'POST', body: { site: siteContext.value, folder: currentFolder.value, file: name, content } });
    showCreateModal.value = false; await refreshFiles(); navigate.selectFile(name);
  },
  handleFolder: async () => {
    await $fetch('/api/admin/storage/mkdir', { method: 'POST', body: { site: siteContext.value, folder: currentFolder.value, name: newFolderName.value } });
    showFolderModal.value = false; await refreshFiles();
  }
};

const imageActions = {
  open: (target) => {
    if (!target) imageTarget.value = { mode: 'markdown' };
    else if (Array.isArray(target.list)) imageTarget.value = { mode: 'push', list: target.list };
    else imageTarget.value = { mode: 'set', obj: target.obj, key: target.key };
    showImageModal.value = true;
  },
  handleSelect: (url) => {
    const t = imageTarget.value;
    if (t.mode === 'markdown') form.value.content += `\n![](${url})`;
    else if (t.mode === 'set') t.obj[t.key] = url;
    else if (t.mode === 'push') t.list.push(url);
    showImageModal.value = false;
  }
};

// --- SALVAR INTELIGENTE (Limpa os dados antes de gravar) ---
const saveFile = async () => {
  if (!currentFile.value) return;
  loadingSave.value = true;

  // Clona os dados para limpar sem afetar a tela
  const cleanData = JSON.parse(JSON.stringify(form.value.frontmatter));
  
  // Percorre os campos para limpar a "sujeira" (UUIDs e Wrappers)
  const modelFields = currentModel.value.fields || [];
  
  modelFields.forEach(field => {
    const data = cleanData[field.key];
    if (!Array.isArray(data)) return;

    // LIMPEZA: Simple List (Volta de [{text: "..."}] para ["..."])
    if (field.type === 'simple_list') {
       cleanData[field.key] = data.map(item => item.text || ''); 
    }
    
    // LIMPEZA: Repeater (Remove apenas o _uuid, mantém as outras chaves)
    if (field.type === 'repeater') {
       cleanData[field.key] = data.map(item => {
         const { _uuid, ...rest } = item;
         return rest;
       });
    }
  });
  
  try {
    const content = `---\n${yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true })}---\n\n${form.value.content}`;
    await $fetch('/api/admin/storage', { 
      method: 'POST', 
      body: { site: siteContext.value, folder: currentFolder.value, file: currentFile.value, content } 
    });
    toast.add({ severity: 'success', summary: 'Salvo', detail: 'Alterações salvas.', life: 2000 });
  } catch (e) { 
    toast.add({ severity: 'error', summary: 'Erro ao salvar' }); 
    console.error(e);
  } finally { 
    loadingSave.value = false; 
  }
};

const logout = () => { siteContext.value = null; navigateTo('/login'); };

// --- ATALHOS DE TECLADO (CTRL+S / CMD+S) ---
const handleKeydown = (e) => {
  // Verifica se CTRL ou CMD (Mac) está pressionado E se a tecla é 's' ou 'S'
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault(); // Impede o "Salvar Página" do navegador
    if (currentFile.value) {
      saveFile();
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

</script>

<template>
  <div class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30 flex flex-col">
    <Toast />

    <AdminSidebar 
      v-model:visible="showSidebar"
      :files="files"
      :current-folder="currentFolder"
      :current-file="currentFile"
      @navigate="navigate.enterFolder"
      @select="navigate.selectFile"
      @back="navigate.goBack"
      @change-root="navigate.changeRoot"
      @create-file="createActions.openFile"
      @create-folder="createActions.openFolder"
    />

    <AdminTopbar 
      :site-context="siteContext"
      :current-folder="currentFolder"
      :current-file="currentFile"
      :loading-save="loadingSave"
      :show-meta-sidebar="showMetaSidebar"
      @toggle-sidebar="showSidebar = true"
      @toggle-meta="showMetaSidebar = !showMetaSidebar"
      @save="saveFile"
      @logout="logout"
    />

    <div class="flex-1 p-4 md:p-6 max-w-[1700px] mx-auto w-full">
      <div v-if="currentFile" class="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-120px)] transition-all duration-300">
        
        <aside v-show="showMetaSidebar" class="lg:col-span-4 overflow-y-auto pr-2 custom-scrollbar">
          <AdminMetaEditor 
            :fields="currentModel.fields"
            :frontmatter="form.frontmatter"
            :site-context="siteContext"
            @open-image="imageActions.open"
          />
        </aside>

        <div :class="showMetaSidebar ? 'lg:col-span-8' : 'lg:col-span-12'" class="transition-all duration-300">
          <AdminMarkdownEditor 
            v-model:content="form.content"
            :current-folder="currentFolder"
            :current-file="currentFile"
            @open-image="imageActions.open()"
          />
        </div>

      </div>

      <div v-else class="h-[75vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 text-center select-none">
         <div class="w-24 h-24 bg-[#6f942e]/10 rounded-full flex items-center justify-center mb-6"><i class="pi pi-star text-[#6f942e] text-3xl animate-pulse"></i></div>
         <h2 class="font-black text-2xl tracking-tighter text-white uppercase">Sirius Studio</h2>
         <p class="font-mono text-[10px] mt-2 uppercase tracking-[0.4em]">Selecione um arquivo para editar</p>
      </div>
    </div>

    <Dialog v-model:visible="showCreateModal" modal header="NOVO ARQUIVO" :style="{ width: '400px' }" class="bg-[#141b18]">
      <div class="flex flex-col gap-6 pt-4">
        <div class="flex flex-col gap-2">
          <label class="text-[10px] uppercase font-black text-[#6f942e]">Nome</label>
          <InputText v-model="newFileForm.name" class="bg-[#0a0f0d] border border-white/10 text-white" />
        </div>
        <div class="flex flex-col gap-2">
           <label class="text-[10px] uppercase font-black text-[#6f942e]">Tipo</label>
           <div class="max-h-40 overflow-y-auto custom-scrollbar">
              <div v-for="t in availableTypes" :key="t.key" @click="newFileForm.type = t.key" :class="['p-2 mb-1 rounded border cursor-pointer text-xs', newFileForm.type === t.key ? 'border-[#6f942e] bg-[#6f942e]/10' : 'border-white/10']">{{ t.label }}</div>
           </div>
        </div>
        <Button label="CRIAR" class="bg-[#6f942e] border-none text-black font-black w-full" @click="createActions.handleFile" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showFolderModal" modal header="NOVA PASTA" :style="{ width: '350px' }" class="bg-[#141b18]">
      <div class="flex flex-col gap-6 pt-4">
        <InputText v-model="newFolderName" placeholder="Nome da pasta" class="bg-[#0a0f0d] border border-white/10 text-white w-full" />
        <Button label="CRIAR" class="bg-[#6f942e] border-none text-black font-black w-full" @click="createActions.handleFolder" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showImageModal" modal header="MEDIA" :style="{ width: '85vw' }" class="bg-[#141b18]">
      <ImageExplorer @select="imageActions.handleSelect" />
    </Dialog>
  </div>
</template>

<style>
/* Estilos globais */
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(111, 148, 46, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(111, 148, 46, 0.5); }
.ghost-image { opacity: 0.4; border: 2px dashed #6f942e !important; transform: scale(0.98); }
</style>