<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useRoute, useRouter } from "vue-router";
import yaml from "js-yaml";

// --- COMPONENTES ---
import FileManager from "~/components/admin/FileManager.vue";
import CollectionFiles from "~/components/admin/CollectionFiles.vue";
import AdminMetaEditor from "~/components/admin/MetaEditor.vue";
import AdminMarkdownEditor from "~/components/admin/MarkdownEditor.vue";
import ImageExplorer from "~/components/admin/ImageExplorer.vue";
import CreateFileModal from "~/components/admin/modals/CreateFile.vue";
import CreateFolderModal from "~/components/admin/modals/CreateFolder.vue";
import CreateCollectionModal from "~/components/admin/modals/CreateCollection.vue";
import BackupManager from "~/components/admin/BackupManager.vue";

const siteContext = useCookie("cms_site_context");
const toast = useToast();
const route = useRoute();
const router = useRouter();

// --- ESTADO GLOBAL (URL é a fonte da verdade) ---
const currentPath = computed(() => (route.query.path || "content").toString());

// --- ESTADO DE NAVEGAÇÃO ---
const sidebarFolder = ref("content"); 
const mainFolder = ref("content"); 
const currentFile = ref(""); 
const sidebarHighlightFile = ref(""); 

const lastPreviewPath = ref("");

// --- ESTADO DE DADOS ---
const sidebarFiles = ref([]);
const mainFiles = ref([]);
const fileData = ref({ frontmatter: {}, content: "" });

// Flags e Controle
const isCollectionFolder = ref(false);
const currentFolderType = ref("folder"); 
const fmSchema = ref("default");
const debugLogs = ref([]);

// --- UI CONTROL ---
const collectionPanelVisible = ref(false);
const editArea = ref(true);
const showFileManager = ref(true);
const showCreateModal = ref(false);
const showFolderCreateModal = ref(false);
const showCollectionCreateModal = ref(false);
const showBackupModal = ref(false);
const showImageModal = ref(false);
const creationTargetFolder = ref("content");

const fileManagerWidth = ref(320);
const frontmatterWidth = ref(350);
const isRawMode = ref(false);

// --- PREVIEW STATE ---
const isPreviewMode = ref(false);
const previewUrl = ref("");
const previewIframe = ref(null);

// --- MENU & CONFIG ---
const userMenu = ref();
const settingsMenu = ref();
// --- LÓGICA DE LOGOUT ---
const handleLogout = async () => {
  try {
    // 1. Chama a API para limpar o cookie de sessão no servidor
    await $fetch('/api/auth/logout', { method: 'POST' });

    // 2. Feedback visual (Opcional)
    toast.add({ 
      severity: 'info', 
      summary: 'Até logo', 
      detail: 'Sessão encerrada com sucesso.', 
      life: 2000 
    });

    // 3. Redireciona para o login ou home
    // Usamos window.location.href para forçar um refresh total e limpar estados de memória do Vue
    window.location.href = '/login'; 
    
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    // Mesmo com erro, forçamos a saída visualmente
    router.push('/');
  }
};
const userMenuItems = ref([
  { 
    label: "Sair", 
    icon: "pi pi-power-off", 
    command: handleLogout // <--- Agora chama a função dedicada
  },
]);
const settingsItems = ref([
  {
    label: "Backups",
    icon: "pi pi-history",
    command: () => (showBackupModal.value = true),
  },
]);
const toggleUserMenu = (event) => userMenu.value.toggle(event);
const goToBackup = () => (showBackupModal.value = true);

// Configurações do Site
const { data: configFileData } = await useFetch("/api/admin/storage", {
  query: { folder: ".", file: "_config.json", site: siteContext },
  key: `site-config-${siteContext.value}`,
});
const userSiteUrl = computed(() => {
  try {
    const c = JSON.parse(configFileData.value?.content || "{}");
    return c.url ? (c.url.endsWith("/") ? c.url.slice(0, -1) : c.url) : "";
  } catch (e) {
    return "";
  }
});

// Computed para exibir a URL atual no Header
const currentPreviewDisplayUrl = computed(() => {
  // Se tivermos um caminho vindo da navegação do iframe, usamos ele.
  // Senão, tentamos inferir do arquivo atual ou usamos a raiz.
  let path = lastPreviewPath.value;
  
  if (!path) {
     // Fallback visual enquanto o iframe não manda mensagem
     path = currentFile.value.replace('content', '').replace('/_index.md', '').replace('.md', '');
     if (!path) path = "/";
  }
  
  // Remove barra duplicada se houver
  const baseUrl = userSiteUrl.value.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  
  return `${baseUrl}${cleanPath}`;
});

