<template>
  <div class="w-full max-w-5xl mx-auto bg-[#0a0f0d] rounded-xl border border-white/10 p-6 shadow-2xl mt-4">
    
    <div class="mb-8 border-b border-white/10 pb-4 flex justify-between items-end">
      <div>
        <h2 class="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
          <i class="pi pi-server text-[#6f942e]"></i>
          {{ schema.name || 'Editor Global' }}
        </h2>
        <p class="text-slate-400 text-sm mt-1">{{ schema.description || 'Preencha os campos abaixo para atualizar as configurações.' }}</p>
      </div>
    </div>

    <div class="space-y-8">
      <template v-for="(field, index) in schema.fields" :key="index">
        
        <div v-if="['string', 'textarea', 'image', 'select', 'boolean'].includes(field.type)" class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#6f942e] uppercase tracking-wider">{{ field.label || field.name }}</label>
          
          <InputText v-if="field.type === 'string'" v-model="localData[field.name]" class="bg-[#141b18] text-white border-white/10 text-sm p-3 focus:border-[#6f942e] transition-colors w-full" />
          
          <Textarea v-else-if="field.type === 'textarea'" v-model="localData[field.name]" rows="3" class="bg-[#141b18] text-white border-white/10 text-sm p-3 focus:border-[#6f942e] transition-colors w-full" />
          
          <div v-else-if="field.type === 'boolean'" class="mt-1">
            <InputSwitch v-model="localData[field.name]" />
          </div>

          <select v-else-if="field.type === 'select'" v-model="localData[field.name]" class="bg-[#141b18] text-white border border-white/10 text-sm p-3 rounded-md focus:border-[#6f942e] focus:outline-none transition-colors w-full cursor-pointer">
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>

          <div v-else-if="field.type === 'image'" class="flex gap-2 items-stretch mt-1">
            <div class="relative flex-1">
              <InputText v-model="localData[field.name]" placeholder="URL ou caminho da imagem..." class="w-full bg-[#141b18] text-white border-white/10 text-sm p-3 pl-10 focus:border-[#6f942e] transition-colors" />
              <i class="pi pi-image absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
            </div>
            
            <Button icon="pi pi-folder-open" severity="secondary" v-tooltip="'Escolher Imagem'" @click="$emit('open-image', { mode: 'set', obj: localData, key: field.name })" />
            
            <div v-if="localData[field.name]" class="w-12 shrink-0 aspect-square bg-black rounded border border-white/20 overflow-hidden relative">
              <img :src="getImageUrl(localData[field.name])" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div v-else-if="field.type === 'object'" class="bg-[#141b18] p-6 rounded-xl border border-white/5 shadow-inner">
          <h3 class="text-sm font-bold text-white mb-5 border-b border-white/10 pb-3 flex items-center gap-2">
            <i class="pi pi-box text-[#6f942e]"></i> {{ field.label || field.name }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div v-for="subField in field.fields" :key="subField.name" :class="{'md:col-span-2': subField.type === 'textarea' || subField.type === 'array'}">
              
              <span class="hidden">{{ ensureObject(field.name) }}</span>

              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{{ subField.label || subField.name }}</label>
              
              <InputText v-if="subField.type === 'string'" v-model="localData[field.name][subField.name]" class="bg-[#0a0f0d] text-white border-white/10 w-full text-sm p-3 focus:border-[#6f942e] transition-colors" />
              
              <Textarea v-else-if="subField.type === 'textarea'" v-model="localData[field.name][subField.name]" rows="2" class="bg-[#0a0f0d] text-white border-white/10 w-full text-sm p-3 focus:border-[#6f942e] transition-colors" />
              
              <InputSwitch v-else-if="subField.type === 'boolean'" v-model="localData[field.name][subField.name]" />
              
              <div v-else-if="subField.type === 'image'" class="flex gap-2 items-stretch">
                <InputText v-model="localData[field.name][subField.name]" class="bg-[#0a0f0d] text-white border-white/10 text-sm p-3 flex-1 focus:border-[#6f942e] transition-colors" />
                
                <Button icon="pi pi-folder-open" size="small" severity="secondary" @click="$emit('open-image', { mode: 'set', obj: localData[field.name], key: subField.name })" />
                
                <Button 
                  v-if="subField.name === 'imageLight' || subField.name === 'imageDark'" 
                  icon="pi pi-pen-to-square" 
                  severity="info" 
                  size="small"
                  class="!bg-blue-600 !border-none"
                  v-tooltip="'Criar Logo em Texto'"
                  @click="$emit('open-wordmark', { obj: localData[field.name] })" 
                />

                <div v-if="localData[field.name][subField.name]" class="w-10 shrink-0 aspect-square bg-black rounded border border-white/20 overflow-hidden relative">
                  <img :src="getImageUrl(localData[field.name][subField.name])" class="w-full h-full object-cover" />
                </div>
              </div>

              <div v-else-if="subField.type === 'array'" class="bg-black/30 p-4 rounded-lg border border-white/5 mt-1">
                <span class="hidden">{{ ensureArray(localData[field.name], subField.name) }}</span>
                
                <div v-for="(item, itemIndex) in localData[field.name][subField.name]" :key="itemIndex" class="flex gap-3 items-center mb-3 bg-[#0a0f0d] p-2 rounded border border-white/5">
                  <div v-for="arrField in subField.fields" :key="arrField.name" class="flex-1">
                    <InputText v-model="item[arrField.name]" :placeholder="arrField.label" class="bg-[#141b18] text-white border-white/10 w-full text-xs p-2 focus:border-[#6f942e] transition-colors" />
                  </div>
                  <button @click="localData[field.name][subField.name].splice(itemIndex, 1)" class="text-slate-500 hover:text-red-500 p-2 transition-colors" title="Remover item">
                    <i class="pi pi-trash text-sm"></i>
                  </button>
                </div>
                
                <button @click="addArrayItem(localData[field.name][subField.name], subField.fields)" class="text-xs text-[#6f942e] border border-[#6f942e]/30 hover:bg-[#6f942e]/10 py-2 rounded w-full transition-colors flex justify-center gap-2 items-center mt-2 font-medium">
                  <i class="pi pi-plus"></i> Adicionar {{ subField.label || 'Item' }}
                </button>
              </div>

            </div>
          </div>
        </div>

        <div v-else-if="field.type === 'array'" class="bg-[#141b18] p-6 rounded-xl border border-white/5 shadow-inner">
           <h3 class="text-sm font-bold text-white mb-5 border-b border-white/10 pb-3 flex items-center gap-2">
            <i class="pi pi-list text-[#6f942e]"></i> {{ field.label || field.name }}
          </h3>
          
          <span class="hidden">{{ ensureArray(localData, field.name) }}</span>

          <div class="space-y-4">
            <div v-for="(item, itemIndex) in localData[field.name]" :key="itemIndex" class="flex gap-4 items-center bg-[#0a0f0d] p-4 rounded-lg border border-white/5 relative group transition-all hover:border-white/10">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div v-for="arrField in field.fields" :key="arrField.name" :class="{'md:col-span-2': arrField.type === 'array'}">
  
                  <label class="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{{ arrField.label }}</label>
                  
                  <InputText v-if="arrField.type === 'string' || !arrField.type" v-model="item[arrField.name]" class="bg-[#141b18] text-white border-white/10 w-full text-sm p-2 focus:border-[#6f942e] transition-colors" />
                  
                  <div v-else-if="arrField.type === 'array'" class="bg-black/40 p-3 rounded-lg border border-white/5 mt-1">
                    <span class="hidden">{{ ensureArray(item, arrField.name) }}</span>
                    
                    <div v-for="(subItem, subIndex) in item[arrField.name]" :key="subIndex" class="flex gap-2 items-center mb-2">
                      <div v-for="subField in arrField.fields" :key="subField.name" class="flex-1">
                        <InputText v-model="subItem[subField.name]" :placeholder="subField.label" class="bg-[#0a0f0d] text-white border-white/10 w-full text-xs p-2 focus:border-[#6f942e] transition-colors" />
                      </div>
                      <button @click="item[arrField.name].splice(subIndex, 1)" class="text-slate-500 hover:text-red-500 p-2 transition-colors" title="Remover submenu">
                        <i class="pi pi-trash text-sm"></i>
                      </button>
                    </div>
                    
                    <button @click="addArrayItem(item[arrField.name], arrField.fields)" class="text-[10px] text-[#6f942e] border border-[#6f942e]/30 hover:bg-[#6f942e]/10 py-1.5 rounded w-full transition-colors flex justify-center gap-2 items-center mt-2 font-medium">
                      <i class="pi pi-plus"></i> Adicionar {{ arrField.label }}
                    </button>
                  </div>

                </div>
              </div>
              
              <button @click="localData[field.name].splice(itemIndex, 1)" class="text-slate-600 hover:text-red-500 p-3 bg-black/40 rounded-lg transition-colors self-end border border-white/5" title="Remover item">
                <i class="pi pi-trash text-sm"></i>
              </button>
            </div>
          </div>

          <button @click="addArrayItem(localData[field.name], field.fields)" class="text-sm text-[#6f942e] border border-[#6f942e]/30 hover:bg-[#6f942e]/10 py-3 rounded-lg w-full transition-colors flex justify-center gap-2 items-center mt-5 font-medium shadow-sm">
            <i class="pi pi-plus"></i> Adicionar {{ field.label || 'Item' }}
          </button>
        </div>

      </template>
    </div>

  </div>
</template>
<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Object], required: true },
  schema: { type: Object, required: true },
  currentFolder: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'open-image', 'open-wordmark']);

