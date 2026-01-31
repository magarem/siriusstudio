<script setup>
import yaml from "js-yaml";
import { useToast } from "primevue/usetoast";

// --- COMPONENTES MODULARIZADOS ---
import CreateFileModal from "~/components/admin/modals/CreateFile.vue";
import CreateFolderModal from "~/components/admin/modals/CreateFolder.vue";
import RawEditor from "~/components/admin/editors/RawEditor.vue";
import VisualSplitEditor from "~/components/admin/editors/VisualSplitEditor.vue";
import AdminSidebar from "~/components/admin/Sidebar.vue";
import AdminTopbar from "~/components/admin/Topbar.vue";
import ImageExplorer from "~/components/admin/ImageExplorer.vue";
import DashboardHome from "~/components/admin/DashboardHome.vue";
import FileToolbar from "~/components/admin/FileToolbar.vue";
import BackupManager from "~/components/admin/BackupManager.vue";

const config = useRuntimeConfig();
definePageMeta({ layout: "" });

const toast = useToast();
const route = useRoute();
const siteContext = useCookie("cms_site_context");

// --- ESTADOS DE UI & NAVEGAÇÃO ---
const showSidebar = ref(false);
const showMetaSidebar = ref(true);
const showRawMode = ref(false);

// O arquivo atual sendo editado (caminho completo: "content/pasta/_index.md")
const currentFile = ref(route.query.file || ""); 

// A pasta que a sidebar está mostrando atualmente (pode ser diferente da pasta do arquivo)
const currentSidebarFolder = ref(route.query.folder || "content");

// --- COMPUTEDS DE CAMINHO ---

// Pasta de contexto do arquivo atual (Onde estão as imagens deste post)
// Ex: Se currentFile = "content/atrativos/bistro/_index.md", retorna "content/atrativos/bistro"
const editorCtxFolder = computed(() => {
  if (!currentFile.value) return currentSidebarFolder.value;
  const lastSlash = currentFile.value.lastIndexOf("/");
  return lastSlash !== -1 ? currentFile.value.substring(0, lastSlash) : "content";
});

const currentFileNameOnly = computed(() => {
  if (!currentFile.value) return "";
  return currentFile.value.split("/").pop();
});

const fileExtension = computed(() => {
  if (!currentFile.value) return "md";
  return currentFile.value.split(".").pop().toLowerCase();
});

// --- ESTADOS DE DADOS ---
const form = ref({ frontmatter: {}, content: "" });
const rawContent = ref("");
const loadingSave = ref(false);
const loadingPublish = ref(false);

// --- MODAIS ---
const showCreateModal = ref(false);
const showFolderModal = ref(false);
const showImageModal = ref(false);
const showBackupModal = ref(false);
const imageTarget = ref(null);

// =============================================================================
// 1. DATA FETCHING
// =============================================================================

// CONFIGURAÇÃO DO SITE (_config.json)
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

// LISTA DE ARQUIVOS (Para a Sidebar)
const { data: files, refresh: refreshFiles } = await useFetch("/api/admin/storage", {
  query: { site: siteContext, folder: currentSidebarFolder },
  watch: [currentSidebarFolder],
});
const sortedFiles = computed(() => files.value || []);

// LISTA DE TODAS AS PASTAS (Para Mover/Navegar no Toolbar)
const { data: allFolders, refresh: refreshFolders } = await useFetch("/api/admin/folders", {
  query: { site: siteContext },
  key: `folders-${siteContext.value}`,
});

// CONTEÚDO DO ARQUIVO ATUAL
const { data: fileData, error: fileError } = await useAsyncData(
  "file-content",
  () => {
    if (!currentFile.value) return Promise.resolve(null);
    return $fetch("/api/admin/storage", {
      params: { 
        site: siteContext.value, 
        folder: editorCtxFolder.value, // Busca na pasta correta
        file: currentFileNameOnly.value 
      },
    });
  },
  { watch: [currentFile] }
);

// SCHEMA (Campos do Editor Visual)
const { data: schemaData } = await useFetch("/api/admin/schema", {
  query: { 
    site: siteContext, 
    folder: editorCtxFolder, 
    filename: currentFileNameOnly 
  },
  watch: [editorCtxFolder, currentFile],
});

// =============================================================================
// 2. PARSING & EDITOR LOGIC
// =============================================================================

const currentModel = computed(() => {
  if (!schemaData.value) return { fields: [] };
  const fmSchema = form.value.frontmatter?.schema;
  const mapSchema = schemaData.value.mapping?.[currentFileNameOnly.value];
  const typeKey = fmSchema || mapSchema || "default";
  return schemaData.value.types?.[typeKey] || { fields: [] };
});

