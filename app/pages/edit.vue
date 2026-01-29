<script setup>
import yaml from "js-yaml";
import { useToast } from "primevue/usetoast";

// --- NOVOS COMPONENTES MODULARIZADOS ---
import CreateFileModal from "~/components/admin/modals/CreateFile.vue";
import CreateFolderModal from "~/components/admin/modals/CreateFolder.vue";
import RawEditor from "~/components/admin/editors/RawEditor.vue"; // [NOVO]
import VisualSplitEditor from "~/components/admin/editors/VisualSplitEditor.vue"; // [NOVO]
// --- COMPONENTES DO SISTEMA ---
import AdminSidebar from "~/components/admin/Sidebar.vue";
import AdminTopbar from "~/components/admin/Topbar.vue";
import AdminMetaEditor from "~/components/admin/MetaEditor.vue";
import AdminMarkdownEditor from "~/components/admin/MarkdownEditor.vue";
import ImageExplorer from "~/components/admin/ImageExplorer.vue";
import DashboardHome from "~/components/admin/DashboardHome.vue";
import FileToolbar from "~/components/admin/FileToolbar.vue";
import BackupManager from "~/components/admin/BackupManager.vue";

const config = useRuntimeConfig();

definePageMeta({ layout: "" });

const toast = useToast();
const route = useRoute();
const siteContext = useCookie("cms_site_context");

// --- ESTADOS DE NAVEGAÇÃO E CONTEXTO ---
const showSidebar = ref(false);
const showMetaSidebar = ref(true);
const currentFile = ref(route.query.file || ""); // Armazena CAMINHO COMPLETO

// --- ESTADOS DE LAYOUT (RESIZABLE) ---
const sidebarWidth = ref(350);
const isResizing = ref(false);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024;
};

onMounted(() => {
 checkMobile();
  window.addEventListener("resize", checkMobile);
  window.addEventListener("keydown", handleKeydown);

  // --- [NOVO] LISTENER PARA MENSAGEM DO PREVIEW ---
  window.addEventListener("message", handleMessageFromPreview);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  window.removeEventListener("keydown", handleKeydown);
  
  // --- [NOVO] REMOVER LISTENER ---
  window.removeEventListener("message", handleMessageFromPreview);
});

// pages/edit.vue

const handleMessageFromPreview = (event) => {
  // 1. Validação de segurança
  if (event.data?.type === 'SIRIUS_EDIT_REQUEST') {
    const fileToEdit = event.data.filepath;
    
    if (fileToEdit) {
      // 2. Navega para o arquivo no CMS
      navigate.selectFile(fileToEdit);
      
      // 3. O TRUQUE PARA FOCAR A ABA
      // Usamos um setTimeout pequeno para garantir que a UI atualize antes de travar
      setTimeout(() => {
          // O confirm nativo força o navegador a dar atenção a esta aba
          const shouldFocus = window.confirm(`O arquivo "${fileToEdit}" foi aberto.\nDeseja editar agora?`);
          
          // Se o usuário der OK, o foco já estará aqui.
          if (shouldFocus) {
              // Apenas garante o foco no input principal se quiser
              // document.body.focus(); 
          }
      }, 100);
    }
  }
};

const startResize = (e) => {
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  const doDrag = (evt) => {
    const newWidth = startWidth + (evt.clientX - startX);
    if (newWidth > 200 && newWidth < 800) {
      sidebarWidth.value = newWidth;
    }
  };

  const stopDrag = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", doDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag);
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";
};

// --- HELPERS DE CAMINHO ---
const getFolderFromFile = (fullPath) => {
  if (!fullPath) return "content";
  const lastSlash = fullPath.lastIndexOf("/");
  return lastSlash !== -1 ? fullPath.substring(0, lastSlash) : "content";
};

const currentFolder = ref(
  currentFile.value
    ? getFolderFromFile(currentFile.value)
    : route.query.folder || "content",
);

const editorCtxFolder = computed(() => {
  if (!currentFile.value) return currentFolder.value;
  return getFolderFromFile(currentFile.value);
});

const currentFileNameOnly = computed(() => {
  if (!currentFile.value) return "";
  return currentFile.value.split("/").pop();
});

const fileExtension = computed(() => {
  if (!currentFile.value) return "md";
  const parts = currentFile.value.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "md";
});

