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

// --- ESTADOS DO MODO RAW ---
const showRawMode = ref(false); 
const rawContent = ref(''); 

const currentFile = ref(route.query.file || '');
const currentFolder = ref(route.query.folder || 'content');
const loadingSave = ref(false);
const loadingPublish = ref(false); // <--- NOVO REF
const form = ref({ frontmatter: {}, content: '' });

// Modais (Mantidos iguais)
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


// --- FUNÇÃO DE PUBLICAR ---
const handlePublish = async () => {
  if (!confirm(`Deseja rodar o build para o site "${siteContext.value}"?\nIsso pode levar alguns minutos.`)) return;

  loadingPublish.value = true;
  
  try {
    const res = await $fetch('/api/admin/publish', {
      method: 'POST',
      body: { site: siteContext.value }
    });
    
    toast.add({ 
      severity: 'success', 
      summary: 'Publicado!', 
      detail: 'O site foi compilado com sucesso.', 
      life: 5000 
    });
    console.log('Build Logs:', res.logs);

  } catch (error) {
    console.error(error);
    toast.add({ 
      severity: 'error', 
      summary: 'Erro no Build', 
      detail: 'Verifique o console para mais detalhes.', 
      life: 5000 
    });
  } finally {
    loadingPublish.value = false;
  }
};

// --- NOVO: COMPUTED PARA ORDENAR (Pastas no topo) ---
const sortedFiles = computed(() => {
  if (!files.value) return [];
  
  // Cria uma cópia para não mutar o original e ordena
  return [...files.value].sort((a, b) => {
    // Critério 1: Pastas primeiro
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    
    // Critério 2: Ordem alfabética
    return a.name.localeCompare(b.name);
  });
});





const { data: fileData } = await useAsyncData('file-content', 
  () => currentFile.value ? $fetch('/api/admin/storage', { params: { site: siteContext.value, folder: currentFolder.value, file: currentFile.value } }) : null,
  { watch: [currentFile] }
);





const { data: schemaData } = await useFetch('/api/admin/schema', {
  query: { site: siteContext, folder: currentFolder, filename: computed(() => currentFile.value ? currentFile.value.split('/').pop() : '') },
  watch: [currentFolder, currentFile]
});

// --- COMPUTEDS (Mantidos iguais) ---
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
    key, label: val.label || key, icon: val.icon || 'pi-file', description: val.description || ''
  }));
});

// --- HELPERS DE LIMPEZA ---
// Função centralizada para limpar dados antes de gerar o YAML
const getCleanData = () => {
  const cleanData = JSON.parse(JSON.stringify(form.value.frontmatter));
  const modelFields = currentModel.value.fields || [];
  
  modelFields.forEach(field => {
    const data = cleanData[field.key];
    if (!Array.isArray(data)) return;

    // Limpeza de Simple List e Repeater
    if (field.type === 'simple_list') {
       cleanData[field.key] = data.map(item => item.text || ''); 
    }
    if (field.type === 'repeater') {
       cleanData[field.key] = data.map(item => {
         const { _uuid, ...rest } = item;
         return rest;
       });
    }
  });
  return cleanData;
};

// --- PARSER ROBUSTO (Substitua o antigo parseMD) ---
const parseMD = (full) => {
  if (!full) {
    form.value.frontmatter = {};
    form.value.content = '';
    return;
  }

  // Normaliza quebras de linha para evitar erros de Windows/Linux
  const normalized = full.replace(/\r\n/g, '\n');
  
  // Regex: Procura bloco YAML estritamente no início do arquivo
  // ^---\n       -> Começa com --- e quebra de linha
  // ([\s\S]*?)   -> Grupo 1: Captura tudo (não guloso)
  // \n---\n      -> Até encontrar o fechamento --- e quebra
  // ([\s\S]*)    -> Grupo 2: O resto é conteúdo
  const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = normalized.match(fmRegex);

  try {
    if (match) {
      // Arquivo com Frontmatter válido
      form.value.frontmatter = yaml.load(match[1]) || {};
      form.value.content = match[2].trim(); // Remove espaços extras no início do conteúdo
    } else {
      // Arquivo sem Frontmatter ou mal formatado
      // Tenta detectar se o usuário tentou fazer um frontmatter mas errou (ex: faltou fechar)
      if (normalized.trim().startsWith('---')) {
        console.warn("[Sirius] Possível frontmatter quebrado. Tentando fallback.");
        // Fallback simples: Se tiver 2 '---', tenta separar, senão assume tudo como texto
        const parts = normalized.split('---');
        if (parts.length >= 3 && parts[0].trim() === '') {
           form.value.frontmatter = yaml.load(parts[1]) || {};
           form.value.content = parts.slice(2).join('---').trim();
        } else {
           // Estrutura inválida, trata tudo como conteúdo para não perder dados
           form.value.frontmatter = {};
           form.value.content = normalized;
        }
      } else {
        // Texto puro sem cabeçalho
        form.value.frontmatter = {};
        form.value.content = normalized;
      }
    }
  } catch (e) { 
    console.error("YAML Parse Error:", e);
    toast.add({ severity: 'error', summary: 'Erro de Sintaxe', detail: 'O YAML do cabeçalho está inválido.' });
    // Mantém o estado anterior se possível ou define erro
  }
};

watch(fileData, (newData) => { 
  if (newData?.content) {
    parseMD(newData.content);
    // Atualiza o rawContent também para garantir sincronia inicial
    rawContent.value = newData.content;
  }
}, { immediate: true });