watch(isRawMode, (active) => {
  if (active) {
    const fmString = yaml.dump(fileData.value.frontmatter, { 
      indent: 2, 
      lineWidth: -1, 
      noRefs: true,
      sortKeys: true 
    }).trim();

    const separator = fmString && fmString !== '{}' 
      ? `---\n${fmString}\n---\n\n` 
      : '';
      
    fileData.value.content = `${separator}${fileData.value.content}`;
    
  } else {
    const parsed = parseFile(fileData.value.content, currentFile.value);
    fileData.value.frontmatter = parsed.frontmatter;
    fileData.value.content = parsed.content;
    fmSchema.value = fileData.value.frontmatter?.schema || "default";
  }
});

watch(currentFile, () => {
  isRawMode.value = false;
});

// =============================================================================
// SINCRONIZAÇÃO DE ESTADO
// =============================================================================

const syncStateFromUrl = async () => {
  const path = currentPath.value;
  
  if (!path) return;

  const isFile = /\.(md|json|yml|yaml|toml)$/i.test(path);

  if (isFile) {
    // === LÓGICA PARA ARQUIVO ESPECÍFICO (Mantida igual) ===
    const itemFolder = path.substring(0, path.lastIndexOf("/"));
    const parentOfItem = itemFolder.substring(0, itemFolder.lastIndexOf("/"));

    const isDirectCollection = await checkIfCollection(itemFolder);
    const isChildOfCollection = await checkIfCollection(parentOfItem);
    const isStructural = await checkIfStructural(itemFolder);

    if (isDirectCollection || isChildOfCollection) {
      let collectionRoot = isDirectCollection ? itemFolder : parentOfItem;
      let sidebarTarget = isDirectCollection
        ? parentOfItem || "content"
        : parentOfItem.substring(0, parentOfItem.lastIndexOf("/")) || "content";

      mainFolder.value = itemFolder;
      sidebarFolder.value = sidebarTarget;
      sidebarHighlightFile.value = collectionRoot;
    } else if (isStructural) {
      mainFolder.value = itemFolder;
      sidebarFolder.value = itemFolder;
      sidebarHighlightFile.value = path;
    } else {
      mainFolder.value = itemFolder;
      sidebarFolder.value = parentOfItem || "content";
      sidebarHighlightFile.value = itemFolder;
    }

    currentFile.value = path;
    await fetchSidebarContent(sidebarFolder.value);
    await getFileContent(path);

    currentFolderType.value = "page";
    collectionPanelVisible.value = false;
    editArea.value = true;

  } else {
    // === LÓGICA PARA DIRETÓRIO (ALTERADA) ===
    // 1. Define a pasta principal e carrega o conteúdo dela (lista de arquivos)
    mainFolder.value = path;
    await fetchMainContent(path);

    // 2. Define Sidebar
    // Se for collection, sidebar sobe um nível. Se for pasta comum, sidebar é a própria pasta.
    if (isCollectionFolder.value) {
       const parentOfCollection = path.includes("/") ? path.substring(0, path.lastIndexOf("/")) : "content";
       sidebarFolder.value = parentOfCollection || "content";
       sidebarHighlightFile.value = path;
       
       currentFolderType.value = "collection";
       collectionPanelVisible.value = true;
       // Nota: Mesmo em coleção, podemos querer editar o _index (Capa) se ele existir,
       // mas geralmente mantemos a lista visível. Se quiser forçar edição, mude editArea = true.
       editArea.value = false; 
    } else {
       sidebarFolder.value = path;
       sidebarHighlightFile.value = "";
       
       currentFolderType.value = "folder";
       collectionPanelVisible.value = false;
       editArea.value = true;
    }

    // 3. TENTATIVA DE AUTO-LOAD DO INDEX (A Mágica acontece aqui)
    // Verifica na lista carregada (mainFiles) se existe um _index na ordem de prioridade
    const candidates = ["_index.md", "_index.json", "_index.yml", "_index.toml"];
    let foundIndex = null;

    // Itera na ordem de prioridade para achar o primeiro que existe
    for (const ext of candidates) {
        const match = mainFiles.value.find(f => f.name.toLowerCase() === ext);
        if (match) {
            foundIndex = match;
            break; 
        }
    }

    if (foundIndex) {
        // Se achou, monta o caminho e carrega o conteúdo
        const fullIndexPath = `${path}/${foundIndex.name}`.replace(/\/+/g, "/");
        currentFile.value = fullIndexPath;
        sidebarHighlightFile.value = fullIndexPath;
        await getFileContent(fullIndexPath);
        
        console.log(`📂 Pasta aberta. Index carregado: ${foundIndex.name}`);
    } else {
        // Se não achou nenhum index, limpa o editor
        currentFile.value = "";
        fileData.value = { frontmatter: {}, content: "" };
    }

    // Carrega a sidebar
    await fetchSidebarContent(sidebarFolder.value);
  }
};



