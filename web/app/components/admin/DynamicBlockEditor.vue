<script setup>
import { ref, watch } from "vue";
import draggable from "vuedraggable";
import { componentCatalog } from "~/utils/componentCatalog";

const props = defineProps({
  modelValue: {
    type: [String, Array],
    required: true,
    default: "[]",
  },
  // Added these props to support the image preview logic if you are still using local assets
  currentFolder: { type: String, default: "" },
});

// Added 'open-image' to the emits array
const emit = defineEmits(["update:modelValue", "open-image"]);

const blocks = ref([]);
const expandedBlocks = ref([]);

// ➕ ADD NEW BLOCK
const addBlock = (catalogItem) => {
  // 1. Clone the template from the passed catalog item
  const newBlock = JSON.parse(JSON.stringify(catalogItem.template));

  // 2. Generate a secure unique ID
  newBlock._id = crypto.randomUUID();

  // 3. ✨ Inject the friendly name from the catalog!
  newBlock._name = catalogItem.name;

  // 4. Push to the page blocks
  blocks.value.push(newBlock);

  // 5. Auto-expand the newly added block
  if (!expandedBlocks.value.includes(newBlock._id)) {
    expandedBlocks.value.push(newBlock._id);
  }
};

// 🗑️ REMOVE BLOCK
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
  }
};

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

    // ✨ THE FIX: Safely extract the array for VueDraggable!
    if (Array.isArray(parsedData)) {
      blocks.value = parsedData; // Old format (flat array)
    } else if (parsedData && Array.isArray(parsedData.blocks)) {
      blocks.value = parsedData.blocks; // New format (object with .blocks)
    } else {
      blocks.value = []; // Safe fallback
    }

    if (blocks.value.length > 0 && expandedBlocks.value.length === 0) {
      expandedBlocks.value.push(blocks.value[0]._id || 0);
    }
  } catch (error) {
    console.warn("Aguardando JSON válido...");
    blocks.value = []; // Prevent vuedraggable crash
  }
};

syncData();

watch(
  () => props.modelValue,
  (newVal) => {
    // We only trigger a sync if the incoming data actually changed from outside
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

// ✨ THE FIX: Reconstruct the full object when saving!
watch(
  blocks,
  (newBlocks) => {
    let original = {};

    // 1. Get the current original file data
    try {
      original =
        typeof props.modelValue === "string"
          ? JSON.parse(props.modelValue)
          : JSON.parse(JSON.stringify(props.modelValue || {}));
    } catch (e) {
      original = {};
    }

    let payloadToEmit;

    // 2. Put the new dragged blocks back into the correct place
    if (Array.isArray(original)) {
      // If it was just an array, emit the array
      payloadToEmit = newBlocks;
    } else {
      // If it was an object, KEEP the title/topbarStyle, and just update .blocks
      original.blocks = newBlocks;
      payloadToEmit = original;
    }

    // 3. Send it back to the parent to save
    if (typeof props.modelValue === "string") {
      emit("update:modelValue", JSON.stringify(payloadToEmit, null, 2));
    } else {
      emit("update:modelValue", payloadToEmit);
    }
  },
  { deep: true },
);

const getFieldType = (key, value) => {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";

  // ✨ NEW: Detect Array of Strings (specifically for images)
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === "string") {
      return "image-array";
    }
    return "array"; // Fallback to normal object array
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
    normalizedKey.includes("text")
  ) {
    return "textarea";
  }

  return "string";
};

// Helpers
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

// --- 🖼️ IMAGE HANDLING LOGIC ---
const getImageUrl = (path) => {
  if (!path) return "";
  // Se for uma URL externa (http), retorna direto
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  // Se for local, aplica a mesma lógica do seu MetaEditor antigo
  const cleanPath = path.replace(/^\/images/, "");
  console.log("🚀 ~ 1111getImageUrl ~ cleanPath:", cleanPath);
  const fullPath =
    `/assets/${props.currentFolder.replace("content/", "")}/${encodeURIComponent(cleanPath)}`.replace(
      "content/",
      "",
    );
  console.log("🚀 ~ getImageUrl ~ fullPath:", fullPath);
  return fullPath;
};

