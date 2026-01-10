<script setup>
import yaml from 'js-yaml';
import draggable from 'vuedraggable';
import { useToast } from "primevue/usetoast";

// --- 1. CONFIGURAÇÃO GERAL ---
definePageMeta({ layout: '' });
const toast = useToast();
const route = useRoute();
const siteContext = useCookie('cms_site_context');

// --- 2. ESTADOS DO SISTEMA ---
const showSidebar = ref(false); // Sidebar de Navegação
const showMetaSidebar = ref(true); // Sidebar de Metadados
const currentFile = ref(route.query.file || '');
const currentFolder = ref(route.query.folder || 'content');

const loadingSave = ref(false);
const showImageModal = ref(false);
const form = ref({ frontmatter: {}, content: '' });

// Controle de inserção de imagens: { mode: 'set'|'push'|'markdown', obj, key, list }
const imageTarget = ref(null); 

// Controle visual (Sanfona dos campos)
const collapsedFields = ref({});

// --- ESTADOS PARA MODAIS ---
const showCreateModal = ref(false);
const showFolderModal = ref(false);

const newFileForm = ref({ name: '', type: 'default' });
const newFolderName = ref('');

// --- 3. FETCH DE DADOS ---

// Lista de Arquivos
const { data: files, refresh: refreshFiles } = await useFetch('/api/admin/storage', {
  query: { site: siteContext, folder: currentFolder },
  watch: [currentFolder]
});

// Conteúdo do Arquivo
const { data: fileData } = await useAsyncData(
  'file-content',
  () => {
    if (!currentFile.value) return null;
    return $fetch('/api/admin/storage', {
      params: { site: siteContext.value, folder: currentFolder.value, file: currentFile.value }
    });
  },
  { watch: [currentFile] }
);

// Schema da Pasta
const { data: schemaData } = await useFetch('/api/admin/schema', {
  query: { 
    site: siteContext, 
    folder: currentFolder, 
    filename: computed(() => currentFile.value ? currentFile.value.split('/').pop() : '') 
  },
  watch: [currentFolder, currentFile]
});

// --- 4. COMPUTED: RESOLUÇÃO DO MODELO ---
const currentModel = computed(() => {
  if (!schemaData.value) return { fields: [] };
  
  const fmSchema = form.value.frontmatter?.schema;
  if (fmSchema && schemaData.value.types?.[fmSchema]) {
    return schemaData.value.types[fmSchema];
  }

  const filename = currentFile.value.split('/').pop();
  const mapSchema = schemaData.value.mapping?.[filename];
  if (mapSchema && schemaData.value.types?.[mapSchema]) {
    return schemaData.value.types[mapSchema];
  }

  return schemaData.value.types?.['default'] || { fields: [] };
});

const availableTypes = computed(() => {
  if (!schemaData.value || !schemaData.value.types) {
    return [{ key: 'default', label: 'Padrão', icon: 'pi-file' }];
  }
  return Object.entries(schemaData.value.types).map(([key, val]) => ({
    key: key,
    label: val.label || key.charAt(0).toUpperCase() + key.slice(1),
    icon: val.icon || 'pi-file',
    description: val.description || ''
  }));
});

// --- 5. WATCHERS E PARSERS ---

// Parse Markdown <-> Form
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

watch(fileData, (newData) => {
  if (newData?.content) parseMD(newData.content);
}, { immediate: true });

