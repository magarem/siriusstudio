<script setup>
import { ref, watch } from "vue";
import draggable from "vuedraggable";
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
// import Dialog from 'primevue/dialog';
import { componentCatalog } from "~/utils/componentCatalog";

const props = defineProps({
  modelValue: {
    type: [String, Array],
    required: true,
    default: "[]",
  },
  currentFolder: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "open-image"]);

// --- STATE GERAL ---
const blocks = ref([]);
const expandedBlocks = ref([]);
const expandedArrayItems = ref([]);
const showCatalogModal = ref(false);

const pageSettings = ref({
  marginTop: "15px",
  marginX: "0px",
});

// --- ✨ STATE E CONFIG DO EDITOR MARKDOWN ✨ ---
const markdownContents = ref({});
const isLoadingMarkdown = ref({});
const autoSaveTimers = ref({});
const saveStatus = ref({}); 

// Define os botões que queres na barra de ferramentas do MdEditor
const editorToolbars = [
  'bold', 'underline', 'italic', 'strikeThrough', '-',
  'title', 'quote', 'unorderedList', 'orderedList', 'task', '-',
  'codeRow', 'code', 'link', 'image', 'table', '-',
  'revoke', 'next', 'save', '=', 
  'preview', 'fullscreen'
];

// --- CARREGAR MARKDOWN ---
const loadMarkdownForBlock = async (block) => {
  if (!block.content || !block.content.file) return;
  const blockId = block._id;
  const fileToLoad = block.content.file;

  if (markdownContents.value[blockId] !== undefined) return;

  isLoadingMarkdown.value[blockId] = true;

  try {
    const data = await $fetch("/api/admin/storage", {
      query: { folder: props.currentFolder, file: fileToLoad },
    });
    markdownContents.value[blockId] = data?.content || "";
  } catch (e) {
    markdownContents.value[blockId] = "";
  } finally {
    isLoadingMarkdown.value[blockId] = false;
  }
};

// --- ✨ LÓGICA DE AUTO-SAVE ✨ ---
const triggerAutoSave = (block) => {
  const blockId = block._id;
  
  saveStatus.value[blockId] = 'escrevendo';

  if (autoSaveTimers.value[blockId]) {
    clearTimeout(autoSaveTimers.value[blockId]);
  }

  autoSaveTimers.value[blockId] = setTimeout(() => {
    performAutoSave(block);
  }, 1500); 
};

const performAutoSave = async (block) => {
  const blockId = block._id;
  saveStatus.value[blockId] = 'gravando';
  
  const fileToSave = block.content.file || crypto.randomUUID() + ".md";
  block.content.file = fileToSave; 

  try {
    await $fetch("/api/admin/storage", {
      method: "POST",
      body: {
        folder: props.currentFolder,
        file: fileToSave,
        content: markdownContents.value[blockId] || "",
      },
    });

    saveStatus.value[blockId] = 'guardado';
    
    setTimeout(() => {
      if (saveStatus.value[blockId] === 'guardado') {
        saveStatus.value[blockId] = '';
      }
    }, 3000);
    
  } catch (error) {
    console.error("Falha no Auto-Save:", error);
    saveStatus.value[blockId] = 'erro';
  }
};

// --- CLONE E MANIPULAÇÃO DE BLOCOS ---
const handleClone = (catalogItem) => {
  const newBlock = JSON.parse(JSON.stringify(catalogItem.template));
  newBlock._id = crypto.randomUUID();
  
  if (newBlock._type === "MarkdownText" && newBlock.content) {
    newBlock.content.file = crypto.randomUUID() + ".md";
  }
  
  newBlock._name = catalogItem.name;

  if (!expandedBlocks.value.includes(newBlock._id)) {
    expandedBlocks.value.push(newBlock._id);
  }

  return newBlock;
};

const addBlock = (catalogItem) => {
  const newBlock = handleClone(catalogItem);
  blocks.value.push(newBlock);
  showCatalogModal.value = false;
  
  if (newBlock._type === "MarkdownText") {
    loadMarkdownForBlock(newBlock);
  }
};

const removeBlock = (index) => {
  if (confirm("Tem certeza que deseja remover esta seção?")) {
    blocks.value.splice(index, 1);
  }
};

