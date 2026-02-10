<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useToast } from "primevue/usetoast";
import yaml from "js-yaml";

// --- COMPONENTES ---
import AdminSidebar from "~/components/admin/Sidebar.vue";
import AdminMetaEditor from "~/components/admin/MetaEditor.vue";
import AdminMarkdownEditor from "~/components/admin/MarkdownEditor.vue";
import ImageExplorer from "~/components/admin/ImageExplorer.vue";
import CreateFileModal from "~/components/admin/modals/CreateFile.vue";
import CreateFolderModal from "~/components/admin/modals/CreateFolder.vue";

const siteContext = useCookie("cms_site_context");
const toast = useToast();

const settingsMenu = ref(); 
const markdownEditorRef = ref(null);

// --- MODAIS ---
const showCreateModal = ref(false);
const showFolderModal = ref(false);
const showBackupModal = ref(false);

definePageMeta({ layout: "" }); 

// =============================================================================
// 0. COMPUTEDS AUXILIARES
// =============================================================================
const currentFile = ref(""); 
const currentFolder = ref("content");
const fileData = ref({ frontmatter: {}, content: "" }); 
const fmSchema = ref("default");

// Identifica se é arquivo "crú" (YAML/TOML) ou Markdown
const isRawFile = computed(() => {
    if (!currentFile.value) return false;
    const lower = currentFile.value.toLowerCase();
    return lower.endsWith('.json') || 
           lower.endsWith('.yml') || 
           lower.endsWith('.yaml') || 
           lower.endsWith('.toml');
});

// =============================================================================
// 1. CONFIGURAÇÕES GERAIS
// =============================================================================
const settingsItems = ref([
    {
        label: 'SISTEMA',
        items: [
            {
                label: 'Ponto de Restauração',
                icon: 'pi pi-history',
                command: () => { showBackupModal.value = true; }
            },
            {
                label: 'Recompilar Site (Deploy)',
                icon: 'pi pi-cloud-upload',
                command: () => handlePublish() 
            }
        ]
    },
    { separator: true },
    {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => { /* Lógica de logout futura */ }
    }
]);

const toggleSettings = (event) => {
    settingsMenu.value.toggle(event);
};

const showFileManager = ref(true);

const { data: configFileData } = await useFetch("/api/admin/storage", {
  query: { folder: ".", file: "_config.json" },
  key: `site-config-${siteContext.value}`,
});

const userSiteUrl = computed(() => {
  try {
    const c = JSON.parse(configFileData.value?.content || "{}");
    return c.url ? (c.url.endsWith("/") ? c.url.slice(0, -1) : c.url) : "";
  } catch (e) { return ""; }
});

// =============================================================================
// 2. PARSE E NAVEGAÇÃO
// =============================================================================

// Função Parse atualizada para suportar Raw Files
const parseFile = (fullText, filename = "") => {
  if (!fullText) return { frontmatter: {}, content: "" };
  const normalized = fullText.replace(/\r\n/g, "\n");
  const lower = filename.toLowerCase();

  const isRaw = lower.endsWith('.yml') || 
                lower.endsWith('.yaml') || 
                lower.endsWith('.toml');
  
  if (isRaw) {
      return { frontmatter: {}, content: normalized, isRaw: true };
  }

  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    try { return { frontmatter: yaml.load(match[1]) || {}, content: match[2].trim() }; } 
    catch (e) { return { frontmatter: {}, content: normalized }; }
  }
  return { frontmatter: {}, content: normalized };
};

// Fetch do conteúdo do arquivo
const { data: rawFileContent } = await useAsyncData(
  'file-content',
  () => {
    if (!currentFile.value) return Promise.resolve(null);
    const folder = currentFile.value.substring(0, currentFile.value.lastIndexOf("/"));
    const filename = currentFile.value.split("/").pop();
    return $fetch("/api/admin/storage", {
      params: { site: siteContext.value, folder, file: filename }
    });
  },
  { watch: [currentFile] }
);

