<script setup>
import yaml from "js-yaml";
import { useToast } from "primevue/usetoast";

// Componentes
import AdminSidebar from "~/components/admin/Sidebar.vue";
import AdminTopbar from "~/components/admin/Topbar.vue";
import AdminMetaEditor from "~/components/admin/MetaEditor.vue";
import AdminMarkdownEditor from "~/components/admin/MarkdownEditor.vue";
import ImageExplorer from "~/components/admin/ImageExplorer.vue";
import DashboardHome from "~/components/admin/DashboardHome.vue";
import FileToolbar from "~/components/admin/FileToolbar.vue";
import BackupManager from "~/components/admin/BackupManager.vue";

definePageMeta({ layout: "" });

const toast = useToast();
const route = useRoute();
const siteContext = useCookie("cms_site_context");

// --- ESTADOS DE NAVEGAÇÃO E CONTEXTO ---
const showSidebar = ref(false);
const showMetaSidebar = ref(true);
const showBackupModal = ref(false);
// [ALTERADO] 'currentFile': Agora armazena o CAMINHO COMPLETO (ex: content/blog/post.md)
const currentFile = ref(route.query.file || "");

// --- ESTADOS DE LAYOUT (RESIZABLE) ---
const sidebarWidth = ref(350); // Largura inicial em pixels
const isResizing = ref(false);
const isMobile = ref(false); // [NOVO]

// Detecta mudança de tela para ajustar layout
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024; // 1024px é o breakpoint 'lg' do Tailwind
};
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  window.addEventListener("keydown", handleKeydown); // Mantém seu listener antigo
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  window.removeEventListener("keydown", handleKeydown);
});

const startResize = (e) => {
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  const doDrag = (evt) => {
    // Calcula a nova largura baseada no movimento do mouse
    // Delta = (Posição Atual) - (Posição Inicial)
    const newWidth = startWidth + (evt.clientX - startX);

    // Limites (Min: 200px, Max: 600px)
    if (newWidth > 200 && newWidth < 800) {
      sidebarWidth.value = newWidth;
    }
  };

  const stopDrag = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", doDrag);
    document.removeEventListener("mouseup", stopDrag);
    // Reativa a seleção de texto no body (opcional, mas boa prática)
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  // Adiciona listeners no DOCUMENTO inteiro (para não perder o foco se arrastar rápido)
  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag);

  // Evita selecionar texto enquanto arrasta
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";
};

// [ALTERADO] Helper para extrair pasta do arquivo atual
const getFolderFromFile = (fullPath) => {
  if (!fullPath) return "content";
  const lastSlash = fullPath.lastIndexOf("/");
  return lastSlash !== -1 ? fullPath.substring(0, lastSlash) : "content";
};

// [ALTERADO] 'currentFolder': Inicializa baseado no arquivo ou fallback
const currentFolder = ref(
  currentFile.value
    ? getFolderFromFile(currentFile.value)
    : route.query.folder || "content",
);

// [ALTERADO] 'editorCtxFolder': Agora é COMPUTADO para garantir consistência
const editorCtxFolder = computed(() => {
  if (!currentFile.value) return currentFolder.value;
  return getFolderFromFile(currentFile.value);
});

// [ALTERADO] Helper para pegar só o nome do arquivo para APIs
const currentFileNameOnly = computed(() => {
  if (!currentFile.value) return "";
  return currentFile.value.split("/").pop();
});

// Detecta a extensão do arquivo atual
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

// --- MODAIS ---
const showCreateModal = ref(false);
const showFolderModal = ref(false);
const showImageModal = ref(false);
const imageTarget = ref(null);
const newFileForm = ref({ name: "", type: "default" });
const newFolderName = ref("");

// =============================================================================
// DATA FETCHING
// =============================================================================