// --- ESTADOS DE EDIÇÃO ---
const form = ref({ frontmatter: {}, content: "" });
const loadingSave = ref(false);
const loadingPublish = ref(false);

// --- ESTADOS DO MODO RAW ---
const showRawMode = ref(false);
const rawContent = ref("");

// --- CONTROLE DE MODAIS ---
const showCreateModal = ref(false);
const showFolderModal = ref(false);
const showImageModal = ref(false);
const showBackupModal = ref(false);
const imageTarget = ref(null);

// =============================================================================
// DATA FETCHING
// =============================================================================

// CONFIGURAÇÃO DO SITE (_config.json)
const { data: configFileData } = await useFetch("/api/admin/storage", {
  query: {
    folder: ".",
    file: "_config.json",
  },
  key: `site-config-${siteContext.value}`,
});
const siteURL = JSON.parse(configFileData.value?.content).url || "";
console.log("siteURL:", siteURL);

const configFileData_obj = configFileData.value
  ? JSON.parse(configFileData.value.content)
  : {};

const userSiteUrl = computed(() => {
  try {
    if (!configFileData.value || !configFileData.value.content) return "";
    const config = JSON.parse(configFileData.value.content);
    const url = config.url || "";
    return url.endsWith("/") ? url.slice(0, -1) : url;
  } catch (e) {
    console.error("Erro config:", e);
    return "";
  }
});

// 1. LISTA DE ARQUIVOS (Sidebar)
const { data: files, refresh: refreshFiles } = await useFetch(
  "/api/admin/storage",
  {
    query: { site: siteContext, folder: currentFolder },
    watch: [currentFolder],
  },
);
const sortedFiles = computed(() => files.value || []);

// 2. LISTA DE PASTAS (Para Mover/Navegar)
const { data: allFolders, refresh: refreshFolders } = await useFetch(
  "/api/admin/folders",
  {
    query: { site: siteContext },
    key: `folders-${siteContext.value}`,
  },
);

// 3. CONTEÚDO DO ARQUIVO
const { data: fileData, error: fileError } = await useAsyncData(
  "file-content",
  () => {
    if (!currentFile.value) return Promise.resolve(null);
    return $fetch("/api/admin/storage", {
      params: {
        site: siteContext.value,
        folder: editorCtxFolder.value,
        file: currentFileNameOnly.value,
      },
    });
  },
  { watch: [currentFile] },
);

// 4. SCHEMA (Campos do Editor)
const { data: schemaData } = await useFetch("/api/admin/schema", {
  query: {
    site: siteContext,
    folder: editorCtxFolder,
    filename: currentFileNameOnly,
  },
  watch: [editorCtxFolder, currentFile],
});

// =============================================================================
// LÓGICA DE PREVIEW & LIVE UPDATE
// =============================================================================
const previewWindow = ref(null);

const handlePreview = () => {

  if (!siteURL) {
    toast.add({ severity: "warn", summary: "Sem URL", detail: 'Configure a "url" no _config.json', life: 2000 });
    return;
  }

  const finalUrl = siteURL + currentFile.value.replace(".md", "").replace("content/", "") + "?preview=true";
  
  window.open(finalUrl, "sirius_preview");
  // let path = "/";
  // if (form.value.frontmatter?.slug) path = form.value.frontmatter.slug;
  // else if (form.value.frontmatter?.permalink) path = form.value.frontmatter.permalink;
  // else {
  //   let cleanPath = currentFile.value || "";
  //   cleanPath = cleanPath.replace(/\.md$/, "");
  //   if (cleanPath.startsWith("content/")) cleanPath = cleanPath.substring(8);
  //   if (cleanPath.endsWith("/_index") || cleanPath === "_index") cleanPath = cleanPath.replace("_index", "");
  //   path = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  //   if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  // }

  // const baseUrl = configFileData_obj.url.endsWith("/") ? configFileData_obj.url.slice(0, -1) : configFileData_obj.url;
  // let finalUrl = `${baseUrl}${path}`;
  // finalUrl += finalUrl.includes("?") ? "&preview=true" : "?preview=true";

  // previewWindow.value = window.open(finalUrl, "sirius_preview");
  // setTimeout(() => sendPreviewUpdate(), 1500);
};