// Watcher para processar conteúdo carregado
watch(rawFileContent, (newVal) => {
  if (newVal?.content) {
    const parsed = parseFile(newVal.content, currentFile.value);
    fileData.value = parsed;
    
    // Se isRaw, esconde schema ("none"). Se não, usa frontmatter ou default.
    fmSchema.value = parsed.isRaw ? "none" : (parsed.frontmatter?.schema || "default");
    
    console.log(`Arquivo carregado. RAW: ${parsed.isRaw}. Schema: ${fmSchema.value}`);
  } else {
    fileData.value = { frontmatter: {}, content: "" };
    fmSchema.value = "default";
  }
});

// Fetch da lista de arquivos (Sidebar)
const { data: files, refresh: refreshFiles } = await useFetch("/api/admin/storage", {
  query: { site: siteContext, folder: currentFolder },
  watch: [currentFolder],
});
const sortedFiles = computed(() => files.value || []);

// --- HELPER: ENCONTRAR INDEX ALTERNATIVO ---
const findAlternativeIndex = async (folderPath) => {
    const candidates = ["_index.json", "_index.toml", "_index.yml", "_index.yaml", "_index.md"]; 
    for (const candidate of candidates) {
        try {
            await $fetch("/api/admin/storage", { 
                params: { site: siteContext.value, folder: folderPath, file: candidate }
            });
            return `${folderPath}/${candidate}`;
        } catch (e) { /* continue */ }
    }
    return null;
};

// --- NAVEGAÇÃO ---
const handleNavigate = {
    enterFolder: (f) => { currentFolder.value = `${currentFolder.value}/${f}`; },
    
    goBack: () => {
        const parts = currentFolder.value.split("/");
        if (parts.length > 1) { parts.pop(); currentFolder.value = parts.join("/"); }
    },
    
    changeRoot: (r) => { currentFolder.value = r; },
    
    selectFile: async (path) => {
        // 1. Resolve caminho completo inicial
        let fullPath = path.includes('/') ? path : `${currentFolder.value}/${path}`;
        
        // --- INTERCEPTAÇÃO: Se for _index.md, verifica se existe ou procura alternativas ---
        if (fullPath.endsWith('/_index.md') || fullPath.endsWith('/index.md')) {
             try {
                 const folderToCheck = fullPath.substring(0, fullPath.lastIndexOf("/"));
                 const filenameToCheck = fullPath.split("/").pop();
                 // Tenta carregar (head check)
                 await $fetch("/api/admin/storage", {
                      params: { site: siteContext.value, folder: folderToCheck, file: filenameToCheck }
                 });
             } catch (e) {
                 // Falhou ao abrir .md -> Procura alternativas (toml, yml)
                 const folderPath = fullPath.substring(0, fullPath.lastIndexOf("/"));
                 const altIndex = await findAlternativeIndex(folderPath);
                 if (altIndex) {
                     console.log(`[Redirecionamento] _index.md não encontrado. Abrindo: ${altIndex}`);
                     fullPath = altIndex;
                 }
             }
        }

        currentFile.value = fullPath;
        
        // 2. Identifica pastas
        const fileFolder = fullPath.substring(0, fullPath.lastIndexOf("/"));
        
        if (fileFolder === 'content') {
            currentFolder.value = 'content';
            return;
        }

        const parts = fileFolder.split('/');
        const folderName = parts.pop(); 
        const parentFolder = parts.join('/');

        // 3. Smart Resolve: Verifica se é um arquivo de índice (MD, TOML, YAML)
        const isIndexFile = /\/(_?index)\.(md|toml|yaml|yml)$/i.test(fullPath);

        if (isIndexFile) {
            try {
                const parentItems = await $fetch("/api/admin/storage", {
                    params: { site: siteContext.value, folder: parentFolder }
                });
                const folderObj = parentItems.find(f => f.name === folderName && f.isDirectory);

                if (folderObj && !folderObj.hasChildren) {
                    currentFolder.value = parentFolder;
                    return; 
                }
            } catch (e) {
                console.error("Erro ao verificar hasChildren:", e);
            }
        }
        
        // 4. Comportamento Padrão
        if (fileFolder !== currentFolder.value) {
            currentFolder.value = fileFolder;
        }
    }
};