const checkIfCollection = async (folderPath) => {
  if (!folderPath || folderPath === "content") return false;
  try {
    const response = await $fetch("/api/admin/storage", {
      params: { site: siteContext.value, folder: folderPath },
    });
    if (response.type === "collection") return true;
    if (response.files && Array.isArray(response.files)) {
      return response.files.some(
        (f) => f.name === ".collection" || f.name === ".collection.json",
      );
    }
    return false;
  } catch (e) {
    return false;
  }
};

const checkIfStructural = async (folderPath) => {
  if (!folderPath || folderPath === "content") return true;
  try {
    const response = await $fetch("/api/admin/storage", {
      params: { site: siteContext.value, folder: folderPath },
    });
    if (response.files && Array.isArray(response.files)) {
      return response.files.some((f) => f.name === ".isDirFlag");
    }
    return false;
  } catch (e) {
    return false;
  }
};

const fetchMainContent = async (folder) => {
  try {
    const response = await $fetch("/api/admin/storage", {
      params: { site: siteContext.value, folder: folder },
    });
    if (response && response.files) {
      mainFiles.value = response.files;
      const hasCollectionFile = response.files.some((f) => f.name === ".collection" );
      isCollectionFolder.value =  response.type === "collection" || hasCollectionFile;
    } else {
      mainFiles.value = [];
      isCollectionFolder.value = false;
    }
  } catch (error) {
    mainFiles.value = [];
    isCollectionFolder.value = false;
  }
};

const fetchSidebarContent = async (folder) => {
  try {
    if (
      folder === mainFolder.value &&
      mainFiles.value.length > 0 &&
      !isCollectionFolder.value
    ) {
      sidebarFiles.value = mainFiles.value;
      return;
    }
    const response = await $fetch("/api/admin/storage", {
      params: { site: siteContext.value, folder: folder },
    });
    if (response && response.files) {
      sidebarFiles.value = response.files;
    } else {
      sidebarFiles.value = [];
    }
  } catch (error) {
    sidebarFiles.value = [];
  }
};

const getFileContent = async (filepath) => {
  try {
    const folder = filepath.substring(0, filepath.lastIndexOf("/"));
    const filename = filepath.split("/").pop();
    const data = await $fetch("/api/admin/storage", {
      params: { site: siteContext.value, folder, file: filename },
    });
    if (data?.content) {
      fileData.value = parseFile(data.content, filepath);
      fmSchema.value = fileData.value.isRaw
        ? "none"
        : fileData.value.frontmatter?.schema || "default";
    }
  } catch (error) {
    console.error(error);
  }
};

const parseFile = (fullText, filename = "") => {
  if (!fullText) return { frontmatter: {}, content: "" };
  const normalized = fullText.replace(/\r\n/g, "\n");
  const lower = filename.toLowerCase();
  const isRaw =
    lower.endsWith(".json") ||
    lower.endsWith(".yml") ||
    lower.endsWith(".yaml") ||
    lower.endsWith(".toml");

  if (isRaw) return { frontmatter: {}, content: normalized, isRaw: true };
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    try {
      return {
        frontmatter: yaml.load(match[1]) || {},
        content: match[2].trimStart(),
      };
    } catch (e) {
      return { frontmatter: {}, content: normalized };
    }
  }
  return { frontmatter: {}, content: normalized };
};

watch(
  () => route.query.path,
  async (newPath, oldPath) => {
    if (newPath !== oldPath) await syncStateFromUrl();
  },
  { immediate: true },
);

// =============================================================================
// BREADCRUMBS & NAVEGAÇÃO
// =============================================================================

const mapToBreadcrumb = (part, index, allParts) => {
  const accumulator = allParts.slice(0, index + 1).join("/");
  let label = part.replace(/-/g, " ");
  if (part === "content") label = "Home";
  const isLastItem = index === allParts.length - 1;

  return {
    label: label,
    path: accumulator,
    disabled: isLastItem,
  };
};

const folderBreadcrumbs = computed(() => {
  // 1. Fonte da Verdade:
  // Se houver um arquivo aberto (ex: _index.md carregado automaticamente), usamos ele.
  // Se não, usamos o caminho da URL (navegação de pastas).
  const rawPath = currentFile.value || currentPath.value;
  
  if (!rawPath) return [];

  const parts = rawPath.split("/").filter(Boolean);

  return parts.map((part, index) => {
    let label = part.replace(/-/g, " ");
    const isLastItem = index === parts.length - 1;
    
    // --- REGRA 1: HOME ---
    if (part === "content") {
        label = "Home";
    }

    // --- REGRA 2: CAPA / INDEX ---
    // Se o arquivo for _index, transformamos em "Capa de [Pasta Anterior]"
    if (part.toLowerCase().startsWith("_index")) {
        // Pega a pasta anterior (ex: 'blog' em 'content/blog/_index.md')
        const parentPart = parts[index - 1];
        
        let parentName = "Site";
        if (parentPart && parentPart !== 'content') {
            parentName = parentPart.replace(/-/g, " ");
            // Capitaliza a primeira letra (ex: "quem somos" -> "Quem somos")
            parentName = parentName.charAt(0).toUpperCase() + parentName.slice(1);
        }

        // label = `Capa`;
        label = ``;
    }

    // Caminho acumulado para o link funcionar
    const accumulator = parts.slice(0, index + 1).join("/");

    return {
      label: label,
      path: accumulator,
      disabled: isLastItem, // O último item (onde estamos) não é clicável
    };
  });
});