// Dispara o evento para o pai abrir o modal do Image Explorer
const requestImage = (targetObj, key) => {
  emit("open-image", { mode: "set", obj: targetObj, key });
};
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6 items-start">
    <div
      class="w-full lg:w-1/3 xl:w-1/4 sticky top-0 bg-[#0a0f0d]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl z-10"
    >
      <h3
        class="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2"
      >
        <i class="pi pi-plus-circle text-[#6f942e]"></i>
        Adicionar Seção
      </h3>
      <div class="space-y-3">
        <div
          v-for="item in componentCatalog"
          :key="item.name"
          @click="addBlock(item)"
          class="bg-[#141b18] hover:bg-[#1a231f] border border-white/5 hover:border-[#6f942e]/50 p-3 rounded-lg cursor-pointer transition-all group flex items-start gap-3 shadow-sm"
        >
          <div
            class="w-8 h-8 shrink-0 rounded bg-black/40 text-slate-400 group-hover:text-[#6f942e] flex items-center justify-center transition-colors border border-white/5"
          >
            <i :class="item.icon"></i>
          </div>
          <div>
            <h4 class="text-white text-xs font-bold mb-0.5">{{ item.name }}</h4>
            <p class="text-[10px] text-slate-500 leading-tight">
              {{ item.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-2/3 xl:w-3/4">
      <draggable
        v-model="blocks"
        item-key="_id"
        handle=".drag-handle"
        animation="200"
        ghost-class="opacity-40"
        class="space-y-4"
      >
        <template #item="{ element: block, index }">
          <div
            class="bg-[#141b18] border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all hover:border-[#6f942e]/30"
          >
            <div
              @click="toggleBlock(block._id || index)"
              class="bg-black/40 px-5 py-3 flex items-center justify-between border-b border-white/5 cursor-pointer select-none group"
            >
              <div class="flex items-center gap-3">
                <div
                  class="drag-handle text-slate-600 hover:text-white cursor-grab active:cursor-grabbing px-1 transition-colors"
                  @click.stop
                  title="Arraste para reordenar"
                >
                  <i class="pi pi-bars text-sm"></i>
                </div>
                <div
                  class="text-slate-500 group-hover:text-white transition-colors ml-1"
                >
                  <i
                    class="pi pi-chevron-right text-xs transition-transform duration-300"
                    :class="{
                      'rotate-90 text-[#6f942e]': expandedBlocks.includes(
                        block._id || index,
                      ),
                    }"
                  ></i>
                </div>
                <div
                  class="shrink-0 w-8 h-8 rounded bg-[#6f942e]/20 text-[#6f942e] flex items-center justify-center text-sm"
                >
                  <i class="pi pi-box"></i>
                </div>
                <div class="text-left">
                  <h3
                    class="text-white font-bold text-sm tracking-widest uppercase"
                  >
                    {{ block._name || block._type }}
                  </h3>
                  <span class="text-xs text-slate-500" v-if="block.title">{{
                    block.title
                  }}</span>
                </div>
              </div>

              <div class="flex items-center gap-4" @click.stop>
                <div class="flex items-center gap-2" v-if="'_visible' in block">
                  <label class="text-xs text-slate-400">Ativo</label>
                  <InputSwitch v-model="block._visible" />
                </div>
                <button
                  @click.stop="removeBlock(index)"
                  class="text-slate-600 hover:text-red-500 transition-colors px-1"
                  title="Remover Seção"
                >
                  <i class="pi pi-trash text-sm"></i>
                </button>
              </div>
            </div>

            <div
              v-show="expandedBlocks.includes(block._id || index)"
              class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <template v-for="(value, key) in block" :key="key">
                <div
                  v-if="isEditableField(key) && key !== '_visible'"
                  :class="{
                    'col-span-1 md:col-span-2':
                      typeof value === 'object' || key === 'subtitle',
                  }"
                  class="flex flex-col gap-1"
                >
                  <label
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                    >{{ formatLabel(key) }}</label
                  >

                  <div
                    v-if="getFieldType(key, value) === 'boolean'"
                    class="mt-2"
                  >
                    <InputSwitch v-model="block[key]" />
                  </div>

                  <div
                    v-else-if="getFieldType(key, value) === 'image'"
                    class="flex gap-2 items-stretch mt-1"
                  >
                    <div class="relative flex-1">
                      <InputText
                        v-model="block[key]"
                        placeholder="https://..."
                        class="w-full bg-[#0a0f0d] text-white border-white/10 text-sm p-2 pl-8 focus:border-[#6f942e] transition-colors"
                      />
                      <i
                        class="pi pi-link absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"
                      ></i>
                    </div>
                    <Button
                      icon="pi pi-folder-open"
                      severity="secondary"
                      @click="requestImage(block, key)"
                    />
                    <div
                      v-if="block[key]"
                      class="w-10 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative"
                    >
                      <img
                        :src="getImageUrl(block[key])"
                        class="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div
                    v-else-if="getFieldType(key, value) === 'image-array'"
                    class="bg-black/20 p-4 rounded border border-white/5 mt-1 flex flex-col gap-3"
                  >
                    <draggable
                      v-model="block[key]"
                      item-key="index"
                      handle=".img-drag-handle"
                      animation="200"
                      ghost-class="opacity-40"
                      class="flex flex-col gap-3"
                    >
                      <template #item="{ element: imgString, index: imgIndex }">
                        <div
                          class="flex gap-2 items-center bg-[#141b18] p-2 rounded border border-white/5 group"
                        >
                          <div
                            class="img-drag-handle text-slate-600 hover:text-white cursor-grab active:cursor-grabbing px-1 transition-colors"
                            title="Arraste para reordenar"
                          >
                            <i class="pi pi-bars text-sm"></i>
                          </div>

                          <div class="relative flex-1">
                            <InputText
                              v-model="block[key][imgIndex]"
                              placeholder="URL da imagem..."
                              class="w-full bg-[#0a0f0d] text-white border-white/10 text-xs p-2 pl-8 transition-colors focus:border-[#6f942e]"
                            />
                            <i
                              class="pi pi-image absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"
                            ></i>
                          </div>

                          <Button
                            icon="pi pi-folder-open"
                            size="small"
                            severity="secondary"
                            @click="requestImage(block[key], imgIndex)"
                          />

                          <button
                            @click="block[key].splice(imgIndex, 1)"
                            class="text-slate-500 hover:text-red-500 p-2 transition-colors"
                          >
                            <i class="pi pi-trash text-sm"></i>
                          </button>

                          <div
                            v-if="block[key][imgIndex]"
                            class="w-10 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative"
                          >
                            <img
                              v-if="!block[key][imgIndex].includes('.mp4')"
                              :src="getImageUrl(block[key][imgIndex])"
                              class="w-full h-full object-cover"
                            />
                            <i
                              v-else
                              class="pi pi-video text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            ></i>
                          </div>
                        </div>
                      </template>
                    </draggable>

                    <button
                      @click="block[key].push('')"
                      class="mt-2 text-xs text-[#6f942e] border border-[#6f942e]/30 hover:bg-[#6f942e]/10 py-2 rounded transition-colors w-full flex items-center justify-center gap-2"
                    >
                      <i class="pi pi-plus"></i> Adicionar Imagem
                    </button>
                  </div>

                  <Textarea
                    v-else-if="getFieldType(key, value) === 'textarea'"
                    v-model="block[key]"
                    rows="2"
                    class="bg-[#0a0f0d] text-white focus:border-[#6f942e] border-white/10 w-full text-sm p-2 transition-colors mt-1"
                  />

                  <div
                    v-else-if="getFieldType(key, value) === 'array'"
                    class="bg-black/20 p-4 rounded border border-white/5 mt-1 flex flex-col gap-4"
                  >
                    <div
                      v-for="(arrayItem, itemIndex) in block[key]"
                      :key="itemIndex"
                      class="border border-white/10 rounded-lg p-3 bg-[#0a0f0d] relative group"
                    >
                      <div
                        class="flex justify-between items-center mb-3 border-b border-white/5 pb-2"
                      >
                        <span class="text-xs font-bold text-[#6f942e]"
                          >Item {{ itemIndex + 1 }}</span
                        >
                        <button
                          @click="block[key].splice(itemIndex, 1)"
                          class="text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <i class="pi pi-trash text-xs"></i>
                        </button>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          v-for="(itemValue, itemProp) in arrayItem"
                          :key="itemProp"
                          :class="{
                            'col-span-1 md:col-span-2':
                              getFieldType(itemProp, itemValue) ===
                                'textarea' ||
                              getFieldType(itemProp, itemValue) === 'image',
                          }"
                          class="flex flex-col gap-1"
                        >
                          <label class="text-[10px] text-slate-500 uppercase">{{
                            formatLabel(itemProp)
                          }}</label>

                          <div
                            v-if="getFieldType(itemProp, itemValue) === 'image'"
                            class="flex gap-2 items-stretch"
                          >
                            <InputText
                              v-model="block[key][itemIndex][itemProp]"
                              class="bg-[#141b18] text-white border-white/10 w-full text-xs p-2 flex-1"
                            />
                            <Button
                              icon="pi pi-folder-open"
                              size="small"
                              severity="secondary"
                              @click="
                                requestImage(block[key][itemIndex], itemProp)
                              "
                            />
                            <div
                              v-if="block[key][itemIndex][itemProp]"
                              class="w-8 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative"
                            >
                              <img
                                :src="
                                  getImageUrl(block[key][itemIndex][itemProp])
                                "
                                class="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <Textarea
                            v-else-if="
                              getFieldType(itemProp, itemValue) === 'textarea'
                            "
                            v-model="block[key][itemIndex][itemProp]"
                            rows="2"
                            class="bg-[#141b18] text-white border-white/10 w-full text-xs p-2"
                          />

                          <InputText
                            v-else
                            v-model="block[key][itemIndex][itemProp]"
                            class="bg-[#141b18] text-white border-white/10 w-full text-xs p-2"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      @click="
                        block[key].push(
                          block[key].length ? { ...block[key][0] } : {},
                        )
                      "
                      class="text-xs text-[#6f942e] border border-[#6f942e]/30 hover:bg-[#6f942e]/10 py-2 rounded transition-colors w-full flex items-center justify-center gap-2"
                    >
                      <i class="pi pi-plus"></i> Adicionar Novo Item
                    </button>
                  </div>

                  <div
                    v-else-if="getFieldType(key, value) === 'object'"
                    class="bg-black/20 p-4 rounded border border-white/5 grid grid-cols-2 gap-3 mt-1"
                  >
                    <div
                      v-for="(subValue, subKey) in value"
                      :key="subKey"
                      class="flex flex-col gap-1"
                    >
                      <label class="text-[10px] text-slate-500 uppercase">{{
                        formatLabel(subKey)
                      }}</label>
                      <InputNumber
                        v-if="typeof subValue === 'number'"
                        v-model="block[key][subKey]"
                        class="w-full text-sm"
                      />
                      <InputSwitch
                        v-else-if="typeof subValue === 'boolean'"
                        v-model="block[key][subKey]"
                      />
                      <InputText
                        v-else
                        v-model="block[key][subKey]"
                        class="bg-[#0a0f0d] text-white border-white/10 w-full text-sm p-2"
                      />
                    </div>
                  </div>

                  <InputNumber
                    v-else-if="getFieldType(key, value) === 'number'"
                    v-model="block[key]"
                    class="w-full text-sm mt-1"
                  />

                  <InputText
                    v-else
                    v-model="block[key]"
                    class="bg-[#0a0f0d] text-white focus:border-[#6f942e] border-white/10 w-full text-sm p-3 transition-colors mt-1"
                  />
                </div>
              </template>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