// =============================================================================
// 3. SISTEMA DE PREVIEW & COMUNICAÇÃO
// =============================================================================
const previewWindow = ref(null);

const handlePreview = () => {
  if (!userSiteUrl.value) {
    toast.add({ severity: "warn", summary: "Sem URL", detail: 'Configure a "url" no _config.json', life: 2000 });
    return;
  }

  let cleanPath = currentFile.value || "";
  cleanPath = cleanPath.replace(/^content\/?/, "");
  cleanPath = cleanPath.replace(/\/_index\.(md|toml|yaml|yml)$/, "").replace(/\/_index$/, "");
  cleanPath = cleanPath.replace(/\/index\.(md|toml|yaml|yml)$/, "").replace(/\/index$/, "");
  cleanPath = cleanPath.replace(/\.(md|toml|yaml|yml)$/, "");

  if (cleanPath === "") cleanPath = "/";
  if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;

  const finalUrl = `${userSiteUrl.value}${cleanPath}?preview=true`;
  previewWindow.value = window.open(finalUrl, "sirius_preview");
};

const sendPreviewUpdate = () => {
  if (!previewWindow.value || previewWindow.value.closed) return;
  previewWindow.value.postMessage({
    type: "SIRIUS_PREVIEW_UPDATE",
    data: {
      title: fileData.value.frontmatter.title,
      description: fileData.value.frontmatter.description,
      body: fileData.value.content,
      frontmatter: fileData.value.frontmatter,
    },
  }, "*");
};

let debounceTimer = null;
watch(fileData, () => { 
    clearTimeout(debounceTimer); 
    debounceTimer = setTimeout(sendPreviewUpdate, 200); 
}, { deep: true });

// Listener para Smart Redirect vindo do Preview
const handleMessageFromPreview = async (event) => {
  if (event.data?.type === 'SIRIUS_EDIT_REQUEST') {
    let fileToEdit = event.data.filepath;
    
    if (fileToEdit) {
      const isStandardContent = fileToEdit.match(/\.(md|toml|yaml|yml)$/i);
      const isAlreadyIndex = fileToEdit.match(/(_index|index)\.(md|toml|yaml|yml)$/i);

      if (isStandardContent && !isAlreadyIndex) {
         const possibleFolder = fileToEdit.replace(/\.(md|toml|yaml|yml)$/i, ""); 
         
         // Usa o helper para achar o index correto daquela pasta
         const realIndex = await findAlternativeIndex(possibleFolder);
         
         if (realIndex) {
             fileToEdit = realIndex;
         } else {
             // Fallback padrão se nada for encontrado
             fileToEdit = `${possibleFolder}/_index.md`;
         }
      }
      handleNavigate.selectFile(fileToEdit);
    }
  }
};

onMounted(() => {
  window.addEventListener("message", handleMessageFromPreview);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessageFromPreview);
  window.removeEventListener("keydown", handleKeydown);
});

// =============================================================================
// 4. IMAGENS & AÇÕES
// =============================================================================
const showImageModal = ref(false);
const imageTarget = ref(null); 

const imageActions = {
  open: (target) => {
    if (!target) {
        imageTarget.value = { mode: "markdown" };
    } else if (target.mode === 'push') {
        imageTarget.value = { mode: "push", list: target.list };
    } else {
        imageTarget.value = { mode: "set", obj: target.obj, key: target.key };
    }
    showImageModal.value = true;
  },

  handleSelect: (finalPath) => {
    const t = imageTarget.value;
    if (t.mode === "markdown") {
        if (markdownEditorRef.value) {
            markdownEditorRef.value.insertAtCursor(`![](${finalPath})`);
        } else {
            fileData.value.content += `\n![](${finalPath})`;
        }
    } else if (t.mode === "set") {
        t.obj[t.key] = finalPath;
    } else if (t.mode === "push") {
        t.list.push(finalPath);
    }
    showImageModal.value = false;
    sendPreviewUpdate();
  },
};