const navigateToBreadcrumb = (crumb) => {
  if (crumb.disabled) return;
  router.push({
    query: { ...route.query, path: crumb.path },
  });
};

const handleNavigate = {
  navigate: (payload) => {
    let targetPath = "";
    if (typeof payload === "object" && payload.absolute) {
      targetPath = payload.path;
    } else {
      targetPath = `${sidebarFolder.value}/${payload}`;
    }
    targetPath = targetPath.replace(/\/+/g, "/").replace(/\/$/, "");
    router.push({ query: { ...route.query, path: targetPath } });
  },
  selectFile: (path) => {
    let fullPath = "";
    if (path.startsWith("content")) {
      fullPath = path;
    } else {
      fullPath = `${sidebarFolder.value}/${path}`;
    }
    fullPath = fullPath.replace(/\/+/g, "/");
    router.push({ query: { ...route.query, path: fullPath } });
  },
  goBack: () => {
    const parts = sidebarFolder.value.split("/");
    if (
      parts.length > 0 &&
      sidebarFolder.value !== "" &&
      sidebarFolder.value !== "content"
    ) {
      parts.pop();
      const newPath = parts.join("/") || "content";
      router.push({ query: { ...route.query, path: newPath } });
    }
  },
  loadFile: (item) => {
    const targetPath = item.isDirectory ? `${item.path}/_index.md` : item.path;
    router.push({ query: { ...route.query, path: targetPath } });
  },
  refresh: async () => {
    await syncStateFromUrl();
  },
  refresh_: async () => {
 
    // Recarrega tudo baseado no estado atual
    await fetchSidebarContent(sidebarFolder.value);
    
    // Se estiver vendo uma pasta/coleção no centro, recarrega ela também
    if (!currentFile.value || collectionPanelVisible.value) {
       await fetchMainContent(mainFolder.value);
    }
    
    // Feedback visual (opcional)
    toast.add({ severity: 'secondary', summary: 'Atualizado', life: 1000 });
  },
};

const createActions = {
  openFile: (overrideFolder = null) => {
    creationTargetFolder.value =
      typeof overrideFolder === "string" ? overrideFolder : sidebarFolder.value;
    showCreateModal.value = true;
  },
  openFolder: () => {
    creationTargetFolder.value = sidebarFolder.value;
    showFolderCreateModal.value = true;
  },
  openCollection: () => {
    showCollectionCreateModal.value = true;
  },
  onFileCreated: (filename) => {
    handleNavigate.refresh();
    if (filename) handleNavigate.selectFile(filename);
  },
  onFolderCreated: () => {
    handleNavigate.refresh();
  },
  onCollectionCreated: (folderPath) => {
    handleNavigate.navigate({ path: folderPath, absolute: true });
  },
};

const imageTarget = ref(null);
const loadingPublish = ref(false);

const imageActions = {
  open: (target) => {
    if (!target) imageTarget.value = { mode: "markdown" };
    else if (target.mode === "push")
      imageTarget.value = { mode: "push", list: target.list };
    else imageTarget.value = { mode: "set", obj: target.obj, key: target.key };
    showImageModal.value = true;
  },
  handleSelect: (finalPath) => {
    const t = imageTarget.value;
    if (!t) return;
    if (t.mode === "markdown") {
      if (fileData.value) fileData.value.content += `\n![](${finalPath})`;
    } else if (t.mode === "set") t.obj[t.key] = finalPath;
    else if (t.mode === "push") t.list.push(finalPath);
    showImageModal.value = false;
  },
};

const editorCtxFolder = computed(() => {
  if (!currentFile.value) return mainFolder.value;
  return currentFile.value.substring(0, currentFile.value.lastIndexOf("/"));
});

const isRawFile = computed(() => {
  if (!currentFile.value) return false;
  const lower = currentFile.value.toLowerCase();
  return (
    lower.endsWith(".json") ||
    lower.endsWith(".yml") ||
    lower.endsWith(".yaml") ||
    lower.endsWith(".toml")
  );
});

// --- CONTROLE DE VISIBILIDADE DO SIDEBAR DIREITO ---
const showMetaSidebar = computed(() => {
  // Se não tem arquivo selecionado, mantém a lógica original (mostra placeholder se não for coleção)
  if (!currentFile.value) {
    return !collectionPanelVisible.value;
  }
  
  // Se tem arquivo, SÓ mostra se for Markdown (.md)
  // Arquivos .json, .yml, .toml vão esconder a barra lateral
  return currentFile.value.toLowerCase().endsWith(".md");
});