// --- WATCHER DE CORREÇÃO E CARREGAMENTO (IMPORTANTE) ---
// Monitora mudanças no modelo ou nos dados para:
// 1. Converter listas de strings antigas em objetos para o Repeater
// 2. Adicionar UUIDs para o VueDraggable funcionar
// 3. Inicializar o estado dos campos (sanfona)
watch([currentModel, () => form.value.frontmatter], ([newModel, fm]) => {
  if (!newModel || !fm || !newModel.fields) return;

  newModel.fields.forEach(field => {
    // Tratamento para Repeater
    if (field.type === 'repeater') {
      const currentData = fm[field.key];

      if (!currentData) return;

      // CASO 1: Lista simples de Strings (Formato antigo/YAML manual)
      // Ex: ["Item 1", "Item 2"] -> Converte para [{ topico: "Item 1", _uuid: ... }]
      if (Array.isArray(currentData) && currentData.length > 0 && typeof currentData[0] !== 'object') {
        const firstSchemaKey = field.schema?.[0]?.key || 'text'; 
        console.log(`[Sirius] Convertendo lista simples de '${field.key}' para objetos...`);
        
        fm[field.key] = currentData.map(str => ({
          [firstSchemaKey]: str,
          _uuid: crypto.randomUUID()
        }));
      }
      
      // CASO 2: Lista de Objetos sem UUID (Carregado do disco)
      else if (Array.isArray(currentData)) {
        currentData.forEach(item => {
          if (typeof item === 'object' && item !== null && !item._uuid) {
            item._uuid = crypto.randomUUID();
          }
        });
      }
    }
  });

  // Inicializa Sanfona (apenas para campos novos)
  const initialState = { ...collapsedFields.value };
  newModel.fields.forEach(field => {
    if (initialState[field.key] === undefined) {
      initialState[field.key] = true;
    }
  });
  collapsedFields.value = initialState;

}, { immediate: true, deep: true });

// --- 6. FUNÇÕES AUXILIARES ---
const toggleField = (key) => collapsedFields.value[key] = !collapsedFields.value[key];

const getFieldSummary = (field) => {
  const val = form.value.frontmatter[field.key];
  if (!val) return 'Vazio';
  if (Array.isArray(val)) return `${val.length} itens`;
  if (field.type === 'image') return 'Imagem definida';
  if (typeof val === 'string') return val.length > 25 ? val.substring(0, 25) + '...' : val;
  return 'Preenchido';
};

const getImageUrl = (path) => {
  if (!path) return '';
  const cleanPath = path.replace(/^\/images/, ''); 
  return `/api/admin/render-image?site=${siteContext.value}&file=${encodeURIComponent(cleanPath)}`;
};

const removeExtension = (filename) => {
  return filename.replace(/\.[^/.]+$/, "");
};

// --- 7. NAVEGAÇÃO ---
const enterFolder = (f) => currentFolder.value = `${currentFolder.value}/${f}`;
const goBack = () => {
  const parts = currentFolder.value.split('/');
  if (parts.length > 1) { parts.pop(); currentFolder.value = parts.join('/'); }
};
const selectFile = (f) => {
  currentFile.value = f;
  const newUrl = `?file=${f}&folder=${currentFolder.value}`;
  window.history.pushState({}, '', newUrl);
  showSidebar.value = false;
};

// --- AÇÕES: ARQUIVO E PASTA ---
const openCreateModal = () => {
  newFileForm.value.name = '';
  newFileForm.value.type = 'default';
  showCreateModal.value = true;
};

const openFolderModal = () => {
  newFolderName.value = '';
  showFolderModal.value = true;
};

const handleCreateFile = async () => {
  let filename = newFileForm.value.name.trim();
  if (!filename) return;
  if (!filename.endsWith('.md')) filename += '.md';
  filename = filename.toLowerCase().replace(/\s+/g, '-');

  const initialData = {
    schema: newFileForm.value.type,
    title: newFileForm.value.name,
    date: new Date().toISOString().split('T')[0]
  };

  const y = yaml.dump(initialData);
  const content = `---\n${y}---\n\n# ${newFileForm.value.name}\nComece a editar aqui...`;

  try {
    await $fetch('/api/admin/storage', { 
      method: 'POST', 
      body: { site: siteContext.value, folder: currentFolder.value, file: filename, content: content } 
    });
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Arquivo criado.', life: 3000 });
    showCreateModal.value = false;
    await refreshFiles();
    selectFile(filename);
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar arquivo.', life: 3000 });
  }
};

const handleCreateFolder = async () => {
  if (!newFolderName.value.trim()) return;
  try {
    await $fetch('/api/admin/storage/mkdir', {
      method: 'POST',
      body: { site: siteContext.value, folder: currentFolder.value, name: newFolderName.value }
    });
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Pasta criada.', life: 3000 });
    showFolderModal.value = false;
    await refreshFiles();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar pasta.', life: 3000 });
  }
};