// --- CONFIGURAÇÃO DO SITE (VIA _config.json) ---
const { data: configFileData } = await useFetch("/api/admin/storage", {
  query: {
    site: siteContext.value,
    folder: ".",
    file: "_config.json",
  },
  key: `site-config-${siteContext.value}`,
});

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
    console.error("Erro ao ler _config.json:", e);
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

// [NOVO] 4. LISTA DE PASTAS (Para o Modal de Mover)
// Busca todas as pastas do sistema para montar a árvore
const { data: allFolders, refresh: refreshFolders } = await useFetch(
  "/api/admin/folders",
  {
    query: { site: siteContext },
    key: `folders-${siteContext.value}`,
  },
);

// 2. CONTEÚDO DO ARQUIVO (Editor)
const { data: fileData, error: fileError } = await useAsyncData(
  "file-content",
  () => {
    if (!currentFile.value) return Promise.resolve(null);
    return $fetch("/api/admin/storage", {
      params: {
        site: siteContext.value,
        // [ALTERADO] Divide o caminho completo para a API
        folder: editorCtxFolder.value,
        file: currentFileNameOnly.value,
      },
    });
  },
  {
    watch: [currentFile], // Monitora apenas o arquivo completo
  },
);

// [ALTERADO] Função para lidar com a digitação manual do caminho (Toolbar)
const handleManualNavigation = (fullPath) => {
  const cleanPath = fullPath.replace(/^\//, ""); // Remove barra inicial

  // Atualiza a pasta da sidebar para onde o arquivo está
  const newFolder = getFolderFromFile(cleanPath);
  currentFolder.value = newFolder;

  // Atualiza o arquivo atual e URL
  currentFile.value = cleanPath;
  window.history.pushState({}, "", `?file=${cleanPath}`);

  toast.add({
    severity: "info",
    summary: "Navegando...",
    detail: `Indo para ${cleanPath}`,
    life: 1000,
  });
};

// --- LÓGICA DE PREVIEW ---
const getPreviewPath = () => {
  if (!currentFile.value) return "/";

  if (form.value.frontmatter?.slug)
    return `/${form.value.frontmatter.slug.replace(/^\//, "")}`;
  if (form.value.frontmatter?.permalink)
    return `/${form.value.frontmatter.permalink.replace(/^\//, "")}`;

  // Fallback: Caminho do arquivo (remove content/ e extensão)
  let path = currentFile.value.replace(/\.md$/, "");

  if (path.endsWith("/_index") || path === "_index")
    path = path.replace("_index", "");
  if (path.startsWith("content/")) path = path.replace("content/", "");

  return path.startsWith("/") ? path : `/${path}`;
};

// --- ESTADO DO PREVIEW ---
const previewWindow = ref(null);

function toPreviewUrl(inputUrl) {
  try {
    const url = new URL(inputUrl);
    if (url.hostname.startsWith("preview.")) return inputUrl;

    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.replace("www.", "preview.");
    } else {
      url.hostname = `preview.${url.hostname}`;
    }
    return url.toString();
  } catch (error) {
    console.error("URL inválida fornecida:", inputUrl);
    return inputUrl;
  }
}

const getPreviewLink = () => {
  const currentBase = configFileData_obj.url;
  const path = form.value.path || "";
  const fullUrl = `${currentBase}${path}`;
  return toPreviewUrl(fullUrl);
};

// Substitua a antiga const handlePreview_ ou handlePreview por esta:

const handlePreview = () => {
  // 1. Validação de Segurança: O site tem URL configurada?
  if (!configFileData_obj?.url) {
    toast.add({
      severity: "warn",
      summary: "Configuração Ausente",
      detail: 'Defina a chave "url" no arquivo _config.json na raiz do site.',
      life: 2000,
    });
    return;
  }

  // 2. Lógica de Resolução do Caminho (Path)
  let path = "/";

  if (form.value.frontmatter?.slug) {
    // Prioridade 1: O usuário definiu um slug manual
    path = form.value.frontmatter.slug;
  } else if (form.value.frontmatter?.permalink) {
    // Prioridade 2: Permalink manual
    path = form.value.frontmatter.permalink;
  } else {
    // Prioridade 3: Automático baseado no nome do arquivo
    // Ex: content/portfolio/projeto-x.md
    let cleanPath = currentFile.value || "";

    // Remove a extensão .md
    cleanPath = cleanPath.replace(/\.md$/, "");

    // Remove o prefixo 'content/' se existir (padrão do Nuxt Content)
    if (cleanPath.startsWith("content/")) {
      cleanPath = cleanPath.substring(8);
    }

    // Trata arquivos de índice (_index vira a raiz da pasta)
    if (cleanPath.endsWith("/_index") || cleanPath === "_index") {
      cleanPath = cleanPath.replace("_index", "");
    }

    // Garante que comece com / e não tenha barra dupla no final (a menos que seja raiz)
    path = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
  }

  // 3. Montagem da URL Base
  // Garante que a URL base não tenha barra no final para não duplicar com o path
  const baseUrl = configFileData_obj.url.endsWith("/")
    ? configFileData_obj.url.slice(0, -1)
    : configFileData_obj.url;

  const fullProductionUrl = `${baseUrl}${path}`;

  // 4. Conversão para URL de Preview
  // Usa sua função auxiliar que troca 'www' por 'preview' ou adiciona o subdomínio
  // let finalUrl = toPreviewUrl(fullProductionUrl);
  let finalUrl = fullProductionUrl;

  // Adiciona query string para o Nuxt entender que deve ouvir eventos de preview
  // Se já tiver query string, usa &, senão usa ?
  finalUrl += finalUrl.includes("?") ? "&preview=true" : "?preview=true";

  console.log("Abrindo Preview em:", finalUrl);

  // 5. Abertura da Janela
  // 'sirius_preview' garante que sempre recarregue a MESMA aba em vez de abrir várias
  previewWindow.value = window.open(finalUrl, "sirius_preview");

  // 6. Sincronização Inicial
  // Espera 1.5s para garantir que o Nuxt carregou na nova aba e envia os dados atuais
  setTimeout(() => sendPreviewUpdate(), 1500);
};

// --- LÓGICA DE LIVE UPDATE ---
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

watch(
  form,
  () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendPreviewUpdate, 50);
  },
  { deep: true },
);