let debounceTimer = null;
const sendPreviewUpdate = () => {
  if (!previewWindow.value || previewWindow.value.closed) return;
  const payload = {
    type: "SIRIUS_PREVIEW_UPDATE",
    data: {
      title: form.value.frontmatter.title,
      description: form.value.frontmatter.description,
      body: showRawMode.value ? rawContent.value : form.value.content,
      frontmatter: form.value.frontmatter,
    },
  };
  previewWindow.value.postMessage(payload, "*");
};

watch(form, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendPreviewUpdate, 50);
}, { deep: true });

watch(rawContent, () => {
  if (showRawMode.value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try { parseMD(rawContent.value); } catch (e) {}
      sendPreviewUpdate();
    }, 50);
  }
});

watch(fileError, (err) => {
  if (err) {
    currentFile.value = "";
    const url = new URL(window.location);
    url.searchParams.delete("file");
    window.history.replaceState({}, "", url);
  }
});

// =============================================================================
// PARSING & MODELOS
// =============================================================================

const currentModel = computed(() => {
  if (!schemaData.value) return { fields: [] };
  const fmSchema = form.value.frontmatter?.schema;
  const mapSchema = schemaData.value.mapping?.[currentFileNameOnly.value];
  const typeKey = fmSchema || mapSchema || "default";
  return schemaData.value.types?.[typeKey] || { fields: [] };
});

const availableTypes = computed(() => {
  if (!schemaData.value?.types)
    return [{ key: "default", label: "Padrão", icon: "pi-file" }];
  return Object.entries(schemaData.value.types).map(([key, val]) => ({
    key,
    label: val.label || key,
    icon: val.icon || "pi-file",
    description: val.description || "",
  }));
});

const getCleanData = () => {
  const cleanData = JSON.parse(JSON.stringify(form.value.frontmatter));
  const modelFields = currentModel.value.fields || [];

  modelFields.forEach((field) => {
    const data = cleanData[field.key];
    if (!Array.isArray(data)) return;
    if (field.type === "simple_list") cleanData[field.key] = data.map((item) => item.text || "");
    if (field.type === "repeater") {
      cleanData[field.key] = data.map((item) => {
        const { _uuid, ...rest } = item;
        return rest;
      });
    }
  });
  return cleanData;
};

const parseMD = (full) => {
  if (!full) {
    form.value.frontmatter = {};
    form.value.content = "";
    rawContent.value = "";
    return;
  }
  const ext = fileExtension.value;

  if (ext === 'json' || ext === 'yml' || ext === 'yaml') {
    rawContent.value = full;
    try {
      if (ext === 'json') form.value.frontmatter = JSON.parse(full);
      else form.value.frontmatter = yaml.load(full) || {};
    } catch (e) { form.value.frontmatter = {}; }
    form.value.content = "";
    showRawMode.value = true;
    return;
  }

  if (showRawMode.value && ext === 'md') rawContent.value = full;
  else showRawMode.value = false;

  const normalized = full.replace(/\r\n/g, "\n");
  const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = normalized.match(fmRegex);

  try {
    if (match) {
      form.value.frontmatter = yaml.load(match[1]) || {};
      form.value.content = match[2].trim();
    } else {
       // Fallback simples
       if (normalized.trim().startsWith("---")) {
          const parts = normalized.split("---");
          if (parts.length >= 3 && parts[0].trim() === "") {
             form.value.frontmatter = yaml.load(parts[1]) || {};
             form.value.content = parts.slice(2).join("---").trim();
          } else {
             form.value.frontmatter = {};
             form.value.content = normalized;
          }
       } else {
          form.value.frontmatter = {};
          form.value.content = normalized;
       }
    }
    rawContent.value = full; 
  } catch (e) {
    console.error("YAML Error:", e);
    form.value.frontmatter = {};
    form.value.content = full;
  }
};

watch(fileData, (newData) => {
    parseMD(newData?.content || "");
}, { immediate: true });

watch([currentModel, () => form.value.frontmatter], ([newModel, fm]) => {
    if (showRawMode.value || !newModel?.fields || !fm) return;
    // Adiciona UUIDs para listas (PrimeVue precisa de keys únicas)
    newModel.fields.forEach((field) => {
      const data = fm[field.key];
      if (!Array.isArray(data)) return;
      if (field.type === "simple_list") {
        if (data.length > 0 && typeof data[0] !== "object") {
          fm[field.key] = data.map((str) => ({ text: str, _uuid: crypto.randomUUID() }));
        } else {
          data.forEach((item) => { if (typeof item === "object" && !item._uuid) item._uuid = crypto.randomUUID(); });
        }
      }
      if (field.type === "repeater") {
        data.forEach((item) => { if (item && typeof item === "object" && !item._uuid) item._uuid = crypto.randomUUID(); });
      }
    });
}, { deep: true });