// --- 8. LÓGICA DE EDIÇÃO (REPEATER) ---
const addRepeaterItem = (fieldKey, itemSchema) => {
  if (!form.value.frontmatter[fieldKey]) form.value.frontmatter[fieldKey] = [];
  
  // Gera ID único
  const newItem = { _uuid: crypto.randomUUID() };
  itemSchema.forEach(f => newItem[f.key] = '');
  
  form.value.frontmatter[fieldKey].push(newItem);
  collapsedFields.value[fieldKey] = false; 
};

const removeRepeaterItem = (fieldKey, index) => {
  if (confirm('Remover este item?')) form.value.frontmatter[fieldKey].splice(index, 1);
};

const removeImageFromList = (list, index) => {
  if (list && list.splice) list.splice(index, 1);
};

// --- 9. GESTÃO DE IMAGENS ---
const openForSingleImage = (targetObj, key) => {
  imageTarget.value = { mode: 'set', obj: targetObj, key: key };
  showImageModal.value = true;
};
const openForImageList = (targetArray) => {
  if (!Array.isArray(targetArray)) { 
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Campo de lista inválido.', life: 3000 });
    return; 
  }
  imageTarget.value = { mode: 'push', list: targetArray };
  showImageModal.value = true;
};
const openForMarkdown = () => {
  imageTarget.value = { mode: 'markdown' };
  showImageModal.value = true;
};
const handleImageSelect = (url) => {
  const target = imageTarget.value;
  if (!target || target.mode === 'markdown') {
    form.value.content += `\n![](${url})`;
    toast.add({ severity: 'info', summary: 'Markdown', detail: 'Imagem inserida.', life: 3000 });
  } else if (target.mode === 'set') {
    target.obj[target.key] = url;
    toast.add({ severity: 'success', summary: 'Atualizado', detail: 'Imagem definida.', life: 3000 });
  } else if (target.mode === 'push') {
    target.list.push(url);
    toast.add({ severity: 'success', summary: 'Adicionado', detail: 'Imagem na galeria.', life: 3000 });
  }
  showImageModal.value = false;
  imageTarget.value = null;
};

// --- 10. SALVAR (COM LIMPEZA) ---
const saveFile = async () => {
  if (!currentFile.value) return;
  loadingSave.value = true;

  // Clona e limpa os _uuid antes de salvar
  const dataToSave = JSON.parse(JSON.stringify(form.value.frontmatter));
  for (const key in dataToSave) {
    if (Array.isArray(dataToSave[key])) {
      dataToSave[key] = dataToSave[key].map(item => {
        if (typeof item === 'object' && item !== null && item._uuid) {
          const { _uuid, ...cleanItem } = item;
          return cleanItem;
        }
        return item;
      });
    }
  }

  const y = yaml.dump(dataToSave, { indent: 2, lineWidth: -1, noRefs: true });
  const finalContent = `---\n${y}---\n\n${form.value.content}`;
  
  try {
    await $fetch('/api/admin/storage', { 
      method: 'POST', 
      body: { site: siteContext.value, folder: currentFolder.value, file: currentFile.value, content: finalContent } 
    });
    toast.add({ severity: 'success', summary: 'Salvo', detail: 'Arquivo salvo com sucesso!', life: 3000 });
  } catch (err) { 
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar.', life: 3000 });
  } finally {
    loadingSave.value = false;
  }
};

const logout = () => { siteContext.value = null; navigateTo('/login'); };
</script>

