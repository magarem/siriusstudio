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

definePageMeta({ layout: "" });

const toast = useToast();
const route = useRoute();
const siteContext = useCookie("cms_site_context");

// --- ESTADOS DE NAVEGAÇÃO E CONTEXTO ---
const showSidebar = ref(false);
const showMetaSidebar = ref(true);

// 'currentFile': O arquivo aberto no momento (ex: '_index.md')
const currentFile = ref(route.query.file || "");

// 'currentFolder': Onde o usuário está navegando na SIDEBAR
const currentFolder = ref(route.query.folder || "content");

// 'editorCtxFolder': A pasta onde o ARQUIVO ABERTO está localizado.
const editorCtxFolder = ref(route.query.folder || "content");

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
// Busca o arquivo _config.json na raiz do site atual
console.log("query:", {
    site: siteContext.value,
    folder: "", // Busca na raiz
    file: "_config.json",
  })
const { data: configFileData } = await useFetch("/api/admin/storage", {
  query: {
    site: siteContext.value,
    folder: ".", // Busca na raiz
    file: "_config.json",
  },
  // Chave única para não conflitar com outros fetches
  key: `site-config-${siteContext.value}`,
});

console.log("configFileData:", configFileData.value)

// Computada para extrair a URL do JSON
const userSiteUrl = computed(() => {
  try {
    if (!configFileData.value || !configFileData.value.content) {
      return "";
    }

    // Faz o parse do conteúdo do arquivo (que vem como string)
    const config = JSON.parse(configFileData.value.content);

    // Retorna a URL limpa (sem barra no final)
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
  }
);

const sortedFiles = computed(() => files.value || []);

// 2. CONTEÚDO DO ARQUIVO (Editor)
const { data: fileData, error: fileError } = await useAsyncData(
  "file-content",
  () => {
    if (!currentFile.value) return Promise.resolve(null);
    return $fetch("/api/admin/storage", {
      params: {
        site: siteContext.value,
        folder: editorCtxFolder.value,
        file: currentFile.value,
      },
    });
  },
  {
    watch: [currentFile, editorCtxFolder],
  }
);

// --- LÓGICA DE PREVIEW ---
const getPreviewPath = () => {
  if (!currentFile.value) return "/";

  // 1. Frontmatter
  if (form.value.frontmatter?.slug)
    return `/${form.value.frontmatter.slug.replace(/^\//, "")}`;
  if (form.value.frontmatter?.permalink)
    return `/${form.value.frontmatter.permalink.replace(/^\//, "")}`;

  // 2. Fallback: Caminho do arquivo
  let path = currentFile.value.replace(/\.md$/, "");

  // Limpezas
  if (path.endsWith("/_index") || path === "_index")
    path = path.replace("_index", "");
  if (path.startsWith("content/")) path = path.replace("content/", "");

  return path.startsWith("/") ? path : `/${path}`;
};

const handlePreview = () => {
  // Validação robusta
  if (!userSiteUrl.value) {
    toast.add({
      severity: "warn",
      summary: "Configuração Ausente",
      detail: 'Crie um arquivo "_config.json" na raiz com a chave "url".',
      life: 5000,
    });
    return;
  }

  const path = getPreviewPath();
  const fullUrl = `${userSiteUrl.value}${path}`;

  window.open(fullUrl, "_blank");
};

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
    filename: computed(() =>
      currentFile.value ? currentFile.value.split("/").pop() : ""
    ),
  },
  watch: [editorCtxFolder, currentFile],
});

// =============================================================================
// LÓGICA DO MODELO / PARSER
// =============================================================================

const currentModel = computed(() => {
  if (!schemaData.value) return { fields: [] };
  const fmSchema = form.value.frontmatter?.schema;
  const filename = currentFile.value.split("/").pop();
  const mapSchema = schemaData.value.mapping?.[filename];
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
    return;
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
  } catch (e) {
    console.error("YAML Parse Error:", e);
    toast.add({
      severity: "error",
      summary: "Erro de Sintaxe",
      detail: "O YAML do cabeçalho está inválido.",
    });
  }
};