// Correção Automática (Strings -> Objetos para UI)
watch([currentModel, () => form.value.frontmatter], ([newModel, fm]) => {
  if (showRawMode.value) return; // PAUSA a correção se estiver no modo Raw
  if (!newModel?.fields || !fm) return;

  newModel.fields.forEach(field => {
    const data = fm[field.key];
    if (!Array.isArray(data)) return;

    if (field.type === 'simple_list') {
      if (data.length > 0 && typeof data[0] !== 'object') {
        fm[field.key] = data.map(str => ({ text: str, _uuid: crypto.randomUUID() }));
      } else {
        data.forEach(item => { if (typeof item === 'object' && !item._uuid) item._uuid = crypto.randomUUID(); });
      }
    }

    if (field.type === 'repeater') {
      data.forEach(item => { 
        if (item && typeof item === 'object' && !item._uuid) item._uuid = crypto.randomUUID(); 
      });
    }
  });
}, { deep: true });

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
    showRawMode.value = false; // Reset ao mudar arquivo
  },
  changeRoot: (r) => currentFolder.value = r
};

// --- CREATE & IMAGES (Mantidos iguais) ---
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
    await $fetch('/api/admin/mkdir', { method: 'POST', body: { site: siteContext.value, folder: currentFolder.value, name: newFolderName.value } });
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
    // Se estiver no modo RAW, insere no final do texto (simples)
    if (showRawMode.value) {
      rawContent.value += `\n![](${url})`;
    } else {
      const t = imageTarget.value;
      if (t.mode === 'markdown') form.value.content += `\n![](${url})`;
      else if (t.mode === 'set') t.obj[t.key] = url;
      else if (t.mode === 'push') t.list.push(url);
    }
    showImageModal.value = false;
  }
};

const toggleRawMode = () => {
  if (!showRawMode.value) {
    // INDO PARA MODO RAW: Gera o texto limpo
    const cleanData = getCleanData();
    // lineWidth: -1 evita quebras de linha indesejadas em strings longas
    const y = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
    
    // Reconstrói o arquivo. Se content estiver vazio, não adiciona quebras extras
    const contentPart = form.value.content ? `\n\n${form.value.content.trim()}` : '';
    rawContent.value = `---\n${y.trim()}\n---${contentPart}`;
    
  } else {
    // SAINDO DO MODO RAW: Processa o texto de volta para visual
    parseMD(rawContent.value);
  }
  showRawMode.value = !showRawMode.value;
};

// --- SAVE (Unificado) ---
const saveFile = async () => {
  if (!currentFile.value) return;
  loadingSave.value = true;
  
  let finalContent = '';

  if (showRawMode.value) {
    // MODO RAW: Salva EXATAMENTE o que o usuário digitou no textarea
    // Não rodamos parseMD aqui para não arriscar mudar a formatação do usuário
    finalContent = rawContent.value;
    
    // Atualiza o visual silenciosamente apenas para manter sincronia se ele sair do raw depois
    // Mas o que vai pro disco é o rawContent
    try {
       const parts = rawContent.value.split('---'); // Check básico de sanidade
       if(parts.length >= 3) parseMD(rawContent.value);
    } catch(e) {}

  } else {
    // MODO VISUAL: Gera o YAML limpo
    const cleanData = getCleanData();
    const y = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
    const contentPart = form.value.content ? `\n\n${form.value.content.trim()}` : '';
    finalContent = `---\n${y.trim()}\n---${contentPart}`;
  }
  
  try {
    await $fetch('/api/admin/storage', { 
      method: 'POST', 
      body: { 
        site: siteContext.value, 
        folder: currentFolder.value, 
        file: currentFile.value, 
        content: finalContent 
      } 
    });
    toast.add({ severity: 'success', summary: 'Salvo', detail: 'Arquivo atualizado.', life: 2000 });
  } catch (e) { 
    toast.add({ severity: 'error', summary: 'Erro ao salvar' }); 
  } finally { 
    loadingSave.value = false; 
  }
};

const logout = () => { siteContext.value = null; navigateTo('/login'); };

// Atalhos
const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault(); 
    if (currentFile.value) saveFile();
  }
};
onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30 flex flex-col">
    <Toast />

  <AdminSidebar 
      v-model:visible="showSidebar"
      :files="sortedFiles"  :current-folder="currentFolder"
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
      :loading-publish="loadingPublish" 
      :show-meta-sidebar="showMetaSidebar"
      :is-raw-mode="showRawMode"
      @toggle-sidebar="showSidebar = true"
      @toggle-meta="showMetaSidebar = !showMetaSidebar"
      @toggle-raw="toggleRawMode"
      @save="saveFile"
      @publish="handlePublish" 
      @logout="logout"
    />

    <div class="flex-1 p-4 md:p-6 max-w-[1700px] mx-auto w-full">
      <div v-if="currentFile">
        
        <div v-if="showRawMode" class="h-[calc(100vh-120px)] animate-fade-in">
           <div class="w-full h-full bg-[#141b18] rounded-[0.5vw] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
              <div class="px-6 py-2 border-b border-white/5 bg-white/5 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <span>Editando Código Fonte (YAML + Markdown)</span>
                <span class="text-orange-500 flex items-center gap-1"><i class="pi pi-exclamation-triangle"></i> Atenção à indentação</span>
              </div>
              <textarea 
                v-model="rawContent" 
                class="flex-1 p-6 bg-transparent text-[#a3d95b] font-mono text-[13px] leading-[1.6] outline-none resize-none custom-scrollbar"
                spellcheck="false"
              ></textarea>
           </div>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-120px)] transition-all duration-300 animate-fade-in">
          
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

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>