// =============================================================================
// 5. SALVAR & PUBLICAR
// =============================================================================
const saveFile = async () => {
    if (!currentFile.value) return;
    try {
        let finalContent = "";
        const folder = currentFile.value.substring(0, currentFile.value.lastIndexOf("/"));
        const filename = currentFile.value.split("/").pop();

        if (isRawFile.value) {
            // RAW: Salva o conteúdo direto sem frontmatter
            finalContent = fileData.value.content;
        } else {
            // MD: Monta frontmatter + content
            const yamlPart = yaml.dump(fileData.value.frontmatter, { indent: 2, lineWidth: -1, noRefs: true });
            finalContent = `---\n${yamlPart.trim()}\n---\n\n${fileData.value.content}`;
        }

        await $fetch("/api/admin/storage", { method: "POST", body: { site: siteContext.value, folder, file: filename, content: finalContent } });
        toast.add({ severity: "success", summary: "Salvo com sucesso!", life: 1000 });
    } catch (e) { toast.add({ severity: "error", summary: "Erro ao salvar" }); }
};

const loadingPublish = ref(false);
const handlePublish = async () => {
  loadingPublish.value = true;
  toast.add({ severity: "info", summary: "Publicando...", detail: "Gerando arquivos estáticos...", life: 2000 });
  try {
    const result = await $fetch("/api/admin/compile-all", { method: "POST", body: { site: siteContext.value } });
    if (result.success) {
        toast.add({ severity: "success", summary: "Sucesso!", detail: "Site publicado.", life: 2000 });
    } else {
        throw new Error(result.message || "Erro desconhecido.");
    }
  } catch (error) {
    toast.add({ severity: "error", summary: "Erro", detail: "Falha ao publicar.", life: 2000 });
  } finally {
    loadingPublish.value = false;
  }
};

const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    if (currentFile.value) saveFile();
  }
};

// =============================================================================
// 6. UI RESIZE & SCHEMA
// =============================================================================
const fileManagerWidth = ref(320); 
const isResizingSidebar = ref(false);
const startSidebarResize = () => {
  isResizingSidebar.value = true;
  document.body.style.cursor = 'col-resize';
  window.addEventListener('mousemove', handleSidebarMouseMove);
  window.addEventListener('mouseup', stopSidebarResize);
};
const handleSidebarMouseMove = (e) => {
  const newWidth = e.clientX - 48;
  if (newWidth > 200 && newWidth < 600) fileManagerWidth.value = newWidth;
};
const stopSidebarResize = () => {
  isResizingSidebar.value = false;
  document.body.style.cursor = '';
  window.removeEventListener('mousemove', handleSidebarMouseMove);
  window.removeEventListener('mouseup', stopSidebarResize);
};

const frontmatterWidth = ref(350); 
const isResizingFrontmatter = ref(false); 
const startResizeFrontmatter = () => {
  isResizingFrontmatter.value = true;
  document.body.style.cursor = 'col-resize';
  window.addEventListener('mousemove', handleFrontmatterMouseMove);
  window.addEventListener('mouseup', stopResizeFrontmatter);
};
const handleFrontmatterMouseMove = (e) => {
  const newWidth = window.innerWidth - e.clientX;
  if (newWidth > 250 && newWidth < 800) frontmatterWidth.value = newWidth; 
};
const stopResizeFrontmatter = () => {
  isResizingFrontmatter.value = false;
  document.body.style.cursor = '';
  window.removeEventListener('mousemove', handleFrontmatterMouseMove);
  window.removeEventListener('mouseup', stopResizeFrontmatter);
};