// =============================================================================
// NAVEGAÇÃO & AÇÕES
// =============================================================================

const navigate = {
  enterFolder: (f) => { currentFolder.value = `${currentFolder.value}/${f}`; },
  goBack: () => {
    const parts = currentFolder.value.split("/");
    if (parts.length > 1) { parts.pop(); currentFolder.value = parts.join("/"); }
  },
  selectFile: (fileNameOrPath) => {
    const fullPath = fileNameOrPath.includes("/") ? fileNameOrPath : `${currentFolder.value}/${fileNameOrPath}`;
    currentFile.value = fullPath;
    window.history.pushState({}, "", `?file=${fullPath}`);
    showSidebar.value = false;
    showRawMode.value = false;
  },
  changeRoot: (r) => { currentFolder.value = r; },
  toDashboard: () => {
    currentFile.value = "";
    navigateTo("/edit");
  },
};

const handleManualNavigation = (fullPath) => {
  const cleanPath = fullPath.replace(/^\//, "");
  const newFolder = getFolderFromFile(cleanPath);
  currentFolder.value = newFolder;
  currentFile.value = cleanPath;
  window.history.pushState({}, "", `?file=${cleanPath}`);
  toast.add({ severity: "info", summary: "Navegando...", detail: cleanPath, life: 1000 });
};

// --- AÇÕES REESTRUTURADAS ---
const createActions = {
  openFile: () => { showCreateModal.value = true; },
  openFolder: () => { showFolderModal.value = true; },
  
  // Callbacks dos Modais
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
    if (!target) imageTarget.value = { mode: "markdown" };
    else if (Array.isArray(target.list)) imageTarget.value = { mode: "push", list: target.list };
    else imageTarget.value = { mode: "set", obj: target.obj, key: target.key };
    showImageModal.value = true;
  },
  handleSelect: (url) => {
    if (showRawMode.value) rawContent.value += `\n![](${url})`;
    else {
      const t = imageTarget.value;
      if (t.mode === "markdown") form.value.content += `\n![](${url})`;
      else if (t.mode === "set") t.obj[t.key] = url;
      else if (t.mode === "push") t.list.push(url);
    }
    showImageModal.value = false;
    sendPreviewUpdate();
  },
};

const toggleRawMode = () => {
  const ext = fileExtension.value;
  if (!showRawMode.value) {
    const cleanData = getCleanData();
    if (ext === 'json') rawContent.value = JSON.stringify(cleanData, null, 2);
    else if (ext === 'yml' || ext === 'yaml') rawContent.value = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
    else {
      const y = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
      const contentPart = form.value.content ? `\n\n${form.value.content.trim()}` : "";
      rawContent.value = `---\n${y.trim()}\n---${contentPart}`;
    }
  } else {
    parseMD(rawContent.value);
  }
  showRawMode.value = !showRawMode.value;
};