const parseMD = (full) => {
  if (!full) {
    form.value = { frontmatter: {}, content: "" };
    rawContent.value = "";
    return;
  }
  const ext = fileExtension.value;

  // JSON/YAML puro
  if (['json', 'yml', 'yaml'].includes(ext)) {
    rawContent.value = full;
    showRawMode.value = true;
    try {
      if (ext === 'json') form.value.frontmatter = JSON.parse(full);
      else form.value.frontmatter = yaml.load(full) || {};
    } catch (e) { form.value.frontmatter = {}; }
    return;
  }

  // Markdown + Frontmatter
  const normalized = full.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (match) {
    try { form.value.frontmatter = yaml.load(match[1]) || {}; } catch (e) { form.value.frontmatter = {}; }
    form.value.content = match[2].trim();
  } else {
    // Tenta fallback simples ou considera tudo conteúdo
    if (normalized.startsWith("---")) {
        const parts = normalized.split("---");
        if(parts.length >= 3) {
            try { form.value.frontmatter = yaml.load(parts[1]) || {}; } catch(e){}
            form.value.content = parts.slice(2).join("---").trim();
        } else {
            form.value = { frontmatter: {}, content: normalized };
        }
    } else {
        form.value = { frontmatter: {}, content: normalized };
    }
  }
  rawContent.value = full;
};

// Carrega conteúdo quando o arquivo muda
watch(fileData, (newData) => {
    parseMD(newData?.content || "");
}, { immediate: true });

// Atualiza RawContent quando o visual muda (para salvar)
const getCleanData = () => JSON.parse(JSON.stringify(form.value.frontmatter));

// =============================================================================
// 3. PREVIEW SYSTEM
// =============================================================================
const previewWindow = ref(null);

const handlePreview = () => {
  if (!userSiteUrl.value) {
    toast.add({ severity: "warn", summary: "Sem URL", detail: 'Configure a "url" no _config.json', life: 3000 });
    return;
  }

  // 1. Limpeza do path para URL amigável
  let cleanPath = currentFile.value || "";
  
  // Remove prefixo de pasta de conteúdo
  cleanPath = cleanPath.replace(/^content\/?/, "");
  
  // Remove arquivo de índice (o sistema de rotas esconde isso)
  cleanPath = cleanPath.replace(/\/_index\.md$/, "").replace(/\/_index$/, "");
  cleanPath = cleanPath.replace(/\/index\.md$/, "").replace(/\/index$/, "");
  cleanPath = cleanPath.replace(/\.md$/, "");

  // Home Page
  if (cleanPath === "") cleanPath = "/";
  if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;

  const finalUrl = `${userSiteUrl.value}${cleanPath}?preview=true`;
  console.log("Opening Preview:", finalUrl);
  
  previewWindow.value = window.open(finalUrl, "sirius_preview");
};

const sendPreviewUpdate = () => {
  if (!previewWindow.value || previewWindow.value.closed) return;
  previewWindow.value.postMessage({
    type: "SIRIUS_PREVIEW_UPDATE",
    data: {
      title: form.value.frontmatter.title,
      description: form.value.frontmatter.description,
      body: showRawMode.value ? rawContent.value : form.value.content,
      frontmatter: form.value.frontmatter,
    },
  }, "*");
};

let debounceTimer = null;
watch(form, () => { 
    clearTimeout(debounceTimer); 
    debounceTimer = setTimeout(sendPreviewUpdate, 200); 
}, { deep: true });

watch(rawContent, () => {
  if (showRawMode.value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try { parseMD(rawContent.value); } catch (e) {}
      sendPreviewUpdate();
    }, 200);
  }
});

// Listener para receber pedidos de edição vindos do Preview
onMounted(() => {
  window.addEventListener("message", handleMessageFromPreview);
  // Sincroniza sidebar se carregou com arquivo na URL
  if (currentFile.value) {
      const folder = currentFile.value.substring(0, currentFile.value.lastIndexOf("/"));
      if (folder) currentSidebarFolder.value = folder;
  }
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessageFromPreview);
});

const handleMessageFromPreview = (event) => {
  if (event.data?.type === 'SIRIUS_EDIT_REQUEST') {
    const fileToEdit = event.data.filepath;
    if (fileToEdit) {
      navigate.selectFile(fileToEdit);
    }
  }
};

// =============================================================================
// 4. ACTIONS & NAVIGATION
// =============================================================================