// Carregamento de Schema (Campos laterais)
const { data: schemaData } = await useFetch("/api/admin/schema", {
  query: { site: siteContext, schema: computed(() => fmSchema.value) },
  watch: [fmSchema, currentFile],
});

const fields = computed(() => {
  if (!schemaData.value) return [];
  return schemaData.value.fields || [];
});

const editorCtxFolder = computed(() => {
  if (!currentFile.value) return currentFolder.value;
  const lastSlash = currentFile.value.lastIndexOf("/");
  return lastSlash !== -1 ? currentFile.value.substring(0, lastSlash) : "content";
});

const createActions = {
  openFile: () => { showCreateModal.value = true; },
  openFolder: () => { showFolderModal.value = true; },
  onFileCreated: async (filename) => {
      await refreshFiles();
      if(filename) handleNavigate.selectFile(filename);
  },
  onFolderCreated: async () => {
      await refreshFiles();
  }
};

const goToBackup = () => { showBackupModal.value = true; };

// User Menu
const userMenu = ref();
const userMenuItems = ref([
    { label: 'Perfil', icon: 'pi pi-user', disabled: true },
    { separator: true },
    { label: 'Sair do Sistema', icon: 'pi pi-power-off', class: 'text-red-400', command: () => handleLogout() }
]);
const handleLogout = () => {
    const cookie = useCookie('cms_site_context');
    cookie.value = null;
    navigateTo('/');
};
const toggleUserMenu = (event) => userMenu.value.toggle(event);

</script>

<template>
  <div class="h-screen w-screen bg-[#0a0f0d] text-slate-300 flex flex-col overflow-hidden font-sans">
    
<header class="h-14 bg-[#141b18] border-b border-white/5 shrink-0 flex items-center justify-between px-4 z-20 select-none shadow-sm relative overflow-hidden">
    
    <div class="flex items-center">
        <div class="flex items-center gap-2 cursor-default group mr-4">
            <i class="pi pi-star-fill text-[#6f942e] text-sm group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_6px_rgba(111,148,46,0.5)]"></i>
            <div _class="flex flex-col leading-none">
                <span class="font-black text-slate-200 text-lg tracking-tight group-hover:text-white transition-colors">Sirius</span>
                <span class="text-[14px] text-[#6f942e]/80 font-bold group-hover:text-[#6f942e] transition-colors pl-2">Studio</span>
            </div>
        </div>
        <div 
            class="flex items-center gap-2 mt-0 px-3 py-0.5 rounded-full bg-[#0a0f0d]/50 border border-white/10 group/ctx hover:border-[#6f942e]/50 transition-colors cursor-default"
            v-tooltip.bottom="'Site que você está editando'"
        >
            <div class="w-1.5 h-1.5 rounded-full bg-[#6f942e] animate-pulse shadow-[0_0_6px_#6f942e]"></div>
            <span class="text-xs font-mono text-slate-300 font-medium tracking-tight group-hover/ctx:text-white transition-colors">
                {{ siteContext }}
            </span>
        </div>
    </div>

    <div class="flex items-center gap-3">
        <div class="relative">
            <button 
                @click="toggleUserMenu"
                aria-haspopup="true" 
                aria-controls="user_menu"
                class="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 transition-all group"
            >
                <div class="hidden md:flex flex-col items-end leading-none">
                    <span class="text-[11px] font-bold text-slate-300 group-hover:text-white">Admin</span>
                </div>
                <div class="w-8 h-8 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-800 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <i class="pi pi-user text-zinc-400 text-xs"></i>
                </div>
            </button>
            <Menu ref="userMenu" id="user_menu" :model="userMenuItems" :popup="true" class="w-48 mt-2" />
        </div>
    </div>
