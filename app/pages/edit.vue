<script setup>
import yaml from 'js-yaml';
import draggable from 'vuedraggable';
import { useToast } from "primevue/usetoast"; // Adicione esta importação
const toast = useToast(); // Inicialize o toast

definePageMeta({ layout: '' })

const route = useRoute();
const siteContext = useCookie('cms_site_context');

// Estados de Navegação
const currentFile = ref(route.query.file || '');
const currentFolder = ref(route.query.folder || 'content');
const showSidebar = ref(false);
const showImageModal = ref(false);

// 1. Busca de Arquivos para a Sidebar
const { data: files, refresh: refreshFiles } = await useFetch('/api/admin/storage', {
  query: { site: siteContext, folder: currentFolder },
  watch: [currentFolder]
});

// 2. Busca do Conteúdo do Arquivo
const { data: fileData, pending } = await useAsyncData(
  'file-content',
  () => {
    if (!currentFile.value) return null;
    return $fetch('/api/admin/storage', {
      params: { site: siteContext.value, folder: currentFolder.value, file: currentFile.value }
    });
  },
  { watch: [currentFile] }
);

const markdownBody = ref('');
const frontmatter = ref({});
const collapsedSections = ref({});

// --- LÓGICA DE NAVEGAÇÃO ---
const enterFolder = (f) => currentFolder.value = `${currentFolder.value}/${f}`;
const goBack = () => {
  const parts = currentFolder.value.split('/');
  if (parts.length > 1) { parts.pop(); currentFolder.value = parts.join('/'); }
};
const selectFile = (f) => {
  currentFile.value = f;
  window.history.pushState({}, '', `?site=${siteContext.value}&folder=${currentFolder.value}&file=${f}`);
  showSidebar.value = false;
};

// --- LÓGICA DE DADOS ---
const parseMD = (full) => {
  try {
    const parts = full.split('---');
    if (parts.length >= 3) {
      frontmatter.value = yaml.load(parts[1]) || {};
      markdownBody.value = parts.slice(2).join('---').trim();
    } else { frontmatter.value = {}; markdownBody.value = full; }
  } catch (e) { console.error(e); }
};

const stringifyMD = () => {
  const y = yaml.dump(frontmatter.value, { indent: 2, lineWidth: -1, noRefs: true });
  return `---\n${y}---\n\n${markdownBody.value}`;
};

const insertImageAtCursor = (url) => {
  const imageMarkdown = `![](${url})`;
  markdownBody.value += `\n${imageMarkdown}`;
  showImageModal.value = false;
  toast.add({ severity: 'success', summary: 'Inserido', detail: 'Markdown da imagem adicionado ao final.', life: 2000 });
};

watch(fileData, (newData) => { if (newData?.content) parseMD(newData.content); }, { immediate: true });

// --- GESTÃO UI ---
const toggleSection = (k) => collapsedSections.value[k] = !collapsedSections.value[k];
const addItem = (k, isObj = false) => {
  if (!frontmatter.value[k]) frontmatter.value[k] = [];
  frontmatter.value[k].push(isObj ? { title: '', description: '' } : '');
};
const removeItem = (k, i) => { if (confirm('Excluir item?')) frontmatter.value[k].splice(i, 1); };

// async function saveFile() {
//   if (!currentFile.value) return;
//   try {
//     await $fetch('/api/admin/storage', { 
//       method: 'POST', 
//       body: { site: siteContext.value, folder: currentFolder.value, file: currentFile.value, content: stringifyMD() } 
//     });
//     alert("Salvo com sucesso!");
//   } catch (err) { alert("Erro ao salvar"); }
// }

const logout = () => {
  siteContext.value = null;
  navigateTo('/login');
};