const saveFile = async () => {
  if (!currentFile.value) return;
  try {
    let finalContent = "";
    if (isRawFile.value || isRawMode.value) {
      finalContent = fileData.value.content;
    } else {
      const fm = yaml.dump(fileData.value.frontmatter, { indent: 2, lineWidth: -1, noRefs: true }).trim();
      const separator = fm && fm !== '{}' ? `---\n${fm}\n---\n\n` : '';
      finalContent = `${separator}${fileData.value.content}`;
    }

    await $fetch("/api/admin/storage", {
      method: "POST",
      body: {
        site: siteContext.value,
        folder: editorCtxFolder.value,
        file: currentFile.value.split("/").pop(),
        content: finalContent,
      },
    });

    if (isRawMode.value) {
       const parsed = parseFile(fileData.value.content, currentFile.value);
       fileData.value.frontmatter = parsed.frontmatter;
    }

    toast.add({
      severity: "success",
      summary: "Salvo com sucesso!",
      life: 1000,
    });
  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Erro ao salvar" });
  }
};

const handlePublish = async () => {
  loadingPublish.value = true;
  toast.add({ severity: "info", summary: "Publicando...", life: 2000 });
  try {
    const result = await $fetch("/api/admin/compile-all", {
      method: "POST",
      body: { site: siteContext.value },
    });
    if (result.success)
      toast.add({ severity: "success", summary: "Site publicado." });
    else throw new Error(result.message);
  } catch (error) {
    toast.add({ severity: "error", summary: "Erro na publicação" });
  } finally {
    loadingPublish.value = false;
  }
};

const { data: schemaData } = await useFetch("/api/admin/schema", {
  query: {
    site: siteContext,
    folder: ".",
    schema: computed(() => fmSchema.value),
  },
  watch: [fmSchema],
});
const fields = computed(() => schemaData.value?.fields || []);

const isResizingSidebar = ref(false);
const startSidebarResize = () => {
  isResizingSidebar.value = true;
  document.body.style.cursor = "col-resize";
  window.addEventListener("mousemove", handleSidebarMouseMove);
  window.addEventListener("mouseup", stopSidebarResize);
};
const handleSidebarMouseMove = (e) => {
  const newWidth = e.clientX - 48;
  if (newWidth > 200 && newWidth < 600) fileManagerWidth.value = newWidth;
};
const stopSidebarResize = () => {
  isResizingSidebar.value = false;
  document.body.style.cursor = "";
  window.removeEventListener("mousemove", handleSidebarMouseMove);
  window.removeEventListener("mouseup", stopSidebarResize);
};

const isResizingFrontmatter = ref(false);
const startResizeFrontmatter = () => {
  isResizingFrontmatter.value = true;
  document.body.style.cursor = "col-resize";
  window.addEventListener("mousemove", handleFrontmatterMouseMove);
  window.addEventListener("mouseup", stopResizeFrontmatter);
};
const handleFrontmatterMouseMove = (e) => {
  const newWidth = window.innerWidth - e.clientX;
  if (newWidth > 250 && newWidth < 800) frontmatterWidth.value = newWidth;
};
const stopResizeFrontmatter = () => {
  isResizingFrontmatter.value = false;
  document.body.style.cursor = "";
  window.removeEventListener("mousemove", handleFrontmatterMouseMove);
  window.removeEventListener("mouseup", stopResizeFrontmatter);
};

// --- PREVIEW LOGIC ---
const handlePreview = () => {
  if (!userSiteUrl.value) {
    toast.add({
      severity: "warn",
      summary: "Sem URL",
      detail: 'Configure a "url" no _config.json',
      life: 2000,
    });
    return;
  }

  let cleanPath = currentFile.value || "";

  // 1. Remove a pasta raiz 'content'
  cleanPath = cleanPath.replace(/^content\/?/, "");

  // 2. Remove o arquivo de índice da URL (Markdown, JSON, YAML, TOML)
  // O Regex pega:
  // (\/|^) -> Uma barra OU o início da string (caso seja raiz)
  // (_?index) -> _index ou index
  // \.(...) -> As extensões possíveis
  cleanPath = cleanPath.replace(/(\/|^)(_?index)\.(md|json|yml|yaml|toml)$/i, "");
  
  // 3. Limpeza final de extensão (caso seja um arquivo normal, ex: sobre.json -> sobre)
  cleanPath = cleanPath.replace(/\.(md|json|yml|yaml|toml)$/i, "");

  // 4. Garante que se ficou vazio, vire a raiz "/"
  if (cleanPath === "") cleanPath = "/";
  
  // 5. Garante a barra inicial
  if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;

  const finalUrl = `${userSiteUrl.value}${cleanPath}?preview=true`;
  
  console.log("🔗 Gerando Preview para:", finalUrl); // Debug útil
  
  previewUrl.value = finalUrl;
  isPreviewMode.value = true;
};