</header>

    <div class="flex-1 flex flex-row overflow-hidden relative">
      
      <aside class="w-12 h-full bg-[#141b19] border-r border-white/5 flex flex-col items-center py-3 shrink-0 z-30 gap-4">
         <button @click="showFileManager = !showFileManager" class="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 group relative" :class="showFileManager ? 'bg-[#6f942e]/10 text-[#6f942e]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'" title="Explorador">
            <i class="pi pi-folder text-lg"></i>
            <div v-if="showFileManager" class="absolute left-0 top-2 bottom-2 w-[2px] bg-[#6f942e] rounded-r-full"></div>
         </button>
         
      <button 
        @click="goToBackup" 
        aria-haspopup="true" 
        aria-controls="overlay_menu"
        class="w-8 h-8 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        title="Configurações"
    >
        <i class="pi pi-cog text-lg"></i>
    </button>

    <Menu ref="settingsMenu" id="overlay_menu" :model="settingsItems" :popup="true" class="w-64" />
    <div class="flex-1"></div>
    </aside>

      <div 
        v-show="showFileManager"
        class="h-full bg-[#111614] border-r border-white/5 flex flex-col shrink-0 z-10 transition-none"
        :style="{ width: fileManagerWidth + 'px' }" 
      >
         <AdminSidebar
            :site-context="siteContext"
            :visible="true"
            :files="sortedFiles"
            :current-folder="currentFolder"
            :current-file="currentFile"
            @refresh="refreshFiles()"
            @navigate="handleNavigate.enterFolder"
            @select="handleNavigate.selectFile"
            @back="handleNavigate.goBack"
            @change-root="handleNavigate.changeRoot"
            @create-file="createActions.openFile"
            @create-folder="createActions.openFolder"
            class="w-full h-full"
         />
      </div>

      <div 
        v-show="showFileManager"
        class="w-[4px] h-full cursor-col-resize hover:bg-[#6f942e] active:bg-[#6f942e] bg-transparent z-20 shrink-0 -ml-[2px] transition-colors"
        @mousedown.prevent="startSidebarResize"
      ></div>
      <div v-if="isResizingSidebar" class="fixed inset-0 z-50 cursor-col-resize bg-transparent"></div>

      <main class="flex-1 flex flex-col min-w-0 bg-[#0a0f0d] relative">
         <slot name="workspace-content">
             
             <div v-if="currentFile" class="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0f0d] shrink-0">
                 <div class="flex items-center gap-2 text-xs font-mono text-slate-400 overflow-hidden">
                     <i class="pi pi-file text-[#6f942e]"></i>
                     <span class="truncate select-all">{{ currentFile }}</span>
                 </div>
                 
                 <div class="flex items-center bg-white/5 rounded-lg p-1 border border-white/5 gap-1">
                    <button 
                       @click="saveFile" 
                       class="flex items-center gap-2 px-3 py-1.5 bg-[#6f942e] hover:bg-[#5a7a23] text-black font-bold text-xs rounded transition-colors"
                       title="Salvar alterações (CTRL+S)"
                    >
                        <i class="pi pi-save"></i> 
                        <span>Salvar</span>
                    </button>

                    <div class="w-[1px] h-4 bg-white/10 mx-0.5"></div>

                    <button 
                       @click="handlePreview" 
                       class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs rounded transition-colors" 
                       title="Visualizar no Site"
                    >
                        <i class="pi pi-eye"></i>
                        <span>Preview</span>
                    </button>

                    <div class="w-[1px] h-4 bg-white/10 mx-0.5"></div>

                    <button 
                       @click="handlePublish" 
                       :disabled="loadingPublish"
                       class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-wait"
                       title="Gerar e Publicar o site completo"
                    >
                        <i class="pi" :class="loadingPublish ? 'pi-spin pi-spinner' : 'pi-cloud-upload'"></i> 
                        <span>{{ loadingPublish ? 'Gerando...' : 'Publicar' }}</span>
                    </button>
                </div>
             </div>
             <div v-else class="h-12 border-b border-white/5 bg-[#0a0f0d]"></div>

           <div v-if="currentFile" class="flex-1 flex flex-row overflow-hidden relative">
                
                 <div class="flex-1 flex flex-col bg-[#0a0f0d] min-w-0 h-full relative">
                     <AdminMarkdownEditor 
                        ref="markdownEditorRef"
                        class="w-full h-full" 
                        :content="fileData.content" 
                        @update:content="fileData.content = $event" 
                        :site-context="siteContext"
                        :current-folder="currentFolder" 
                        :current-file="currentFile" 
                        @open-image="imageActions.open()"
                     />
                 </div>

                 <div 
                    class="w-[4px] h-full cursor-col-resize hover:bg-[#6f942e] active:bg-[#6f942e] bg-black/40 z-20 shrink-0 transition-colors flex items-center justify-center group -mr-[2px] relative"
                    @mousedown.prevent="startResizeFrontmatter" 
                 >
                    <div class="w-[1px] h-8 bg-white/20 group-hover:bg-white/80 rounded-full"></div>
                 </div>

                <div 
                    v-if="!isRawFile && fields.length > 0" 
                    class="flex flex-col bg-[#141b18] border-l border-white/5 shrink-0 h-full" 
                    :style="{ width: frontmatterWidth + 'px' }"
                >
                    <div class="flex-1 overflow-y-auto custom-scrollbar">
                        <AdminMetaEditor 
                            v-if="fields.length > 0"
                            :modelValue="fileData.frontmatter"
                            :frontmatter="fileData.frontmatter" 
                            :fields="fields"
                            :site-context="siteContext"
                            :current-folder="editorCtxFolder"
                            :site-url="userSiteUrl"
                            @open-image="imageActions.open"
                            class="h-full"
                        />
                    </div>
                </div>

                 <div v-if="isResizingFrontmatter" class="fixed inset-0 z-50 cursor-col-resize bg-transparent"></div>
             </div>

             <div v-else class="flex-1 flex items-center justify-center flex-col opacity-20 select-none">
                 <i class="pi pi-folder-open text-6xl mb-4"></i>
                 <p>Selecione um arquivo</p>
             </div>
         </slot>
      </main>

    </div>

    <footer class="h-6 bg-[#141b18] border-t border-white/5 shrink-0 flex items-center justify-between px-3 text-[10px] text-slate-500 z-20 font-mono">
    </footer>


    <Dialog
      v-model:visible="showImageModal"
      modal
      header="Galeria de Mídia"
      :showHeader="false"
      :style="{ width: '85vw', maxWidth: '1200px' }"
      :contentStyle="{ padding: 0, borderRadius: '8px', overflow: 'hidden' }"
      class="bg-[#141b18]"
      :dismissableMask="true"
    >
      <div class="h-[80vh] bg-[#141b18] flex flex-col">
          <div class="p-4 border-b border-white/5 flex justify-between items-center bg-[#111614]">
              <span class="font-bold text-slate-200">Selecionar Mídia</span>
              <button @click="showImageModal = false" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400">
                  <i class="pi pi-times"></i>
              </button>
          </div>

          <ImageExplorer
            v-if="showImageModal"
            :initial-folder="editorCtxFolder"
            @select="imageActions.handleSelect"
            @close="showImageModal = false"
            class="flex-1 overflow-hidden"
          />
      </div>
    </Dialog>
     <CreateFileModal
      v-model:visible="showCreateModal"
      :site-context="siteContext"
      :current-folder="currentFolder"
      @success="createActions.onFileCreated"
    />

    <CreateFolderModal
      v-model:visible="showFolderModal"
      :site-context="siteContext"
      :current-folder="currentFolder"
      @success="createActions.onFolderCreated"
    />

     <Dialog
      v-model:visible="showBackupModal"
      modal
      header="Gerenciador de pontos de restauração"
      :style="{ width: '800px', maxWidth: '95vw' }"
      class="bg-[#141b18]"
      :dismissableMask="true"
    >
      <BackupManager />
    </Dialog>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(111, 148, 46, 0.5); }
</style>