const toggleBlock = (identifier) => {
  if (expandedBlocks.value.includes(identifier)) {
    expandedBlocks.value = expandedBlocks.value.filter((i) => i !== identifier);
  } else {
    expandedBlocks.value.push(identifier);
    
    const targetBlock = blocks.value.find(b => b._id === identifier || blocks.value.indexOf(b) === identifier);
    if (targetBlock && targetBlock._type === 'MarkdownText') {
      loadMarkdownForBlock(targetBlock);
    }
  }
};

const toggleArrayItem = (item) => {
  const index = expandedArrayItems.value.indexOf(item);
  if (index > -1) {
    expandedArrayItems.value.splice(index, 1);
  } else {
    expandedArrayItems.value.push(item);
  }
};

const isArrayItemExpanded = (item) => {
  return expandedArrayItems.value.includes(item);
};

const addNewArrayItem = (arrayRef) => {
  let newItem = {};
  if (arrayRef.length > 0) {
    const template = arrayRef[0];
    for (const k in template) {
      if (typeof template[k] === "string") newItem[k] = "";
      else if (typeof template[k] === "number") newItem[k] = 0;
      else if (typeof template[k] === "boolean") newItem[k] = false;
      else newItem[k] = Array.isArray(template[k]) ? [] : {};
    }
  }
  arrayRef.push(newItem);
  expandedArrayItems.value.push(newItem);
};

// --- DATA SYNCING E ABERTURA AUTOMÁTICA ---
const syncData = () => {
  if (!props.modelValue) {
    blocks.value = [];
    return;
  }

  try {
    let parsedData =
      typeof props.modelValue === "string"
        ? JSON.parse(props.modelValue)
        : JSON.parse(JSON.stringify(props.modelValue));

    if (Array.isArray(parsedData)) {
      blocks.value = parsedData;
    } else if (parsedData && Array.isArray(parsedData.blocks)) {
      blocks.value = parsedData.blocks;
      pageSettings.value.marginTop =
        parsedData.marginTop !== undefined ? parsedData.marginTop : "15px";
      pageSettings.value.marginX =
        parsedData.marginX !== undefined ? parsedData.marginX : "0px";
    } else {
      blocks.value = [];
    }

    if (blocks.value.length > 0) {
      blocks.value.forEach((block, index) => {
        const blockId = block._id || index;
        
        // Removemos o '|| index === 0' para não forçar a abertura do 1º bloco
        if (block._type === 'MarkdownText') {
          if (!expandedBlocks.value.includes(blockId)) {
            expandedBlocks.value.push(blockId);
          }
          loadMarkdownForBlock(block);
        }
      });
    }
  } catch (error) {
    console.warn("Aguardando JSON válido...");
    blocks.value = [];
  }
};

syncData();

watch(
  () => props.modelValue,
  (newVal) => {
    const currentValStr = JSON.stringify(blocks.value, null, 2);
    let incomingBlocks = [];

    try {
      const parsed = typeof newVal === "string" ? JSON.parse(newVal) : newVal;
      incomingBlocks = Array.isArray(parsed) ? parsed : parsed.blocks || [];
    } catch (e) {}

    if (currentValStr !== JSON.stringify(incomingBlocks, null, 2)) {
      syncData();
    }
  },
);

watch(
  [blocks, pageSettings],
  ([newBlocks, newSettings]) => {
    let original = {};
    try {
      original =
        typeof props.modelValue === "string"
          ? JSON.parse(props.modelValue)
          : JSON.parse(JSON.stringify(props.modelValue || {}));
    } catch (e) {
      original = {};
    }

    let payloadToEmit;

    if (Array.isArray(original)) {
      payloadToEmit = {
        marginTop: newSettings.marginTop,
        marginX: newSettings.marginX,
        blocks: newBlocks,
      };
    } else {
      original.marginTop = newSettings.marginTop;
      original.marginX = newSettings.marginX;
      original.blocks = newBlocks;
      payloadToEmit = original;
    }

    if (typeof props.modelValue === "string") {
      emit("update:modelValue", JSON.stringify(payloadToEmit, null, 2));
    } else {
      emit("update:modelValue", payloadToEmit);
    }
  },
  { deep: true },
);

// --- FIELD PARSING ---
const getFieldType = (key, value) => {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";

  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === "string") {
      return "image-array";
    }
    return "array";
  }

  if (typeof value === "object" && value !== null) return "object";

  const normalizedKey = key.toLowerCase();

  if (
    normalizedKey.includes("image") ||
    normalizedKey.includes("bg") ||
    normalizedKey.includes("logo") ||
    normalizedKey.includes("banner") ||
    normalizedKey.includes("video")
  ) {
    return "image";
  }
  if (normalizedKey.includes("email")) {
    return "email";
  }
  if (
    normalizedKey.includes("description") ||
    normalizedKey.includes("subtitle") ||
    normalizedKey.includes("text") ||
    normalizedKey.includes("content")
  ) {
    return "textarea";
  }

  return "string";
};