const navigate = {
  enterFolder: (f) => { 
    alert(f);
    currentSidebarFolder.value = `${currentSidebarFolder.value}/${f}`; 
  },
  goBack: () => {
    const parts = currentSidebarFolder.value.split("/");
    if (parts.length > 1) { parts.pop(); currentSidebarFolder.value = parts.join("/"); }
  },
  selectFile: (path) => {
    // Normaliza caminho
    const fullPath = path.startsWith("content") || path.includes("/") 
        ? path 
        : `${currentSidebarFolder.value}/${path}`;
    
    currentFile.value = fullPath;
    
    // Atualiza a sidebar para mostrar a pasta do arquivo (UX)
    const folderOfFile = fullPath.substring(0, fullPath.lastIndexOf("/"));
    if (folderOfFile) currentSidebarFolder.value = folderOfFile;

    // Atualiza URL
    window.history.pushState({}, "", `?file=${fullPath}`);
    // showSidebar.value = false; // Fecha sidebar no mobile
    showRawMode.value = false; // Reseta modo visual
  },
  changeRoot: (r) => { currentSidebarFolder.value = r; },
  toDashboard: () => {
    currentFile.value = "";
    navigateTo("/edit");
  },
};

const createActions = {
  openFile: () => { showCreateModal.value = true; },
  openFolder: () => { showFolderModal.value = true; },
  onFileCreated: async (filename) => {
      await refreshFiles();
      if(filename) navigate.selectFile(filename);
  },
  onFolderCreated: async () => {
      await refreshFiles();
      await refreshFolders();
  }
};

const imageActions = {
  open: (target) => {
    // target = { list: [] } ou { obj: {}, key: '' } ou null (markdown)
    if (!target) imageTarget.value = { mode: "markdown" };
    else if (Array.isArray(target.list)) imageTarget.value = { mode: "push", list: target.list };
    else imageTarget.value = { mode: "set", obj: target.obj, key: target.key };
    showImageModal.value = true;
  },
  handleSelect: (finalPath) => {
    // O ImageExplorer já retorna o path correto (nome se local, full path se externo)
    if (showRawMode.value) {
        rawContent.value += `\n![](${finalPath})`;
    } else {
      const t = imageTarget.value;
      if (t.mode === "markdown") form.value.content += `\n![](${finalPath})`;
      else if (t.mode === "set") t.obj[t.key] = finalPath;
      else if (t.mode === "push") t.list.push(finalPath);
    }
    showImageModal.value = false;
    sendPreviewUpdate();
  },
};

const saveFile = async () => {
  if (!currentFile.value) return;
  loadingSave.value = true;
  let finalContent = "";
  const ext = fileExtension.value;

  if (showRawMode.value) {
    finalContent = rawContent.value;
    // Validação básica
    try {
      if (ext === 'json') JSON.parse(finalContent);
      if (ext === 'yml' || ext === 'yaml') yaml.load(finalContent);
    } catch (e) {
      toast.add({ severity: "error", summary: "Erro de Sintaxe", detail: "Corrija o formato antes de salvar." });
      loadingSave.value = false;
      return;
    }
  } else {
    // Converte Visual -> Texto
    const cleanData = getCleanData();
    if (ext === 'json') finalContent = JSON.stringify(cleanData, null, 2);
    else if (ext === 'yml' || ext === 'yaml') finalContent = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
    else {
      // Markdown
      const y = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
      const contentPart = form.value.content ? `\n\n${form.value.content.trim()}` : "";
      finalContent = `---\n${y.trim()}\n---${contentPart}`;
    }
  }

  try {
    await $fetch("/api/admin/storage", {
      method: "POST",
      body: {
        site: siteContext.value,
        folder: editorCtxFolder.value,
        file: currentFileNameOnly.value,
        content: finalContent,
      },
    });
    toast.add({ severity: "success", summary: "Salvo", detail: "Arquivo atualizado.", life: 1000 });
    if (!showRawMode.value) rawContent.value = finalContent;
  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Erro ao salvar" });
  } finally {
    loadingSave.value = false;
  }
};

const handlePublish = async () => {
  loadingPublish.value = true;
  toast.add({ severity: "info", summary: "Publicando...", detail: "Gerando arquivos...", life: 2000 });

  try {
    const result = await $fetch("/api/admin/compile-all", {
      method: "POST",
      body: { site: siteContext.value },
    });
    if (result.success) toast.add({ severity: "success", summary: "Sucesso!", detail: "Site atualizado.", life: 3000 });
    else throw new Error(result.message);
  } catch (error) {
    console.error(error);
    toast.add({ severity: "error", summary: "Erro", detail: "Falha ao publicar." });
  } finally {
    loadingPublish.value = false;
  }
};