const sendPreviewUpdate = () => {
  if (!previewIframe.value || !previewIframe.value.contentWindow) return;
  previewIframe.value.contentWindow.postMessage(
    {
      type: "SIRIUS_PREVIEW_UPDATE",
      data: {
        title: fileData.value.frontmatter.title,
        description: fileData.value.frontmatter.description,
        body: fileData.value.content,
        frontmatter: fileData.value.frontmatter,
      },
    },
    "*"
  );
};

let debounceTimer = null;
watch(fileData, () => {
    if (!isPreviewMode.value) return; 
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendPreviewUpdate, 200);
  }, { deep: true }
);

// --- HANDLER DE MENSAGENS (COMUNICAÇÃO IFRAME <-> ADMIN) ---
const handleMessageFromPreview = async (event) => {
  
  // CASO 1: RASTREIO DE NAVEGAÇÃO (Resolução do CORS)
  // O plugin do site envia isso sempre que muda de rota
  if (event.data?.type === "SIRIUS_NAV_UPDATE") {
     // Guardamos a rota atual (ex: "/sobre") para usar no botão "Editar Página"
     lastPreviewPath.value = event.data.path;
     console.log("📍 Preview está em:", lastPreviewPath.value);
  }

  // CASO 2: SMART REDIRECT (Se tiver um botão "Editar" dentro do próprio site)
  if (event.data?.type === "SIRIUS_EDIT_REQUEST") {
    let fileToEdit = event.data.filepath;

    if (fileToEdit) {
      isPreviewMode.value = false; // Fecha o preview imediatamente

      const isStandardContent = fileToEdit.match(/\.(md|toml|yaml|yml)$/i);
      const isAlreadyIndex = fileToEdit.match(/(_index|index)\.(md|toml|yaml|yml)$/i);

      if (isStandardContent && !isAlreadyIndex) {
        // Se veio "blog/post.md", tenta achar "blog/post/_index.md" se for pasta
        const possibleFolder = fileToEdit.replace(/\.(md|toml|yaml|yml)$/i, "");
        
        // Tenta selecionar direto, se falhar o usuário navega manualmente
        // (Aqui você pode reintroduzir a lógica de verificação de API se quiser ser muito preciso)
        handleNavigate.selectFile(`${possibleFolder}/_index.md`); 
      } else {
        handleNavigate.selectFile(fileToEdit);
      }
    }
  }
};

const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    if (currentFile.value) saveFile();
  }
  if (e.key === "Escape" && isPreviewMode.value) {
    isPreviewMode.value = false;
  }
};

// --- VERSÃO SEGURA (SEM CORS) ---
const editPageFromPreview = async () => {
  // Usa o caminho recebido via postMessage ou fallback para o currentFile original
  let path = lastPreviewPath.value || "";
  
  // Normaliza (remove barra final)
  if (path.endsWith('/') && path !== '/') path = path.slice(0, -1);

  console.log("📝 Tentando editar a partir do preview:", path);

  if (!path) {
      toast.add({ severity: 'warn', summary: 'Aguardando navegação', detail: 'Navegue no preview para detectar a página.' });
      return;
  }

  // CASO 1: HOME
  if (path === '' || path === '/') {
      handleNavigate.selectFile('content/_index.md');
      isPreviewMode.value = false;
      return;
  }

  // CASO 2: TENTATIVA INTELIGENTE
  const candidates = [
      `content${path}.md`,        // ex: content/sobre.md
      `content${path}/_index.md`, // ex: content/sobre/_index.md
      `content${path}/index.md`
  ];

  for (const candidate of candidates) {
      try {
          // Verifica se arquivo existe na API (sem baixar o conteúdo todo)
          const folder = candidate.substring(0, candidate.lastIndexOf('/'));
          const file = candidate.split('/').pop();
          
          // Pequeno fetch apenas para checar existência (head check seria ideal, mas esse serve)
          const check = await $fetch("/api/admin/storage", {
              params: { site: siteContext.value, folder, file }
          });

          if (check && check.content !== undefined) {
              handleNavigate.selectFile(candidate);
              isPreviewMode.value = false; // Fecha o preview
              toast.add({ severity: 'success', summary: 'Página carregada', life: 1500 });
              return;
          }
      } catch (err) {
          // Continua tentando...
      }
  }

  toast.add({ severity: 'warn', summary: 'Arquivo não encontrado', detail: `Não encontrei um .md para ${path}` });
};