// The internal reactive object
const localData = ref({});
let isInternalUpdate = false; // ✨ Prevents infinite loops!

// Parses the incoming string to populate the form
const syncData = () => {
  isInternalUpdate = true;
  if (!props.modelValue) {
    localData.value = {};
  } else {
    try {
      localData.value = typeof props.modelValue === 'string' 
        ? JSON.parse(props.modelValue) 
        : JSON.parse(JSON.stringify(props.modelValue));
    } catch (e) {
      console.warn("SchemaEditor: Invalid JSON", e);
      localData.value = {};
    }
  }
  
  // Release lock safely
  setTimeout(() => { isInternalUpdate = false; }, 50);
};

// ✨ CALL THIS IMMEDIATELY! (Do not use onMounted)
// This guarantees localData has the JSON data BEFORE the HTML tries to render it.
syncData();

// Watch for EXTERNAL changes (like clicking another file in the sidebar)
watch(() => props.modelValue, (newVal) => {
  if (isInternalUpdate) return; // Ignore if WE caused the change
  syncData();
});

// Watch for INTERNAL edits (you typing in the form) and emit to parent
watch(localData, (newVal) => {
  isInternalUpdate = true; // Lock the watcher
  
  // We grab the original string so we don't accidentally delete "_schema"
  let originalObj = {};
  try {
    originalObj = typeof props.modelValue === 'string' ? JSON.parse(props.modelValue) : (props.modelValue || {});
  } catch (e) {}

  // Merge the edits and emit as a clean JSON String
  const finalObj = { ...originalObj, ...newVal };
  emit('update:modelValue', JSON.stringify(finalObj, null, 2));
  
  setTimeout(() => { isInternalUpdate = false; }, 50);
}, { deep: true });

// --- SAFETY HELPERS ---
const ensureObject = (key) => {
  if (!localData.value[key]) localData.value[key] = {};
  return '';
};

const ensureArray = (parentObj, key) => {
  if (!parentObj[key]) parentObj[key] = [];
  return '';
};

// --- ARRAY HELPERS ---
const addArrayItem = (targetArray, schemaFields) => {
  const newItem = {};
  if (schemaFields && Array.isArray(schemaFields)) {
    schemaFields.forEach(f => {
      newItem[f.name] = f.type === 'boolean' ? false : '';
    });
  }
  targetArray.push(newItem);
};

// --- IMAGE PREVIEW HELPER ---
const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanPath = path.replace(/^\/images/, ''); 
  return `/assets/${props.currentFolder.replace("content/", "")}/${encodeURIComponent(cleanPath)}`.replace("content/", "");
};
</script>