watch(rawContent, () => {
  if (showRawMode.value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        parseMD(rawContent.value);
      } catch (e) {}
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

// 3. SCHEMA (Campos do Editor)
const { data: schemaData } = await useFetch("/api/admin/schema", {
  query: {
    site: siteContext,
    folder: editorCtxFolder,
    filename: currentFileNameOnly, // Usa o computed só do nome
  },
  watch: [editorCtxFolder, currentFile],
});

// =============================================================================
// LÓGICA DO MODELO / PARSER
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
    if (field.type === "simple_list") {
      cleanData[field.key] = data.map((item) => item.text || "");
    }
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

  // Se for JSON ou YAML, populamos o rawContent imediatamente
  // Isso garante que se o usuário trocar para modo Raw, o texto está lá
  if (ext === 'json' || ext === 'yml' || ext === 'yaml') {
    rawContent.value = full;
    
    // Tentamos parsear para o frontmatter também, caso você tenha Schemas definidos
    try {
      if (ext === 'json') {
        form.value.frontmatter = JSON.parse(full);
      } else {
        form.value.frontmatter = yaml.load(full) || {};
      }
    } catch (e) {
      console.error("Erro parsing dados:", e);
      form.value.frontmatter = {};
    }
    
    form.value.content = ""; // Arquivos de dados não têm "body" de markdown
    
    // [IMPORTANTE] Força o modo Raw para ver o código se não tiver content
    showRawMode.value = true;
    return;
  }

  // --- LÓGICA MARKDOWN (.md) ---
  // Se for MD, desligamos o modo raw por padrão (ou mantemos o estado anterior)
  if (showRawMode.value && ext === 'md') {
     // Se já estava em raw, mantém raw
     rawContent.value = full;
  } else {
     showRawMode.value = false;
  }

  const normalized = full.replace(/\r\n/g, "\n");
  const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = normalized.match(fmRegex);

  try {
    if (match) {
      form.value.frontmatter = yaml.load(match[1]) || {};
      form.value.content = match[2].trim();
    } else {
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
    // Atualiza o rawContent para ficar sincronizado
    rawContent.value = full; 
  } catch (e) {
    console.error("YAML Parse Error:", e);
    form.value.frontmatter = {};
    form.value.content = full;
  }
};

watch(
  fileData,
  (newData) => {
    const content = newData?.content || "";
    parseMD(content);
  },
  { immediate: true }
);

watch(
  [currentModel, () => form.value.frontmatter],
  ([newModel, fm]) => {
    if (showRawMode.value) return;
    if (!newModel?.fields || !fm) return;

    newModel.fields.forEach((field) => {
      const data = fm[field.key];
      if (!Array.isArray(data)) return;

      if (field.type === "simple_list") {
        if (data.length > 0 && typeof data[0] !== "object") {
          fm[field.key] = data.map((str) => ({
            text: str,
            _uuid: crypto.randomUUID(),
          }));
        } else {
          data.forEach((item) => {
            if (typeof item === "object" && !item._uuid)
              item._uuid = crypto.randomUUID();
          });
        }
      }

      if (field.type === "repeater") {
        data.forEach((item) => {
          if (item && typeof item === "object" && !item._uuid)
            item._uuid = crypto.randomUUID();
        });
      }
    });
  },
  { deep: true },
);

// =============================================================================
// NAVEGAÇÃO
// =============================================================================

const navigate = {
  enterFolder: (f) => {
    currentFolder.value = `${currentFolder.value}/${f}`;
  },
  goBack: () => {
    const parts = currentFolder.value.split("/");
    if (parts.length > 1) {
      parts.pop();
      currentFolder.value = parts.join("/");
    }
  },
  // [ALTERADO] Select File agora monta o path completo
  selectFile: (fileNameOrPath) => {
    // Se o input não tiver barras, assumimos que veio da sidebar e juntamos com a pasta atual
    // Se já tiver barra, assumimos que é um path completo (ex: navegação manual)
    const fullPath = fileNameOrPath.includes("/")
      ? fileNameOrPath
      : `${currentFolder.value}/${fileNameOrPath}`;

    currentFile.value = fullPath;

    // Atualiza a URL apenas com ?file=caminho/completo.md
    window.history.pushState({}, "", `?file=${fullPath}`);

    showSidebar.value = false;
    showRawMode.value = false;
  },
  changeRoot: (r) => {
    currentFolder.value = r;
  },
  toDashboard: () => {
    currentFile.value = "";
    // Navega diretamente para /dashboard (raiz do sistema)
    navigateTo("/edit");
  },
};

// =============================================================================
// AÇÕES
// =============================================================================

const createActions = {
  openFile: () => {
    newFileForm.value = { name: "", type: "default" };
    showCreateModal.value = true;
  },
  openFolder: () => {
    newFolderName.value = "";
    showFolderModal.value = true;
  },
  handleFile: async () => {
    let name = newFileForm.value.name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name.endsWith(".md")) name += ".md";

    const content = `---\n${yaml.dump({ schema: newFileForm.value.type, title: newFileForm.value.name, date: new Date().toISOString().split("T")[0] })}---\n\n# ${newFileForm.value.name}`;

    await $fetch("/api/admin/storage", {
      method: "POST",
      body: {
        site: siteContext.value,
        folder: currentFolder.value,
        file: name,
        content,
      },
    });

    showCreateModal.value = false;
    await refreshFiles();
    navigate.selectFile(name); // O selectFile agora lida com a junção
  },

  handleFolder: async () => {
    await $fetch("/api/admin/mkdir", {
      method: "POST",
      body: {
        site: siteContext.value,
        folder: currentFolder.value,
        name: newFolderName.value,
      },
    });
    showFolderModal.value = false;

    // Atualiza a sidebar de arquivos
    await refreshFiles();

    // [NOVO] Atualiza a árvore de pastas
    await refreshFolders();
  },
};

const imageActions = {
  open: (target) => {
    if (!target) imageTarget.value = { mode: "markdown" };
    else if (Array.isArray(target.list))
      imageTarget.value = { mode: "push", list: target.list };
    else imageTarget.value = { mode: "set", obj: target.obj, key: target.key };
    showImageModal.value = true;
  },
  handleSelect: (url) => {
    if (showRawMode.value) {
      rawContent.value += `\n![](${url})`;
    } else {
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
    // INDO PARA O MODO RAW (Gerar texto a partir dos campos)
    const cleanData = getCleanData();
    
    if (ext === 'json') {
      rawContent.value = JSON.stringify(cleanData, null, 2);
    } 
    else if (ext === 'yml' || ext === 'yaml') {
      rawContent.value = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
    } 
    else {
      // Markdown Padrão
      const y = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
      const contentPart = form.value.content
        ? `\n\n${form.value.content.trim()}`
        : "";
      rawContent.value = `---\n${y.trim()}\n---${contentPart}`;
    }
  } else {
    // VOLTANDO PARA O MODO VISUAL (Parsear texto para campos)
    parseMD(rawContent.value);
  }
  showRawMode.value = !showRawMode.value;
};

const saveFile = async () => {
  if (!currentFile.value) return;
  loadingSave.value = true;

  let finalContent = "";
  const ext = fileExtension.value;

  // --- SALVANDO MODO RAW (TEXTO DIRETO) ---
  if (showRawMode.value) {
    finalContent = rawContent.value;

    // Validação básica de segurança antes de salvar
    try {
      if (ext === 'json') JSON.parse(finalContent);
      if (ext === 'yml' || ext === 'yaml') yaml.load(finalContent);
    } catch (e) {
      toast.add({ 
        severity: "error", 
        summary: "Erro de Sintaxe", 
        detail: `O formato ${ext.toUpperCase()} está inválido. Corrija antes de salvar.` 
      });
      loadingSave.value = false;
      return; // Aborta salvamento se o JSON estiver quebrado
    }
  } 
  // --- SALVANDO MODO VISUAL ---
  else {
    const cleanData = getCleanData();

    if (ext === 'json') {
      finalContent = JSON.stringify(cleanData, null, 2);
    } 
    else if (ext === 'yml' || ext === 'yaml') {
      finalContent = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
    } 
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
    
    // Se salvamos em modo visual, atualizamos o rawContent para refletir a mudança
    if (!showRawMode.value) {
       rawContent.value = finalContent;
    }
    
  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Erro ao salvar" });
  } finally {
    loadingSave.value = false;
  }
};


const isPublishing = ref(false);

const handlePublish = async () => {
  if (isPublishing.value) return;
  isPublishing.value = true;
  toast.add({
    severity: "info",
    summary: "Publicando...",
    detail: "Gerando arquivos do site.",
    life: 2000
  });

  try {
    const result = await $fetch("/api/admin/compile-all", {
      method: "POST",
      body: {
        site: siteContext.value,
      },
    });

    if (result.success) {
      toast.add({
        severity: "success",
        summary: "Sucesso!",
        detail: "Site atualizado e arquivos gerados.",
        life: 2000,
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Falha ao publicar site.",
      life: 2000
    });
  } finally {
    isPublishing.value = false;
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

const handleDeleteFile = async (item) => {
  // Se veio do evento de Sidebar, item é objeto. Se Toolbar, é nulo.
  const fileName = item?.name || currentFileNameOnly.value;

  try {
    await $fetch("/api/admin/storage", {
      method: "DELETE",
      body: {
        site: siteContext.value,
        folder: currentFolder.value,
        file: fileName,
      },
    });

    toast.add({
      severity: "success",
      summary: "Excluído",
      detail: "Item removido com sucesso.",
      life: 1000,
    });

    if (currentFileNameOnly.value === fileName) {
      currentFile.value = "";
      navigate.toDashboard();
    }

    await refreshFiles();
  } catch (e) {
    console.error(e);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Não foi possível excluir o item.",
      life: 3000,
    });
  }
};

// Ações para o Toolbar
// Ações para o Toolbar
const handleRenameAction = async (newName) => {
  try {
    // 1. Faz a requisição ao servidor
    const response = await $fetch("/api/admin/rename", {
      method: "POST",
      body: {
        // Usa currentFile.value que já é o path completo (ex: content/blog/post.md)
        oldname: currentFile.value, 
        // Monta o novo path sugerido
        newname: `${editorCtxFolder.value}/${newName}`,
      },
    });

    toast.add({ severity: "success", summary: "Renomeado com sucesso",
    life: 2000 });
    
    // 2. Atualiza a lista lateral para refletir o novo nome
    await refreshFiles();

    // 3. NAVEGAÇÃO INTELIGENTE
    // A API retorna o objeto { success: true, newname: 'caminho/sanitizado.md' }
    // Usamos esse retorno para garantir que vamos abrir o arquivo exato que foi salvo.
    if (response && response.newname) {
      navigate.selectFile(response.newname);
    } else {
      // Fallback caso a API não retorne o nome (segurança)
      navigate.selectFile(`${editorCtxFolder.value}/${newName}`);
    }

  } catch (e) {
    console.error(e);
    toast.add({
      severity: "error",
      summary: "Erro ao renomear",
      detail: e.data?.message || e.message,
      life: 2000
    });
  }
};


const handleMoveAction = async (newPath) => {
  try {
    // 1. Executa a mudança no servidor
    await $fetch("/api/admin/rename", {
      method: "POST",
      body: {
        oldname: currentFile.value,
        newname: newPath,
      },
    });

    toast.add({
      severity: "success",
      summary: "Movido com sucesso",
      detail: `Agora em: ${newPath}`,
      life: 1000,
    });

    // 2. Calcula a nova pasta baseada no caminho destino
    // Ex: "content/blog/post.md" -> "content/blog"
    const lastSlashIndex = newPath.lastIndexOf("/");
    const newFolderDest =
      lastSlashIndex !== -1 ? newPath.substring(0, lastSlashIndex) : "content";

    // 3. Atualiza o contexto da Sidebar para a nova pasta
    // Isso fará a sidebar carregar os arquivos do local de destino
    currentFolder.value = newFolderDest;

    // 4. Atualiza a árvore de pastas (caso tenha criado pasta nova no processo, embora raro no move)
    await refreshFolders();

    // 5. Força a atualização da lista de arquivos imediatamente
    await refreshFiles();

    // 6. Abre o arquivo no novo local
    // O navigate.selectFile já atualiza a URL e carrega o conteúdo
    navigate.selectFile(newPath);
  } catch (e) {
    console.error(e);
    toast.add({
      severity: "error",
      summary: "Erro ao mover",
      detail: e.data?.message || e.message,
      life: 2000
    });
  }
};

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template>
  <div
    class="min-h-screen bg-[#0a0f0d] text-slate-200 font-sans selection:bg-[#6f942e]/30 flex flex-col"
  >
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

        <div
          v-if="showRawMode"
          class="flex-1 animate-fade-in min-h-0 bg-[#141b18] border-x border-b border-white/5 rounded-b-lg flex flex-col relative"
        >
          <div
            class="absolute top-2 right-4 z-10 opacity-50 hover:opacity-100 transition-opacity pointer-events-none"
          >
            <span
              class="text-[10px] text-orange-400 bg-orange-900/20 border border-orange-500/20 px-2 py-1 rounded"
            >
              ⚠️ Cuidado com a indentação YAML
            </span>
          </div>
          <textarea
            v-model="rawContent"
            class="flex-1 p-6 bg-transparent text-[#a3d95b] font-mono text-[13px] leading-[1.6] outline-none resize-none custom-scrollbar"
            spellcheck="false"
            placeholder="Cole seu Markdown aqui..."
          ></textarea>
        </div>

        <div
          v-else
          class="flex flex-row h-full overflow-hidden animate-fade-in pt-3"
        >
          <aside
            v-show="showMetaSidebar"
            class="shrink-0 flex flex-col pr-1"
            :style="{ width: sidebarWidth + 'px' }"
          >
            <div class="h-full overflow-y-auto custom-scrollbar pr-2">
              <AdminMetaEditor
                :fields="currentModel.fields"
                :frontmatter="form.frontmatter"
                :site-context="siteContext"
                @open-image="imageActions.open"
              />
            </div>
          </aside>

          <div
            v-show="showMetaSidebar"
            class="w-[4px] h-full cursor-col-resize hover:bg-[#6f942e] active:bg-[#6f942e] transition-colors duration-150 flex flex-col justify-center items-center group select-none z-10 mr-2"
            :class="isResizing ? 'bg-[#6f942e]' : 'bg-transparent'"
            @mousedown.prevent="startResize"
          >
            <div
              class="w-[1px] h-full bg-white/10 group-hover:bg-[#6f942e]/50 transition-colors"
            ></div>
          </div>

          <div class="flex-1 h-full min-w-0 overflow-hidden">
            <AdminMarkdownEditor
              v-model:content="form.content"
              :current-folder="editorCtxFolder"
              :current-file="currentFile"
              :is-raw="showRawMode"
              @toggle-raw="toggleRawMode"
              @open-image="imageActions.open()"
            />
          </div>
        </div>
      </div>

      <div v-else class="h-[calc(100vh-120px)] w-full">
        <DashboardHome
          :site-context="siteContext"
          :current-folder="currentFolder"
          :files="sortedFiles"
          @navigate="
            (path) => {
              if (path.endsWith('.md')) navigate.selectFile(path);
              else navigate.changeRoot(path);
            }
          "
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
    <Dialog
      v-model:visible="showCreateModal"
      modal
      header="NOVO ARQUIVO"
      :style="{ width: '400px' }"
      class="bg-[#141b18]"
    >
      <div class="flex flex-col gap-6 pt-4">
        <div class="flex flex-col gap-2">
          <label class="text-[10px] uppercase font-black text-[#6f942e]"
            >Nome</label
          >
          <InputText
            v-model="newFileForm.name"
            class="bg-[#0a0f0d] border border-white/10 text-white"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[10px] uppercase font-black text-[#6f942e]"
            >Tipo</label
          >
          <div class="max-h-40 overflow-y-auto custom-scrollbar">
            <div
              v-for="t in availableTypes"
              :key="t.key"
              @click="newFileForm.type = t.key"
              :class="[
                'p-2 mb-1 rounded border cursor-pointer text-xs',
                newFileForm.type === t.key
                  ? 'border-[#6f942e] bg-[#6f942e]/10'
                  : 'border-white/10',
              ]"
            >
              {{ t.label }}
            </div>
          </div>
        </div>
        <Button
          label="CRIAR"
          class="bg-[#6f942e] border-none text-black font-black w-full"
          @click="createActions.handleFile"
        />
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showFolderModal"
      modal
      header="NOVA PASTA"
      :style="{ width: '350px' }"
      class="bg-[#141b18]"
    >
      <div class="flex flex-col gap-6 pt-4">
        <InputText
          v-model="newFolderName"
          placeholder="Nome da pasta"
          class="bg-[#0a0f0d] border border-white/10 text-white w-full"
        />
        <Button
          label="CRIAR"
          class="bg-[#6f942e] border-none text-black font-black w-full"
          @click="createActions.handleFolder"
        />
      </div>
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