const isEditableField = (key) => {
  const hiddenFields = ["_id", "_type", "_name"];
  return !hiddenFields.includes(key);
};

const formatLabel = (key) => {
  if (key === "_wrapperClass") return "Classes CSS (Avançado)";
  if (key === "_visible") return "Visibilidade da Seção";

  const spaced = key.replace(/([A-Z])/g, " $1");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  const cleanPath = path.replace(/^\/images/, "");
  const fullPath =
    `/assets/${props.currentFolder.replace("content/", "")}/${encodeURIComponent(cleanPath)}`.replace(
      "content/",
      "",
    );
  return fullPath;
};

const requestImage = (targetObj, key) => {
  emit("open-image", { mode: "set", obj: targetObj, key });
};
</script>

<template>
  <div class="flex flex-col gap-6 items-center w-full transition-all duration-300">
    <div class="w-full">
      <draggable
        v-model="blocks"
        item-key="_id"
        group="page-blocks"
        handle=".drag-handle"
        animation="200"
        ghost-class="opacity-40"
        class="space-y-4 min-h-[100px] rounded-2xl p-2 w-full"
      >
        <template #item="{ element: block, index }">
          <div class="bg-[#141b18] border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all hover:border-[#6f942e]/30">
            
            <div
              @click="toggleBlock(block._id || index)"
              class="bg-black/40 px-5 py-3 flex items-center justify-between border-b border-white/5 cursor-pointer select-none group"
            >
              <div class="flex items-center gap-3">
                <div class="drag-handle text-slate-600 hover:text-white cursor-grab active:cursor-grabbing px-1 transition-colors" @click.stop title="Arraste para reordenar">
                  <i class="pi pi-bars text-sm"></i>
                </div>
                <div class="text-slate-500 group-hover:text-white transition-colors ml-1">
                  <i class="pi pi-chevron-right text-xs transition-transform duration-300" :class="{ 'rotate-90 text-[#6f942e]': expandedBlocks.includes(block._id || index) }"></i>
                </div>
                <div class="shrink-0 w-8 h-8 rounded bg-[#6f942e]/20 text-[#6f942e] flex items-center justify-center text-sm">
                  <i class="pi pi-box"></i>
                </div>
                <div class="text-left">
                  <h3 class="text-white font-bold text-sm tracking-widest uppercase">{{ block._name || block._type }}</h3>
                  <span class="text-xs text-slate-500" v-if="block.title">{{ block.title }}</span>
                </div>
              </div>

              <div class="flex items-center gap-4" @click.stop>
                <div class="flex items-center gap-2" v-if="'_visible' in block">
                  <label class="text-xs text-slate-400">Ativo</label>
                  <InputSwitch v-model="block._visible" class="scale-[0.8]" />
                </div>
                <button @click.stop="removeBlock(index)" class="text-slate-600 hover:text-red-500 transition-colors px-1" title="Remover Seção">
                  <i class="pi pi-trash text-sm"></i>
                </button>
              </div>
            </div>

            <div v-show="expandedBlocks.includes(block._id || index)" class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <template v-for="(value, key) in block" :key="key">
                
                <!-- ✨ EDITOR MARKDOWN (COM MÓDULO VENDOR) ✨ -->
                <div
                  v-if="block._type === 'MarkdownText' && key === 'content'"
                  class="col-span-1 md:col-span-2 flex flex-col -mx-5 -mb-5 mt-0"
                >
                  <div class="flex flex-col bg-[#0a0f0d] border-t border-[#6f942e]/30 hover:border-[#6f942e]/60 transition-colors shadow-inner relative animate-fade-in overflow-hidden">
                    
                    <div class="flex justify-between items-center px-5 py-2 bg-[#141b18] border-b border-white/5 relative z-10">
                      <div class="flex items-center gap-2">
                        <i class="pi pi-code text-[#6f942e]"></i>
                        <InputText
                          v-model="value.file"
                          class="bg-transparent border-none text-white font-mono text-sm p-0 w-48 focus:ring-0 shadow-none outline-none"
                          placeholder="nome-do-ficheiro.md"
                          @change="performAutoSave(block)" 
                        />
                      </div>
                      
                      <div class="flex items-center gap-3">
                        <span v-if="saveStatus[block._id] === 'escrevendo'" class="text-[10px] text-slate-500 uppercase tracking-widest italic">A escrever...</span>
                        <span v-else-if="saveStatus[block._id] === 'gravando'" class="text-[10px] text-[#6f942e] uppercase tracking-widest animate-pulse"><i class="pi pi-spin pi-spinner text-[10px] mr-1"></i> A gravar...</span>
                        <span v-else-if="saveStatus[block._id] === 'guardado'" class="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1"><i class="pi pi-check text-[10px] text-[#6f942e]"></i> Guardado</span>
                        <span v-else-if="saveStatus[block._id] === 'erro'" class="text-[10px] text-red-500 uppercase tracking-widest flex items-center gap-1"><i class="pi pi-exclamation-triangle text-[10px]"></i> Erro</span>

                        <span v-if="isLoadingMarkdown[block._id]" class="text-xs font-bold text-[#6f942e] uppercase tracking-widest animate-pulse">
                          A Carregar...
                        </span>
                      </div>
                    </div>

                    <!-- VENDOR MODULE: MdEditor -->
                    <MdEditor
                      v-model="markdownContents[block._id]"
                      theme="dark"
                      language="en-US"
                      :toolbars="editorToolbars"
                      :footers="[]"
                      :preview="false"
                      :disabled="isLoadingMarkdown[block._id]"
                      @onChange="triggerAutoSave(block)"
                      @onSave="performAutoSave(block)"
                      class="custom-md-editor w-full min-h-[500px]"
                    />
                  </div>
                </div>

                <!-- ✨ RESTANTES CAMPOS ✨ -->
                <div
                  v-else-if="isEditableField(key) && key !== '_visible' && !(block._type === 'MarkdownText' && key === 'content')"
                  :class="{ 'col-span-1 md:col-span-2': typeof value === 'object' || key === 'subtitle' }"
                  class="flex flex-col gap-1"
                >
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ formatLabel(key) }}</label>

                  <div v-if="getFieldType(key, value) === 'boolean'" class="mt-2">
                    <InputSwitch v-model="block[key]" class="scale-[0.8] origin-left" />
                  </div>

                  <div v-else-if="getFieldType(key, value) === 'image'" class="flex gap-2 items-stretch mt-1">
                    <div class="relative flex-1">
                      <InputText v-model="block[key]" placeholder="https://..." class="w-full bg-[#0a0f0d] text-white border-white/10 text-sm p-2 pl-8 focus:border-[#6f942e] transition-colors" />
                      <i class="pi pi-link absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                    </div>
                    <Button icon="pi pi-folder-open" severity="secondary" @click="requestImage(block, key)" />
                    <div v-if="block[key]" class="w-10 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative">
                      <img :src="getImageUrl(block[key])" class="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div v-else-if="getFieldType(key, value) === 'image-array'" class="bg-black/20 p-4 rounded border border-white/5 mt-1 flex flex-col gap-3">
                    <draggable v-model="block[key]" item-key="index" handle=".img-drag-handle" animation="200" ghost-class="opacity-40" class="flex flex-col gap-3">
                      <template #item="{ element: imgString, index: imgIndex }">
                        <div class="flex gap-2 items-center bg-[#141b18] p-2 rounded border border-white/5 group">
                          <div class="img-drag-handle text-slate-600 hover:text-white cursor-grab active:cursor-grabbing px-1 transition-colors" title="Arraste para reordenar"><i class="pi pi-bars text-sm"></i></div>
                          <div class="relative flex-1">
                            <InputText v-model="block[key][imgIndex]" placeholder="URL da imagem..." class="w-full bg-[#0a0f0d] text-white border-white/10 text-xs p-2 pl-8 transition-colors focus:border-[#6f942e]" />
                            <i class="pi pi-image absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                          </div>
                          <Button icon="pi pi-folder-open" size="small" severity="secondary" @click="requestImage(block[key], imgIndex)" />
                          <button @click="block[key].splice(imgIndex, 1)" class="text-slate-500 hover:text-red-500 p-2 transition-colors"><i class="pi pi-trash text-sm"></i></button>
                          <div v-if="block[key][imgIndex]" class="w-10 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative">
                            <img v-if="!block[key][imgIndex].includes('.mp4')" :src="getImageUrl(block[key][imgIndex])" class="w-full h-full object-cover" />
                            <i v-else class="pi pi-video text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                          </div>
                        </div>
                      </template>
                    </draggable>
                    <button @click="block[key].push('')" class="mt-2 text-xs text-[#6f942e] border border-[#6f942e]/30 hover:bg-[#6f942e]/10 py-2 rounded transition-colors w-full flex items-center justify-center gap-2">
                      <i class="pi pi-plus"></i> Adicionar Imagem
                    </button>
                  </div>

                  <Textarea v-else-if="getFieldType(key, value) === 'textarea'" v-model="block[key]" rows="2" class="bg-[#0a0f0d] text-white focus:border-[#6f942e] border-white/10 w-full text-sm p-2 transition-colors mt-1" />

                  <div v-else-if="getFieldType(key, value) === 'array'" class="bg-black/20 p-2 rounded border border-white/5 mt-1 flex flex-col gap-2">
                    <draggable v-model="block[key]" :item-key="(item, index) => index" handle=".array-drag-handle" animation="200" ghost-class="opacity-40" class="flex flex-col gap-2">
                      <template #item="{ element: arrayItem, index: itemIndex }">
                        <div class="border border-white/10 rounded-lg bg-[#0a0f0d] relative group overflow-hidden">
                          <div @click="toggleArrayItem(arrayItem)" class="flex justify-between items-center p-3 bg-[#141b18] border-b border-white/5 cursor-pointer select-none hover:bg-white/5 transition-colors">
                            <div class="flex items-center gap-3">
                              <div class="array-drag-handle text-slate-600 hover:text-white cursor-grab active:cursor-grabbing px-1 transition-colors" @click.stop title="Arraste para reordenar"><i class="pi pi-bars text-sm"></i></div>
                              <div class="text-slate-500 transition-colors"><i class="pi pi-chevron-right text-xs transition-transform duration-300" :class="{ 'rotate-90 text-[#6f942e]': isArrayItemExpanded(arrayItem) }"></i></div>
                              <span class="text-xs font-bold text-[#6f942e] uppercase tracking-wider">Item {{ itemIndex + 1 }}</span>
                              <span class="text-xs text-slate-400 ml-1" v-if="arrayItem.title || arrayItem.name">- {{ arrayItem.title || arrayItem.name }}</span>
                            </div>
                            <button @click.stop="block[key].splice(itemIndex, 1)" class="text-slate-600 hover:text-red-500 transition-colors px-1" title="Remover Item"><i class="pi pi-trash text-sm"></i></button>
                          </div>
                          <div v-show="isArrayItemExpanded(arrayItem)" class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div v-for="(itemValue, itemProp) in arrayItem" :key="itemProp" :class="{ 'col-span-1 md:col-span-2': getFieldType(itemProp, itemValue) === 'textarea' || getFieldType(itemProp, itemValue) === 'image' }" class="flex flex-col gap-1">
                                <label class="text-[10px] text-slate-500 uppercase">{{ formatLabel(itemProp) }}</label>
                                <div v-if="getFieldType(itemProp, itemValue) === 'image'" class="flex gap-2 items-stretch">
                                  <InputText v-model="block[key][itemIndex][itemProp]" class="bg-[#141b18] text-white border-white/10 w-full text-xs p-2 flex-1 focus:border-[#6f942e]" />
                                  <Button icon="pi pi-folder-open" size="small" severity="secondary" @click="requestImage(block[key][itemIndex], itemProp)" />
                                  <div v-if="block[key][itemIndex][itemProp]" class="w-8 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative"><img :src="getImageUrl(block[key][itemIndex][itemProp])" class="w-full h-full object-cover" /></div>
                                </div>
                                <Textarea v-else-if="getFieldType(itemProp, itemValue) === 'textarea'" v-model="block[key][itemIndex][itemProp]" rows="2" class="bg-[#141b18] text-white focus:border-[#6f942e] border-white/10 w-full text-xs p-2" />
                                <InputText v-else v-model="block[key][itemIndex][itemProp]" class="bg-[#141b18] text-white focus:border-[#6f942e] border-white/10 w-full text-xs p-2" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </draggable>
                    <button @click="addNewArrayItem(block[key])" class="text-xs text-[#6f942e] border border-[#6f942e]/30 hover:bg-[#6f942e]/10 py-2 mt-2 rounded transition-colors w-full flex items-center justify-center gap-2"><i class="pi pi-plus"></i> Adicionar Novo Item</button>
                  </div>

                  <div v-else-if="getFieldType(key, value) === 'object'" class="bg-black/20 p-4 rounded border border-white/5 grid grid-cols-2 gap-3 mt-1">
                    <div v-for="(subValue, subKey) in value" :key="subKey" class="flex flex-col gap-1">
                      <label class="text-[10px] text-slate-500 uppercase">{{ formatLabel(subKey) }}</label>
                      <InputNumber v-if="typeof subValue === 'number'" v-model="block[key][subKey]" class="w-full text-sm" />
                      <InputSwitch v-else-if="typeof subValue === 'boolean'" v-model="block[key][subKey]" class="scale-[0.8] origin-left" />
                      <InputText v-else v-model="block[key][subKey]" class="bg-[#0a0f0d] text-white border-white/10 w-full text-sm p-2 focus:border-[#6f942e]" />
                    </div>
                  </div>

                  <InputNumber v-else-if="getFieldType(key, value) === 'number'" v-model="block[key]" class="w-full text-sm mt-1" />

                  <InputText v-else v-model="block[key]" class="bg-[#0a0f0d] text-white focus:border-[#6f942e] border-white/10 w-full text-sm p-3 transition-colors mt-1" />
                </div>
              </template>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- BOTÃO DO CATÁLOGO -->
    <div class="w-full flex justify-center py-6 mt-2">
      <button @click="showCatalogModal = true" class="bg-transparent border-2 border-dashed border-[#6f942e]/50 hover:border-[#6f942e] hover:bg-[#6f942e]/10 text-[#6f942e] font-bold text-sm tracking-wider uppercase px-10 py-4 rounded-xl transition-all flex items-center gap-3 shadow-lg">
        <i class="pi pi-plus-circle text-lg"></i>
        Adicionar Seção
      </button>
    </div>

    <!-- MODAL DO CATÁLOGO -->
    <Dialog v-model:visible="showCatalogModal" modal header="Catálogo de Seções" :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" class="bg-[#0a0f0d] border border-white/10" :pt="{ root: { class: 'bg-[#0a0f0d] text-white' }, header: { class: 'bg-[#141b18] border-b border-white/10 text-white p-5' }, content: { class: 'bg-[#0a0f0d] p-6' }, title: { class: 'text-lg font-black uppercase tracking-widest' }, closeButton: { class: 'text-slate-400 hover:text-white hover:bg-white/10 transition-colors' } }">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="item in componentCatalog" :key="item.name" @click="addBlock(item)" class="bg-[#141b18] border border-white/5 hover:border-[#6f942e] hover:bg-[#1a231f] p-5 rounded-xl cursor-pointer transition-all duration-200 group flex items-start gap-4 shadow-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-[#6f942e]/0 to-[#6f942e]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-12 h-12 shrink-0 rounded-lg bg-black/40 text-slate-400 group-hover:text-[#6f942e] flex items-center justify-center transition-colors border border-white/5 relative z-10 text-xl">
            <i :class="item.icon"></i>
          </div>
          <div class="relative z-10 pt-1">
            <h4 class="text-white text-sm font-bold mb-1 uppercase tracking-wide">{{ item.name }}</h4>
            <p class="text-xs text-slate-500 leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Integração Limpa do Módulo md-editor-v3 no nosso Tema Dark */
:deep(.custom-md-editor.md-editor-dark) {
  --md-bk-color: transparent !important;
  --md-border-color: rgba(255, 255, 255, 0.05) !important;
  --md-color: #e2e8f0 !important; /* text-slate-200 */
}

/* Estilo da barra de ferramentas superior */
:deep(.custom-md-editor .md-editor-toolbar-wrapper) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding: 8px 16px;
}

/* Ocultar totalmente o rodapé (Contador de Caracteres, etc) */
:deep(.custom-md-editor .md-editor-footer) {
  display: none !important;
}

/* ✨ REDUÇÃO DE PADDING INTERNO DA ÁREA DE TEXTO ✨ */
/* Retirar paddings do pai (wrapper) */
:deep(.custom-md-editor .md-editor-input-wrapper) {
  padding: 0 !important;
}

/* Forçar o padding minúsculo no scroller do CodeMirror */
:deep(.custom-md-editor .cm-scroller) {
  padding: 2px 6px !important;
}

/* Remover espaço morto extra dentro do próprio texto */
:deep(.custom-md-editor .cm-content) {
  padding: 0 !important; 
}
</style>