<template>
  <div class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30">
    <Toast />

    <Drawer v-model:visible="showSidebar" header="Explorer" class="w-80 bg-[#141b18] border-r border-white/5">
      <template #header>
        <div class="flex items-center gap-2">
          <i class="pi pi-folder-open text-[#6f942e]"></i>
          <span class="text-xs font-black uppercase tracking-widest text-slate-400">Navegação</span>
        </div>
      </template>
      
      <div class="flex flex-col h-full w-full">
        <div class="p-3 border-b border-white/5 bg-[#141b18] shrink-0 z-10">
          <div class="flex gap-2 mb-4">
             <Button label="ARQUIVO" icon="pi pi-file-plus" class="flex-1 bg-[#6f942e] border-none text-black font-black text-[10px] tracking-widest" @click="openCreateModal" />
             <Button label="PASTA" icon="pi pi-folder-plus" class="flex-1 bg-white/10 border-none text-slate-300 hover:bg-white/20 font-black text-[10px] tracking-widest" @click="openFolderModal" />
          </div>

          <div class="bg-black/20 p-2 rounded-sm border border-white/5 flex flex-wrap gap-1">
            <button v-for="root in ['content', 'pages', 'components', 'data', 'layout']" :key="root"
                    @click="currentFolder = root"
                    :class="['text-[9px] px-2 py-1 rounded uppercase font-bold transition-all', currentFolder.startsWith(root) ? 'bg-[#6f942e] text-black' : 'bg-white/5 text-slate-500 hover:text-white']">
              {{ root }}
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
          <div v-if="currentFolder.includes('/')" @click="goBack" class="flex items-center gap-3 p-3 rounded-sm cursor-pointer hover:bg-[#6f942e]/10 text-[#6f942e] border border-dashed border-[#6f942e]/20 mb-2">
            <i class="pi pi-arrow-up text-xs"></i><span class="text-xs font-bold uppercase tracking-widest">.. / Voltar</span>
          </div>
          
          <div v-for="file in files" :key="file.name" @click="file.isDirectory ? enterFolder(file.name) : selectFile(file.name)"
               :class="['flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-all border border-transparent mb-1', currentFile === file.name ? 'bg-[#6f942e]/10 border-[#6f942e]/30 text-white shadow-lg' : 'hover:bg-white/5 text-slate-300']">
            <i :class="[file.isDirectory ? 'pi pi-folder text-yellow-600 text-lg' : 'pi pi-file text-indigo-400 text-lg']"></i>
            <span class="text-sm font-medium truncate">{{ file.isDirectory ? file.name : removeExtension(file.name) }}</span>
          </div>
        </div>
      </div>
    </Drawer>

    <Dialog v-model:visible="showCreateModal" modal header="NOVO DOCUMENTO" :style="{ width: '400px' }" class="bg-[#141b18]">
      <div class="flex flex-col gap-6 pt-4">
        <div class="flex flex-col gap-2">
          <label class="text-[10px] uppercase font-black tracking-widest text-[#6f942e]">Nome do Arquivo</label>
          <InputText v-model="newFileForm.name" placeholder="Ex: novo-artigo" class="bg-[#0a0f0d] border border-white/10 text-white" />
          <small class="text-slate-500 text-[10px]">Será salvo como .md</small>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[10px] uppercase font-black tracking-widest text-[#6f942e]">Tipo de Conteúdo</label>
          <div class="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            <div v-for="type in availableTypes" :key="type.key" @click="newFileForm.type = type.key"
              :class="['p-3 rounded-sm border cursor-pointer flex items-center gap-3 transition-all', 
                newFileForm.type === type.key ? 'bg-[#6f942e]/20 border-[#6f942e] text-white' : 'bg-black/20 border-white/5 text-slate-500 hover:bg-white/5'
              ]">
              <i :class="['pi', type.icon]" class="text-lg"></i>
              <div class="flex flex-col">
                <span class="text-xs font-bold uppercase">{{ type.label }}</span>
                <span v-if="type.description" class="text-[9px] opacity-70">{{ type.description }}</span>
              </div>
              <i v-if="newFileForm.type === type.key" class="pi pi-check ml-auto text-[#6f942e]"></i>
            </div>
          </div>
        </div>
        <Button label="CRIAR ARQUIVO" icon="pi pi-check" class="bg-[#6f942e] border-none font-black text-xs tracking-widest w-full py-3" @click="handleCreateFile" :disabled="!newFileForm.name" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showFolderModal" modal header="NOVA PASTA" :style="{ width: '350px' }" class="bg-[#141b18]">
      <div class="flex flex-col gap-6 pt-4">
        <div class="flex flex-col gap-2">
          <label class="text-[10px] uppercase font-black tracking-widest text-[#6f942e]">Nome da Pasta</label>
          <InputText v-model="newFolderName" placeholder="Ex: viagens-2024" class="bg-[#0a0f0d] border border-white/10 text-white" />
        </div>
        <Button label="CRIAR PASTA" icon="pi pi-check" class="bg-[#6f942e] border-none font-black text-xs tracking-widest w-full py-3" @click="handleCreateFolder" :disabled="!newFolderName" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showImageModal" modal header="BIBLIOTECA DE MEDIA" :style="{ width: '85vw' }" class="bg-[#141b18]">
      <ImageExplorer @select="handleImageSelect" />
    </Dialog>

    <header class="sticky top-0 z-50 w-full bg-[#141b18] border-b border-white/5 h-14 px-4 flex justify-between items-center shadow-md relative overflow-hidden group">
        <div class="absolute -top-10 -left-10 w-32 h-32 bg-[#6f942e]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="flex items-center gap-4 z-10 h-full">
          <div class="flex items-center gap-2 pr-4 border-r border-white/5 h-8">
            <Button icon="pi pi-bars" text @click="showSidebar = true" class="!w-8 !h-8 !p-0 text-[#6f942e] hover:bg-[#6f942e]/10" v-tooltip.bottom="'Explorer'" />
            <Button :icon="showMetaSidebar ? 'pi pi-sliders-h' : 'pi pi-sliders-v'" text @click="showMetaSidebar = !showMetaSidebar" :class="showMetaSidebar ? 'text-[#6f942e] bg-[#6f942e]/10' : 'text-slate-500 hover:text-white'" class="!w-8 !h-8 !p-0 transition-colors" v-tooltip.bottom="'Metadados'" />
            <div class="flex flex-col select-none pl-2 justify-center">
              <h1 class="text-sm font-black text-white leading-none tracking-tighter flex items-center gap-2">
                <i class="pi pi-star-fill text-[#6f942e] text-[10px]"></i> SIRIUS STUDIO
              </h1>
            </div>
          </div>
          <div v-if="currentFile" class="flex items-center gap-2 select-none text-[14px]">
             <span class="uppercase tracking-widest text-[#6f942e] font-black opacity-60">{{ siteContext }}</span>
          </div>
        </div>
        <div class="flex gap-2 z-10">
          <Button label="Salvar" icon="pi pi-save" size="small" :loading="loadingSave" @click="saveFile" :disabled="!currentFile" class="bg-[#6f942e] border-none px-4 py-1 font-bold text-[10px] tracking-widest hover:bg-[#5a7a25]" />
          <Button icon="pi pi-sign-out" severity="danger" text size="small" class="!w-8 !h-8 !p-0" @click="logout" v-tooltip.bottom="'Sair'" />
        </div>
    </header>

    <div class="p-4 md:p-6 max-w-[1700px] mx-auto pb-32">
      <div v-if="currentFile" class="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-120px)] transition-all duration-300">
        
        <aside v-show="showMetaSidebar" class="lg:col-span-4 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-20">
          <div v-if="currentModel.fields.length === 0" class="bg-yellow-500/10 p-4 rounded-sm border border-yellow-500/20 text-yellow-500 text-xs">
            <i class="pi pi-exclamation-triangle mr-2"></i> Nenhum modelo detectado. Editando modo raw.
          </div>
          
          <div v-for="field in currentModel.fields" :key="field.key" class="bg-[#141b18] rounded-[0.5vw] border border-white/5 overflow-hidden transition-all duration-300">
            <div @click="toggleField(field.key)" class="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 select-none" :class="{ 'border-b border-white/5': !collapsedFields[field.key] }">
              <div class="flex items-center gap-3">
                <i class="pi pi-chevron-down text-[10px] text-[#6f942e] transition-transform duration-300" :class="{ '-rotate-90': collapsedFields[field.key] }"></i>
                <div>
                  <label class="text-[10px] font-black text-[#6f942e] uppercase tracking-[0.2em] cursor-pointer">{{ field.label }}</label>
                  <div v-if="collapsedFields[field.key]" class="text-[9px] text-slate-500 font-mono mt-1">Result: <span class="text-slate-300">{{ getFieldSummary(field) }}</span></div>
                </div>
              </div>
              <i v-if="field.description && !collapsedFields[field.key]" class="pi pi-info-circle text-[10px] text-slate-600" v-tooltip.top="field.description"></i>
            </div>
            
            <div v-show="!collapsedFields[field.key]" class="p-5 pt-4 bg-[#0a0f0d]/30">
              <input v-if="field.type === 'text'" v-model="form.frontmatter[field.key]" :placeholder="field.placeholder" class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-[#6f942e] outline-none transition-colors" />
              <textarea v-else-if="field.type === 'textarea'" v-model="form.frontmatter[field.key]" rows="3" class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-[#6f942e] outline-none transition-colors resize-none"></textarea>
              
              <div v-else-if="field.type === 'image'" class="flex gap-2 items-stretch">
                <div class="relative flex-1">
                   <input v-model="form.frontmatter[field.key]" class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 pl-8 text-sm text-white focus:border-[#6f942e] outline-none" />
                   <i class="pi pi-image absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
                </div>
                <Button icon="pi pi-folder-open" severity="secondary" @click="openForSingleImage(form.frontmatter, field.key)" class="p-button-sm" />
                <div v-if="form.frontmatter[field.key]" class="w-10 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative">
                    <img :src="getImageUrl(form.frontmatter[field.key])" class="w-full h-full object-cover" />
                </div>
              </div>
              
              <div v-else-if="field.type === 'image_list'" class="bg-black/20 p-4 rounded-sm border border-white/5 mt-2">
                 <div v-if="!form.frontmatter[field.key]">{{ form.frontmatter[field.key] = [] }}</div>
                 <draggable v-if="form.frontmatter[field.key]?.length > 0" v-model="form.frontmatter[field.key]" :item-key="element => element" class="grid grid-cols-3 gap-3 mb-3" ghost-class="ghost-image">
                    <template #item="{ element, index }">
                      <div class="relative group aspect-square bg-black rounded-sm overflow-hidden border border-white/10 cursor-move hover:border-[#6f942e]/50 transition-all">
                         <img :src="getImageUrl(element.replace('/images', ''))" class="w-full h-full object-cover pointer-events-none" />
                         <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Button icon="pi pi-trash" rounded text severity="danger" size="small" @click="removeImageFromList(form.frontmatter[field.key], index)" />
                         </div>
                      </div>
                    </template>
                 </draggable>
                 <div v-else class="text-center py-4 text-[10px] text-slate-600 italic">Galeria vazia</div>
                 <Button label="Adicionar Imagens" icon="pi pi-plus" size="small" outlined class="w-full text-[10px] border-dashed border-[#6f942e]/30 text-[#6f942e]" @click="openForImageList(form.frontmatter[field.key])" />
              </div>
              
              <div v-else-if="field.type === 'repeater'" class="mt-2">
                <draggable v-model="form.frontmatter[field.key]" item-key="_uuid" handle=".drag-handle" class="space-y-3">
                  <template #item="{ element, index }">
                    <div class="bg-black/20 p-4 rounded-sm border border-white/5 relative group">
                      <div class="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                        <div class="flex items-center gap-2">
                          <i class="pi pi-bars drag-handle cursor-grab text-slate-600 hover:text-white"></i>
                          <span class="text-[9px] font-bold text-slate-500 uppercase">{{ field.itemLabel || 'Item' }} {{ index + 1 }}</span>
                        </div>
                        <button @click="removeRepeaterItem(field.key, index)" class="text-slate-700 hover:text-red-500 transition-colors"><i class="pi pi-trash text-xs"></i></button>
                      </div>
                      <div class="space-y-3">
                        <div v-for="subField in field.schema" :key="subField.key">
                          <label class="text-[8px] text-slate-500 uppercase font-bold block mb-1">{{ subField.label }}</label>
                          <input v-if="subField.type === 'text'" v-model="element[subField.key]" class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e]" />
                          <textarea v-else-if="subField.type === 'textarea'" v-model="element[subField.key]" rows="2" class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e] resize-none"></textarea>
                          <div v-else-if="subField.type === 'image'" class="flex gap-2 items-stretch">
                             <div class="relative flex-1"><input v-model="element[subField.key]" class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e]" /></div>
                             <Button icon="pi pi-search" size="small" text rounded severity="secondary" @click="openForSingleImage(element, subField.key)" />
                             <div v-if="element[subField.key]" class="w-8 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative">
                                <img :src="getImageUrl(element[subField.key])" class="w-full h-full object-cover" />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </draggable>
                <button @click="addRepeaterItem(field.key, field.schema)" class="w-full py-3 mt-4 border-2 border-dashed border-[#6f942e]/20 rounded-sm text-[10px] font-bold text-[#6f942e] hover:bg-[#6f942e]/10 uppercase tracking-widest transition-all">+ Adicionar {{ field.itemLabel || 'Item' }}</button>
              </div>

            </div>
          </div>
        </aside>

        <main class="bg-[#141b18] rounded-[0.5vw] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative"
              :class="showMetaSidebar ? 'lg:col-span-8' : 'lg:col-span-12'">
          <div class="px-8 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center z-10">
             <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-sm bg-black/40 flex items-center justify-center border border-white/5">
                   <i class="pi pi-file-edit text-[#6f942e] text-xs"></i>
                </div>
                <div class="flex flex-col">
                   <span class="text-[8px] uppercase tracking-[0.2em] font-black text-slate-500">Editando</span>
                   <div class="flex items-center gap-1 text-[11px] font-mono">
                      <span class="text-[#6f942e] opacity-80">{{ currentFolder }}</span>
                      <span class="text-slate-600">/</span>
                      <span class="text-slate-200 font-bold">{{ currentFile }}</span>
                   </div>
                </div>
             </div>
             <Button label="Inserir Imagem" icon="pi pi-image" text size="small" class="text-[10px]" @click="openForMarkdown()" />
          </div>
          <textarea v-model="form.content" class="flex-1 p-7 bg-transparent text-indigo-50 font-mono text-[14px] leading-[1.8] outline-none resize-none custom-scrollbar z-0" spellcheck="false" placeholder="# Escreva seu conteúdo Markdown aqui..."></textarea>
        </main>
      </div>

      <div v-else class="h-[75vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 text-center select-none">
         <div class="w-24 h-24 bg-[#6f942e]/10 rounded-full flex items-center justify-center mb-6"><i class="pi pi-star text-[#6f942e] text-3xl animate-pulse"></i></div>
         <h2 class="font-black text-2xl tracking-tighter text-white uppercase">Sirius Studio</h2>
         <p class="font-mono text-[10px] mt-2 uppercase tracking-[0.4em]">Selecione um arquivo para editar</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(111, 148, 46, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(111, 148, 46, 0.5); }

/* Drag Ghost */
.ghost-image { opacity: 0.4; border: 2px dashed #6f942e !important; background-color: #141b18 !important; transform: scale(0.98); }

/* Overrides do PrimeVue */
:deep(.p-drawer) { background-color: #141b18 !important; border-right: 1px solid rgba(255, 255, 255, 0.05) !important; color: #cbd5e1 !important; }
:deep(.p-drawer-header) { background-color: #141b18 !important; padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
:deep(.p-drawer-content) { padding: 0 !important; }
:deep(.p-drawer .p-drawer-header .p-icon) { color: #64748b; }

:deep(.p-dialog) { border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8); border-radius: 20px; overflow: hidden; }
:deep(.p-dialog-header) { background-color: #141b18 !important; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #6f942e; padding: 1.5rem 2rem; }
:deep(.p-dialog-title) { font-weight: 900; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; }
:deep(.p-dialog-content) { background-color: #0a0f0d !important; padding: 0 !important; }
:deep(.p-dialog-header-icons .p-dialog-header-icon) { color: #64748b; width: 32px; height: 32px; border-radius: 50%; }
:deep(.p-dialog-header-icons .p-dialog-header-icon:hover) { background: rgba(255,255,255,0.05); color: #ef4444; }

:deep(.p-tooltip-text) { background: #141b18 !important; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8 !important; font-size: 11px; font-weight: 600; padding: 0.5rem 0.75rem; }
</style>