onMounted(() => {
  window.addEventListener("message", handleMessageFromPreview);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessageFromPreview);
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="h-screen w-screen bg-[#0a0f0d] text-slate-300 flex flex-col overflow-hidden font-sans">
    
  <header
      class="h-14 bg-[#141b18] border-b border-white/5 shrink-0 flex items-center justify-between px-4 z-20 select-none shadow-sm relative overflow-hidden gap-4"
    >
      <div class="flex items-center shrink-0">
        <span class="font-black text-slate-200 text-lg ml-2">Sirius Studio</span>
      </div>

      <div v-if="isPreviewMode" class="flex-1 flex items-center justify-center gap-3 min-w-0 transition-all">
          
          <div class="flex items-center gap-2 bg-black/30 border border-white/10 rounded-full px-4 py-1.5 max-w-xl w-full">
              <i class="pi pi-lock text-[10px] text-green-500"></i> <span class="text-xs font-mono text-slate-400 truncate flex-1 text-center">{{ currentPreviewDisplayUrl }}</span>
              <i class="pi pi-refresh text-[10px] text-slate-500 cursor-pointer hover:text-white" @click="handlePreview"></i>
          </div>

          <div class="flex items-center gap-2 shrink-0">
               <button 
                  @click="editPageFromPreview" 
                  class="flex items-center gap-2 px-3 py-1.5 bg-[#6f942e] hover:bg-[#5a7a23] text-black font-bold text-xs rounded-full transition-colors shadow-[0_0_10px_rgba(111,148,46,0.2)]"
                  title="Editar a página atual"
               >
                  <i class="pi pi-file-edit"></i> <span class="hidden sm:inline">Editar Página</span>
               </button>

               <button 
                  @click="isPreviewMode = false" 
                  class="flex items-center justify-center w-8 h-8 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors"
                  title="Fechar Preview"
               >
                  <i class="pi pi-times"></i>
               </button>
          </div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button @click="toggleUserMenu" class="flex items-center gap-2 w-8 h-8 justify-center rounded-full hover:bg-white/5 transition-colors">
          <i class="pi pi-user"></i>
        </button>
        <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
      </div>
    </header>
    <div class="flex-1 flex flex-col overflow-hidden relative">

      <div v-show="!isPreviewMode" class="flex-1 flex flex-row overflow-hidden">
        
        <aside class="w-12 h-full bg-[#141b19] border-r border-white/5 flex flex-col items-center py-3 shrink-0 z-30 gap-4">
          <button @click="showFileManager = !showFileManager" class="w-8 h-8 rounded-md flex items-center justify-center transition-all" :class="showFileManager ? 'text-[#6f942e]' : 'text-zinc-500'">
            <i class="pi pi-folder text-lg"></i>
          </button>
          <button @click="goToBackup" class="w-8 h-8 rounded-md flex items-center justify-center text-zinc-500">
            <i class="pi pi-cog text-lg"></i>
          </button>
          <Menu ref="settingsMenu" :model="settingsItems" :popup="true" />
        </aside>

        <div v-show="showFileManager" class="h-full bg-[#111614] shrink-0 z-10" :style="{ width: fileManagerWidth + 'px' }">
          <FileManager
            :files="sidebarFiles"
            :current-folder="sidebarFolder"
            :current-file="sidebarHighlightFile"
            :site-context="siteContext"
            :is-collection-folder="false"
            @navigate="handleNavigate.navigate"
            @select="handleNavigate.selectFile"
            @back="handleNavigate.goBack"
            @create-file="createActions.openFile"
            @create-folder="createActions.openFolder"
            @create-collection="createActions.openCollection"
            @refresh="handleNavigate.refresh"
          />
        </div>

        <div v-show="showFileManager" class="w-[4px] h-full cursor-col-resize hover:bg-[#6f942e] bg-transparent z-20 shrink-0 -ml-[2px]" @mousedown.prevent="startSidebarResize"></div>
        <div v-if="isResizingSidebar" class="fixed inset-0 z-50 cursor-col-resize bg-transparent"></div>

        <main class="flex-1 flex flex-col min-w-0 bg-[#0a0f0d] relative">
          <slot name="workspace-content">
            
            <div class="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0f0d] shrink-0">
              <nav class="flex items-center gap-2 text-xs font-mono px-2 py-1 bg-black/20 rounded-md">
                <template v-for="(crumb, index) in folderBreadcrumbs" :key="crumb.path">
                  <span v-if="index > 0" class="text-slate-600">/</span>
                  <button @click="navigateToBreadcrumb(crumb)" :disabled="crumb.disabled" :class="['transition-colors max-w-[320px]', crumb.disabled ? 'text-[#6f942e] font-bold cursor-default' : 'text-slate-500 hover:text-white cursor-pointer hover:underline']">
                    {{ crumb.label }}
                  </button>
                </template>
              </nav>

              <div class="flex items-center bg-white/5 rounded-lg p-1 border border-white/5 gap-1">
                <button @click="saveFile" v-if="currentFile" class="flex items-center gap-2 px-3 py-1.5 bg-[#6f942e] text-black font-bold text-xs rounded hover:bg-[#5a7a23] transition-colors">
                  <i class="pi pi-save"></i> Salvar
                </button>
                <div class="w-[1px] h-4 bg-white/10 mx-0.5"></div>
                <button @click="handlePreview" class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs rounded transition-colors" title="Visualizar no Site">
                  <i class="pi pi-eye"></i> <span>Preview</span>
                </button>
                <button @click="handlePublish" class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-white font-bold text-xs rounded transition-colors">
                  <i class="pi pi-cloud-upload"></i> Publicar
                </button>
              </div>
            </div>

            <div class="flex-1 flex flex-row overflow-hidden relative">
              
              <div class="flex-1 flex flex-col bg-[#0a0f0d] min-w-0 h-full relative">
                <CollectionFiles
                  v-if="collectionPanelVisible"
                  :files="mainFiles"
                  :current-folder="mainFolder"
                  @select="handleNavigate.loadFile"
                  @create-item="createActions.openFile(mainFolder)"
                />
                <AdminMarkdownEditor
                  v-else-if="currentFile"
                  ref="markdownEditorRef"
                  class="w-full h-full"
                  :content="fileData.content"
                  @update:content="fileData.content = $event"
                  :site-context="siteContext"
                  :current-folder="mainFolder"
                  :current-file="currentFile"
                  @toggle-raw="isRawMode = !isRawMode" 
                  :is-raw-mode="isRawMode"
                  @open-image="imageActions.open()"
                />
              </div>

              <div v-if="showMetaSidebar" class="flex flex-row h-full shrink-0">
                <div class="w-[4px] h-full cursor-col-resize hover:bg-[#6f942e] bg-black/40 z-20 shrink-0 flex items-center justify-center group relative" @mousedown.prevent="startResizeFrontmatter">
                  <div class="w-[1px] h-8 bg-white/20 group-hover:bg-white/80 rounded-full"></div>
                </div>
                <div class="flex flex-col bg-[#141b18] border-l border-white/5 h-full" :style="{ width: frontmatterWidth + 'px' }">
                  <div class="flex-1 overflow-y-auto custom-scrollbar">
                    <AdminMetaEditor
                      v-if="currentFile && fields.length > 0"
                      :modelValue="fileData.frontmatter"
                      :frontmatter="fileData.frontmatter"
                      :fields="fields"
                      :site-context="siteContext"
                      :current-folder="mainFolder"
                      :site-url="userSiteUrl"
                      @open-image="imageActions.open"
                      class="h-full"
                    />
                    <div v-else class="p-4 text-xs text-slate-500 text-center flex flex-col items-center justify-center h-full gap-2">
                      <i class="pi pi-cog text-2xl opacity-20"></i>
                      <p>{{ currentFile ? "Sem campos configurados." : "Selecione um arquivo." }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="isResizingFrontmatter" class="fixed inset-0 z-50 cursor-col-resize bg-transparent"></div>
            </div>
          </slot>
        </main>
      </div>

   <div v-if="isPreviewMode" class="flex-1 flex flex-col bg-white relative">
          <iframe 
            ref="previewIframe"
            :src="previewUrl" 
            class="w-full h-full border-0"
            @load="sendPreviewUpdate"
          ></iframe>
      </div>

    </div>

    <Dialog v-model:visible="showImageModal" modal header="Mídia" :showHeader="true" :style="{ width: '90vw', maxWidth: '1200px' }" :contentStyle="{ padding: '0', height: '80vh' }" class="bg-[#141b18]" :dismissableMask="true" appendTo="body">
      <div class="w-full h-full bg-[#141b18] flex flex-col text-white">
        <div v-if="!showImageModal">Carregando...</div>
        <ImageExplorer v-if="showImageModal" :initial-folder="editorCtxFolder || 'content'" @select="imageActions.handleSelect" @close="showImageModal = false" />
      </div>
    </Dialog>

    <CreateFileModal v-model:visible="showCreateModal" :site-context="siteContext" :current-folder="creationTargetFolder" @success="createActions.onFileCreated" />
    <CreateFolderModal v-model:visible="showFolderCreateModal" :site-context="siteContext" :current-folder="sidebarFolder" @success="createActions.onFolderCreated" />
    <CreateCollectionModal v-model:visible="showCollectionCreateModal" :site-context="siteContext" :current-folder="sidebarFolder" @success="createActions.onCollectionCreated" />
    <Dialog v-model:visible="showBackupModal" modal header="Backups" :style="{ width: '800px' }" class="bg-[#141b18]"><BackupManager /></Dialog>

    <div class="fixed bottom-8 right-4 z-[9999] w-172 bg-black/80 border border-white/10 rounded-lg p-2 font-mono text-[10px] pointer-events-none opacity-50 hidden">
      <div v-for="(log, i) in debugLogs" :key="i" class="truncate text-slate-300"> > {{ log }} </div>
    </div>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(111, 148, 46, 0.5); }
</style>