async function saveFile() {
  if (!currentFile.value) return;
  try {
    await $fetch('/api/admin/storage', { 
      method: 'POST', 
      body: { 
        site: siteContext.value, 
        folder: currentFolder.value, 
        file: currentFile.value, 
        content: stringifyMD() 
      } 
    });
    
    // MENSAGEM DISCRETA NO CANTO SUPERIOR
    toast.add({ 
      severity: 'success', 
      summary: 'Sucesso', 
      detail: 'Arquivo salvo com sucesso!', 
      life: 2500 
    });
    
  } catch (err) { 
    toast.add({ 
      severity: 'error', 
      summary: 'Erro', 
      detail: 'Não foi possível salvar o arquivo', 
      life: 5000 
    });
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30">
    
    <Drawer v-model:visible="showSidebar" header="Explorer" class="w-80 bg-[#141b18] border-r border-white/5">
      <template #header>
        <div class="flex items-center gap-2">
          <i class="pi pi-folder-open text-[#6f942e]"></i>
          <span class="text-xs font-black uppercase tracking-widest text-slate-400">Navegação</span>
        </div>
      </template>
      <div class="flex flex-col gap-2 p-2 mt-4">
        <div class="mb-6 bg-black/20 p-2 rounded-xl border border-white/5 flex flex-wrap gap-1">
          <button v-for="root in ['content', 'pages', 'components', 'data']" :key="root"
                  @click="currentFolder = root"
                  :class="['text-[9px] px-2 py-1 rounded uppercase font-bold transition-all', currentFolder.startsWith(root) ? 'bg-[#6f942e] text-black' : 'bg-white/5 text-slate-500 hover:text-white']">
            {{ root }}
          </button>
        </div>

        <div class="space-y-1">
          <div v-if="currentFolder.includes('/')" @click="goBack" class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-[#6f942e]/10 text-[#6f942e] border border-dashed border-[#6f942e]/20 mb-2">
            <i class="pi pi-arrow-up text-xs"></i>
            <span class="text-xs font-bold uppercase tracking-widest">.. / Retornar</span>
          </div>

          <div v-for="file in files" :key="file.name" @click="file.isDirectory ? enterFolder(file.name) : selectFile(file.name)"
               :class="['flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent', currentFile === file.name ? 'bg-[#6f942e]/10 border-[#6f942e]/30 text-white shadow-lg shadow-black/40' : 'hover:bg-white/5 text-slate-500']">
            <i :class="[file.isDirectory ? 'pi pi-folder text-yellow-600' : 'pi pi-file-edit text-indigo-500']"></i>
            <span class="text-[11px] font-mono truncate">{{ file.name }}</span>
          </div>
        </div>
      </div>
    </Drawer>

    <!-- <Dialog v-model:visible="showImageModal" modal header="Sirius Studio | Assets" :style="{ width: '85vw' }" class="bg-[#141b18]">
      <ImageExplorer @select="(url) => { showImageModal = false; }" />
    </Dialog> -->

    <Dialog v-model:visible="showImageModal" modal header="Sirius Studio | Assets" :style="{ width: '85vw' }" class="bg-[#141b18]">
      <ImageExplorer @select="(url) => insertImageAtCursor(url)" />
    </Dialog>

    <div class="p-4 md:p-6 max-w-[1700px] mx-auto">
      
      <header class="flex justify-between items-center mb-6 bg-[#141b18] p-4 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div class="absolute -top-10 -left-10 w-40 h-40 bg-[#6f942e]/5 rounded-full blur-3xl group-hover:bg-[#6f942e]/10 transition-all"></div>
        
        <div class="flex items-center gap-6 z-10">
          <div class="flex items-center gap-3 pr-6 border-r border-white/5">
            <Button icon="pi pi-bars" text @click="showSidebar = true" class="text-[#6f942e] hover:bg-[#6f942e]/10 p-4" />
            <div class="flex flex-col select-none">
              <h1 class="text-lg font-black text-white leading-none tracking-tighter flex items-center gap-2">
                <i class="pi pi-star-fill text-[#6f942e] text-xs"></i>
                SIRIUS STUDIO
                <span class="ml-2 bg-[#6f942e]/10 text-[#6f942e] text-[15px] px-3 py-1.5 mt-0 rounded border border-[#6f942e]/20 font-mono _uppercase tracking-widest">
                {{ siteContext }}
              </span>
              </h1>
              <span class="text-[8px] uppercase tracking-[0.4em] text-slate-600 font-bold">Workspace Engine</span>
            </div>
          </div>
          
          <div v-if="currentFile" class="flex flex-col">
            <span class="text-[9px] uppercase tracking-widest text-[#6f942e] font-black opacity-60">{{ currentFolder }}</span>
            <span class="text-xs font-mono text-slate-300">{{ currentFile }}</span>
          </div>
        </div>

        <div class="flex gap-3 z-10">
          <Button icon="pi pi-images" label="Galeria" text @click="showImageModal = true" class="p-button-sm text-[#6f942e] border border-[#6f942e]/10 hover:bg-[#6f942e]/5" />
          <Button label="Salvar Arquivo" icon="pi pi-save" severity="success" @click="saveFile" :disabled="!currentFile" class="bg-[#6f942e] border-none px-8 font-bold text-xs" />
         <Button icon="pi pi-sign-out" severity="danger" text @click="logout" title="Sair" />
        </div>
      </header>

      <div v-if="currentFile" class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)]">
        
        <aside class="lg:col-span-5 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          <div v-for="(value, key) in frontmatter" :key="key" class="bg-[#141b18] rounded-2xl border border-white/5 overflow-hidden shadow-lg">
            <div @click="toggleSection(key)" class="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 select-none transition-colors">
              <label class="text-[10px] font-black text-[#6f942e] uppercase tracking-[0.2em]">{{ key }}</label>
              <i :class="['pi pi-chevron-down text-[10px] text-slate-700 transition-transform', collapsedSections[key] ? '' : 'rotate-180']"></i>
            </div>

            <div v-show="!collapsedSections[key]" class="p-5 pt-0 border-t border-white/5 bg-black/10">
              <div v-if="Array.isArray(value)" class="mt-4">
                <draggable v-model="frontmatter[key]" item-key="index" handle=".drag-handle" ghost-class="ghost-item" class="space-y-3">
                  <template #item="{ element, index }">
                    <div class="flex items-start gap-3 bg-black/40 p-4 rounded-xl border border-white/5 group relative">
                      <div class="drag-handle cursor-grab pt-1"><i class="pi pi-bars text-sm text-slate-800 hover:text-[#6f942e]"></i></div>
                      <div v-if="typeof element === 'object' && element !== null" class="flex-1 space-y-4">
                        <div v-for="(v, field) in element" :key="field">
                          <label class="text-[8px] text-slate-600 uppercase font-bold block mb-1 tracking-widest">{{ field }}</label>
                          <textarea v-if="field === 'description' || v?.length > 40" v-model="element[field]" rows="2" class="w-full bg-transparent border-b border-white/5 text-sm py-1 outline-none focus:border-[#6f942e] resize-none"></textarea>
                          <input v-else v-model="element[field]" class="w-full bg-transparent border-b border-white/5 text-sm py-1 outline-none focus:border-[#6f942e]" />
                        </div>
                      </div>
                      <div v-else class="flex-1 pt-1">
                        <input v-model="frontmatter[key][index]" class="w-full bg-transparent border-b border-white/5 text-sm outline-none focus:border-[#6f942e]" />
                      </div>
                      <button @click="removeItem(key, index)" class="text-slate-800 hover:text-red-500 pt-1 transition-colors"><i class="pi pi-trash text-[10px]"></i></button>
                    </div>
                  </template>
                </draggable>
                <button @click="addItem(key, (value[0] && typeof value[0] === 'object'))" class="w-full py-3 border-2 border-dashed border-[#6f942e]/10 rounded-xl text-[9px] font-bold text-[#6f942e] hover:bg-[#6f942e]/5 mt-4 uppercase tracking-widest transition-all">+ Adicionar Item</button>
              </div>
              <div v-else-if="typeof value === 'object' && value !== null" class="mt-4 space-y-4">
                <div v-for="(v, field) in value" :key="field" class="bg-black/20 p-4 rounded-xl border border-white/5">
                  <label class="text-[8px] text-slate-600 uppercase font-bold block mb-1 tracking-widest">{{ field }}</label>
                  <input v-model="frontmatter[key][field]" class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e]" />
                </div>
              </div>
              <div v-else class="mt-4">
                <input v-model="frontmatter[key]" class="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:border-[#6f942e] outline-none" />
              </div>
            </div>
          </div>
        </aside>

        <main class="lg:col-span-7 bg-[#141b18] rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
          <div class="px-8 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
             <span class="text-[9px] uppercase tracking-[0.4em] font-black text-slate-600 italic">Body Content (Markdown)</span>
             <div class="flex gap-2">
               <span class="h-1.5 w-1.5 rounded-full bg-[#6f942e]"></span>
               <span class="h-1.5 w-1.5 rounded-full bg-white/10"></span>
             </div>
          </div>
          <textarea v-model="markdownBody" class="flex-1 p-10 bg-transparent text-indigo-50 font-mono text-[14px] leading-[1.8] outline-none resize-none custom-scrollbar" spellcheck="false" placeholder="Inicie a escrita do seu conteúdo aqui..."></textarea>
        </main>
      </div>

      <div v-else class="h-[75vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 text-center">
         <div class="w-20 h-20 bg-[#6f942e]/10 rounded-full flex items-center justify-center mb-6">
            <i class="pi pi-star text-[#6f942e] text-2xl animate-pulse"></i>
         </div>
         <h2 class="font-black text-xl tracking-tighter text-white uppercase">Sirius Studio Ready</h2>
         <p class="font-mono text-[10px] mt-2 uppercase tracking-[0.4em]">Selecione um arquivo no Explorer para começar</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(111, 148, 46, 0.2); border-radius: 10px; }
.ghost-item { opacity: 0.2; background: #6f942e33 !important; border: 1px dashed #6f942e !important; }

:deep(.p-drawer) { background-color: #141b18 !important; border-right: 1px solid rgba(255,255,255,0.05) !important; color: #cbd5e1 !important; }
:deep(.p-drawer-header) { background-color: #0a0f0d; padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
:deep(.p-dialog-header) { background-color: #141b18; border-bottom: 1px solid rgba(255,255,255,0.05); color: #6f942e; }
:deep(.p-dialog-content) { background-color: #0a0f0d; padding: 2rem; border-radius: 0 0 20px 20px; }
</style>