watch(
  fileData,
  (newData) => {
    if (newData?.content) {
      parseMD(newData.content);
      rawContent.value = newData.content;
    }
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
  { deep: true }
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
  selectFile: (f) => {
    currentFile.value = f;
    editorCtxFolder.value = currentFolder.value;
    window.history.pushState(
      {},
      "",
      `?file=${f}&folder=${editorCtxFolder.value}`
    );
    showSidebar.value = false;
    showRawMode.value = false;
  },
  changeRoot: (r) => {
    currentFolder.value = r;
  },
  toDashboard: () => {
    currentFile.value = "";
    const url = new URL(window.location);
    url.searchParams.delete("file");
    window.history.pushState({}, "", url);
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
    navigate.selectFile(name);
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
    await refreshFiles();
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
  },
};

const toggleRawMode = () => {
  if (!showRawMode.value) {
    const cleanData = getCleanData();
    const y = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
    const contentPart = form.value.content
      ? `\n\n${form.value.content.trim()}`
      : "";
    rawContent.value = `---\n${y.trim()}\n---${contentPart}`;
  } else {
    parseMD(rawContent.value);
  }
  showRawMode.value = !showRawMode.value;
};

const saveFile = async () => {
  if (!currentFile.value) return;
  loadingSave.value = true;

  let finalContent = "";

  if (showRawMode.value) {
    finalContent = rawContent.value;
    try {
      const parts = rawContent.value.split("---");
      if (parts.length >= 3) parseMD(rawContent.value);
    } catch (e) {}
  } else {
    const cleanData = getCleanData();
    const y = yaml.dump(cleanData, { indent: 2, lineWidth: -1, noRefs: true });
    const contentPart = form.value.content
      ? `\n\n${form.value.content.trim()}`
      : "";
    finalContent = `---\n${y.trim()}\n---${contentPart}`;
  }

  try {
    await $fetch("/api/admin/storage", {
      method: "POST",
      body: {
        site: siteContext.value,
        folder: editorCtxFolder.value,
        file: currentFile.value,
        content: finalContent,
      },
    });
    toast.add({
      severity: "success",
      summary: "Salvo",
      detail: "Arquivo atualizado.",
      life: 2000,
    });
  } catch (e) {
    toast.add({ severity: "error", summary: "Erro ao salvar" });
  } finally {
    loadingSave.value = false;
  }
};

const handlePublish = async () => {
  if (
    !confirm(
      `Deseja rodar o build para o site "${siteContext.value}"?\nIsso pode levar alguns minutos.`
    )
  )
    return;
  loadingPublish.value = true;
  try {
    const res = await $fetch("/api/admin/publish", {
      method: "POST",
      body: { site: siteContext.value },
    });
    toast.add({
      severity: "success",
      summary: "Publicado!",
      detail: "Build iniciado.",
      life: 5000,
    });
    console.log("Build Logs:", res.logs);
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Erro no Build",
      detail: "Verifique o console.",
      life: 5000,
    });
  } finally {
    loadingPublish.value = false;
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
  try {
    await $fetch("/api/admin/storage", {
      method: "DELETE",
      body: {
        site: siteContext.value,
        folder: currentFolder.value,
        file: item.name,
      },
    });

    toast.add({
      severity: "success",
      summary: "Excluído",
      detail: "Item removido com sucesso.",
      life: 3000,
    });

    if (
      currentFile.value === item.name &&
      editorCtxFolder.value === currentFolder.value
    ) {
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
      @preview="handlePreview"
      @logout="logout"
      @open-media="imageActions.open()"
      @go-dashboard="navigate.toDashboard"
    />

    <div class="flex-1 p-4 md:p-6 max-w-[1700px] mx-auto w-full">
      <div v-if="currentFile">
        <div v-if="showRawMode" class="h-[calc(100vh-120px)] animate-fade-in">
          <div
            class="w-full h-full bg-[#141b18] rounded-[0.5vw] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative"
          >
            <div
              class="px-4 py-2 border-b border-white/5 bg-white/5 flex justify-between items-center"
            >
              <div
                class="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-3"
              >
                <span>Editando Código Fonte</span>
                <span
                  class="text-orange-500 flex items-center gap-1 text-[9px] border border-orange-500/20 px-2 py-0.5 rounded"
                >
                  <i class="pi pi-exclamation-triangle text-[9px]"></i> Cuidado
                  com indentação YAML
                </span>
              </div>

              <Button
                label="Sair do Modo Raw"
                icon="pi pi-eye"
                size="small"
                class="text-xs py-1 px-3 bg-white/5 hover:bg-white/10 text-white border-white/10"
                @click="toggleRawMode"
              />
            </div>

            <textarea
              v-model="rawContent"
              class="flex-1 p-6 bg-transparent text-[#a3d95b] font-mono text-[13px] leading-[1.6] outline-none resize-none custom-scrollbar"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <div
          v-else
          class="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-120px)] transition-all duration-300 animate-fade-in"
        >
          <aside
            v-show="showMetaSidebar"
            class="lg:col-span-4 overflow-y-auto pr-2 custom-scrollbar"
          >
            <AdminMetaEditor
              :fields="currentModel.fields"
              :frontmatter="form.frontmatter"
              :site-context="siteContext"
              @open-image="imageActions.open"
            />
          </aside>

          <div
            :class="showMetaSidebar ? 'lg:col-span-8' : 'lg:col-span-12'"
            class="transition-all duration-300"
          >
            <AdminMarkdownEditor
              v-model:content="form.content"
              :current-folder="editorCtxFolder"
              :current-file="currentFile"
              :is-raw-mode="showRawMode"
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
      :style="{ width: '85vw' }"
      class="bg-[#141b18]"
    >
      <ImageExplorer @select="imageActions.handleSelect" />
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