const saveFile = async () => {
  if (!currentFile.value) return;
  loadingSave.value = true;
  let finalContent = "";
  const ext = fileExtension.value;

  if (showRawMode.value) {
    finalContent = rawContent.value;
    try {
      if (ext === 'json') JSON.parse(finalContent);
      if (ext === 'yml' || ext === 'yaml') yaml.load(finalContent);
    } catch (e) {
      toast.add({ severity: "error", summary: "Erro Sintaxe", detail: "Formato inválido." });
      loadingSave.value = false;
      return;
    }
  } else {
    const cleanData = getCleanData();
    if (ext === 'json') finalContent = JSON.stringify(cleanData, null, 2);
    else if (ext === 'yml' || ext === 'yaml') finalContent = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
    else {
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
  // if (isPublishing.value) return;
  // isPublishing.value = true;
  toast.add({ severity: "info", summary: "Publicando...", detail: "Gerando site...", life: 2000 });

  try {
    const result = await $fetch("/api/admin/compile-all", {
      method: "POST",
      body: { site: siteContext.value },
    });
    if (result.success) toast.add({ severity: "success", summary: "Sucesso!", detail: "Site atualizado.", life: 2000 });
    else throw new Error(result.message);
  } catch (error) {
    console.error(error);
    toast.add({ severity: "error", summary: "Erro", detail: "Falha ao publicar." });
  } finally {
    // isPublishing.value = false;
  }
};

const handleDeleteFile = async (item) => {
  const fileName = item?.name || currentFileNameOnly.value;
  try {
    await $fetch("/api/admin/storage", {
      method: "DELETE",
      body: {
        folder: currentFolder.value,
        file: fileName,
      },
    });
    toast.add({ severity: "success", summary: "Excluído", life: 1000 });
    if (currentFileNameOnly.value === fileName) {
      currentFile.value = "";
      navigate.toDashboard();
    }
    await refreshFiles();
  } catch (e) {
    toast.add({ severity: "error", summary: "Erro ao excluir" });
  }
};

const handleRenameAction = async (newName) => {
  try {
    const response = await $fetch("/api/admin/rename", {
      method: "POST",
      body: {
        oldname: currentFile.value, 
        newname: `${editorCtxFolder.value}/${newName}`,
      },
    });
    toast.add({ severity: "success", summary: "Renomeado", life: 2000 });
    await refreshFiles();
    if (response && response.newname) navigate.selectFile(response.newname);
    else navigate.selectFile(`${editorCtxFolder.value}/${newName}`);
  } catch (e) {
    toast.add({ severity: "error", summary: "Erro", detail: e.data?.message });
  }
};

const handleMoveAction = async (newPath) => {
  try {
    await $fetch("/api/admin/rename", {
      method: "POST",
      body: { oldname: currentFile.value, newname: newPath },
    });
    toast.add({ severity: "success", summary: "Movido", detail: newPath, life: 1000 });
    
    const lastSlashIndex = newPath.lastIndexOf("/");
    const newFolderDest = lastSlashIndex !== -1 ? newPath.substring(0, lastSlashIndex) : "content";
    
    currentFolder.value = newFolderDest;
    await refreshFolders();
    await refreshFiles();
    navigate.selectFile(newPath);
  } catch (e) {
    toast.add({ severity: "error", summary: "Erro ao mover", detail: e.message });
  }
};

const logout = () => {
  siteContext.value = null;
  navigateTo("/login");
};

const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    if (currentFile.value) saveFile();
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30 flex flex-col">
    <Toast />

    <AdminSidebar
      :site-context="siteContext"
      v-model:visible="showSidebar"
      :files="sortedFiles"
      :current-folder="currentFolder"
      :current-file="currentFile"
      @refresh="refreshFiles()"
      @navigate="navigate.enterFolder"
      @select="navigate.selectFile"
      @back="navigate.goBack"
      @change-root="navigate.changeRoot"
      @create-file="createActions.openFile"
      @create-folder="createActions.openFolder"
      @delete="handleDeleteFile"
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
          @rename="handleRenameAction"
          @move="handleMoveAction"
          @delete="handleDeleteFile"
          @toggle-raw="toggleRawMode"
          @media="imageActions.open()"
          @navigate-file="handleManualNavigation"
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
          :current-folder="currentFolder"
          :files="sortedFiles"
          @navigate="(path) => { if (path.endsWith('.md')) navigate.selectFile(path); else navigate.changeRoot(path); }"
          @create-file="createActions.openFile"
          @open-media="imageActions.open()"
          @publish="handlePublish"
        />
      </div>
    </div>

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

    <CreateFileModal
      v-model:visible="showCreateModal"
      :site-context="siteContext"
      :current-folder="currentFolder"
      :available-types="availableTypes"
      @success="createActions.onFileCreated"
    />

    <CreateFolderModal
      v-model:visible="showFolderModal"
      :site-context="siteContext"
      :current-folder="currentFolder"
      @success="createActions.onFolderCreated"
    />

    <Dialog
      v-model:visible="showImageModal"
      modal
      header="MEDIA"
      :showHeader="false"
      :style="{ width: '85vw' }"
      class="bg-[#141b18]"
    >
      <ImageExplorer
        @select="imageActions.handleSelect"
        @close="showImageModal = false"
      />
    </Dialog>

  </div>
</template>

<style>
/* Estilos globais */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(111, 148, 46, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(111, 148, 46, 0.5);
}
.ghost-image {
  opacity: 0.4;
  border: 2px dashed #6f942e !important;
  transform: scale(0.98);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>