// Ações de arquivo (Delete, Rename, Move) disparadas pelo FileToolbar
const handleFileToolbarActions = {
    delete: async () => {
        try {
            await $fetch("/api/admin/storage", { method: "DELETE", body: { folder: editorCtxFolder.value, file: currentFileNameOnly.value } });
            toast.add({ severity: "success", summary: "Excluído" });
            navigate.toDashboard();
            await refreshFiles();
        } catch(e) { toast.add({ severity: "error", summary: "Erro ao excluir" }); }
    },
    rename: async (newName) => {
        try {
            const res = await $fetch("/api/admin/rename", { 
                method: "POST", 
                body: { oldname: currentFile.value, newname: `${editorCtxFolder.value}/${newName}` } 
            });
            toast.add({ severity: "success", summary: "Renomeado" });
            if(res?.newname) navigate.selectFile(res.newname);
            await refreshFiles();
        } catch(e) { toast.add({ severity: "error", summary: "Erro ao renomear" }); }
    },
    move: async (newPath) => {
        try {
            await $fetch("/api/admin/rename", { method: "POST", body: { oldname: currentFile.value, newname: newPath } });
            toast.add({ severity: "success", summary: "Movido" });
            navigate.selectFile(newPath);
            await refreshFiles();
        } catch(e) { toast.add({ severity: "error", summary: "Erro ao mover" }); }
    }
};

const logout = () => { siteContext.value = null; navigateTo("/login"); };

// Atalho CTRL+S
const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    if (currentFile.value) saveFile();
  }
};
onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template>
  <div class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30 flex flex-col">
    <Toast />

    <AdminSidebar
      :site-context="siteContext"
      v-model:visible="showSidebar"
      :files="sortedFiles"
      :current-folder="currentSidebarFolder"
      :current-file="currentFile"
      @refresh="refreshFiles()"
      @navigate="navigate.enterFolder"
      @select="navigate.selectFile"
      @back="navigate.goBack"
      @change-root="navigate.changeRoot"
      @create-file="createActions.openFile"
      @create-folder="createActions.openFolder"
    />

    <AdminTopbar
      :site-context="siteContext"
      :site-url="userSiteUrl"
      :current-folder="editorCtxFolder"
      :current-file="currentFileNameOnly"
      :loading-save="loadingSave"
      :loading-publish="loadingPublish"
      @toggle-sidebar="showSidebar = true"
      @save="saveFile"
      @publish="handlePublish"
      @preview="handlePreview"
      @logout="logout"
      @open-media="imageActions.open()"
      @go-dashboard="navigate.toDashboard"
      @open-backup="showBackupModal = true"
    />

    <div class="flex-1 p-4 md:p-6 max-w-[1700px] mx-auto w-full">
      
      <div v-if="currentFile" class="flex flex-col h-[calc(100vh-120px)]">
        
        <FileToolbar
          :filename="currentFileNameOnly"
          :filepath="currentFile"
          :is-raw="showRawMode"
          :show-meta="showMetaSidebar"
          :all-folders="allFolders || []"
          @rename="handleFileToolbarActions.rename"
          @move="handleFileToolbarActions.move"
          @delete="handleFileToolbarActions.delete"
          @toggle-raw="showRawMode = !showRawMode"
          @media="imageActions.open()"
          @navigate-file="(path) => navigate.selectFile(path)"
          @toggle-meta="showMetaSidebar = !showMetaSidebar"
        />

        <RawEditor
            v-if="showRawMode"
            v-model="rawContent"
        />

        <VisualSplitEditor
            v-else
            :frontmatter="form.frontmatter"
            :content="form.content"
            @update:content="form.content = $event"
            :fields="currentModel.fields"
            :site-context="siteContext"
            :current-folder="editorCtxFolder"
            :current-file="currentFile"
            :show-meta="showMetaSidebar"
            @open-image="imageActions.open"
        />
      </div>

      <div v-else class="h-[calc(100vh-120px)] w-full">
        <DashboardHome
          :site-context="siteContext"
          :current-folder="currentSidebarFolder"
          :files="sortedFiles"
          @navigate="(path) => { if (path.endsWith('.md')) navigate.selectFile(path); else navigate.enterFolder(path); }"
          @create-file="createActions.openFile"
          @open-media="imageActions.open()"
          @publish="handlePublish"
        />
      </div>
    </div>

    <CreateFileModal
      v-model:visible="showCreateModal"
      :site-context="siteContext"
      :current-folder="currentSidebarFolder"
      @success="createActions.onFileCreated"
    />

    <CreateFolderModal
      v-model:visible="showFolderModal"
      :site-context="siteContext"
      :current-folder="currentSidebarFolder"
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

    <Dialog
      v-model:visible="showImageModal"
      modal
      header="MEDIA"
      :showHeader="false"
      :style="{ width: '85vw' }"
      class="bg-[#141b18]"
    >
      <ImageExplorer
        :initial-folder="editorCtxFolder"
        @select="imageActions.handleSelect"
        @close="showImageModal = false"
      />
    </Dialog>

  </div>
</template>

<style>
/* Estilos globais para a página de edição */
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(111, 148, 46, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(111, 148, 46, 0.5); }
.ghost-image { opacity: 0.4; border: 2px dashed #6f942e !important; transform: scale(0.98); }
</style>