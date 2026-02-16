<script setup>
import { ref, watch, onMounted } from 'vue'; 
import draggable from 'vuedraggable';

const props = defineProps({
  fields: { type: Array, default: () => [] },
  frontmatter: { type: Object, default: () => ({}) },
  siteContext: String,
  currentFolder: String
});

const emit = defineEmits(['open-image']); 

const collapsedFields = ref({});
const localSchemaOptions = ref([]); // Agora será lista de Objetos { label, value }

// Inicializa estado da sanfona
watch(() => props.fields, (newFields) => {
  if (newFields) {
    const initialState = { ...collapsedFields.value };
    newFields.forEach(field => {
      if (initialState[field.key] === undefined) initialState[field.key] = true;
    });
    collapsedFields.value = initialState;
  }
}, { immediate: true });

// --- Lógica de Schemas Locais (INTELIGENTE) ---
const fetchLocalSchemas = async () => {
  if (!props.siteContext) return;

  localSchemaOptions.value = [];
  let found = false;
  
  // Lista de pastas onde tentaremos buscar os schemas, em ordem de prioridade
  let foldersToSearch = [];

  // 1. Tenta extrair a pasta do valor atual do schema (se existir e for um path)
  // Ex: se schema for "/content/blog/_schemas/post.json", buscamos em "/content/blog/_schemas"
  if (props.frontmatter.schema && props.frontmatter.schema.includes('/')) {
    const currentSchemaPath = props.frontmatter.schema;
    const parentFolder = currentSchemaPath.substring(0, currentSchemaPath.lastIndexOf('/'));
    foldersToSearch.push(parentFolder);
  }

  // 2. Adiciona lógica de Bubbling Up (Subir diretórios) como fallback
  // Começa na pasta atual e vai subindo até a raiz procurando por "_schemas"
  let tempPath = props.currentFolder;
  while (tempPath) {
     foldersToSearch.push(`${tempPath}/_schemas`);
     
     if (tempPath === 'content') break;
     if (!tempPath.includes('/')) break;
     tempPath = tempPath.substring(0, tempPath.lastIndexOf('/'));
  }

  // 3. Executa a busca sequencialmente até encontrar
  for (const folder of foldersToSearch) {
      try {
        // Limpa barras duplas
        const cleanFolder = folder.replace(/\/+/g, '/');

        const data = await $fetch("/api/admin/storage", {
          params: { site: props.siteContext, folder: cleanFolder }
        });

        const validFiles = (data.files || []).filter(f => !f.isDirectory && f.name.endsWith('.json'));

        if (validFiles.length > 0) {
            // Mapeia para objeto { label: 'NOME', value: '/full/path/nome.json' }
            localSchemaOptions.value = validFiles.map(f => ({
                label: f.name.replace('.json', '').toUpperCase(),
                value: `${cleanFolder}/${f.name}`.replace(/\/+/g, '/') // Caminho Completo
            }));
            found = true;
            break; // Encontrou? Para de procurar.
        }
      } catch (e) {
          // Continua para a próxima pasta da lista
      }
  }

  // Fallback final
  if (!found) {
    localSchemaOptions.value = [{ label: 'DEFAULT', value: 'default' }];
  }
};

// Observa mudanças na pasta ou no arquivo carregado para atualizar a lista
watch(() => [props.currentFolder, props.frontmatter.schema], fetchLocalSchemas, { immediate: true });


// --- Lógica Interna ---
const toggleField = (key) => collapsedFields.value[key] = !collapsedFields.value[key];

const getFieldSummary = (field) => {
  const val = props.frontmatter[field.key];
  if (!val) return 'Vazio';
  if (Array.isArray(val)) return `${val.length} itens`;
  if (field.type === 'image') return 'Imagem definida';
  if (typeof val === 'string') return val.length > 25 ? val.substring(0, 25) + '...' : val;
  return 'Preenchido';
};

const getImageUrl = (path) => {
  if (!path) return '';
  const cleanPath = path.replace(/^\/images/, ''); 
  return `/assets/${props.currentFolder.replace("content/", "")}/${encodeURIComponent(cleanPath)}`;
};

// --- Manipulação de Dados (REPEATER & LISTS) ---
const addRepeaterItem = (fieldKey, itemSchema) => {
  if (!props.frontmatter[fieldKey]) props.frontmatter[fieldKey] = [];
  const newItem = { _uuid: crypto.randomUUID() };
  itemSchema.forEach(f => newItem[f.key] = '');
  props.frontmatter[fieldKey].push(newItem);
  collapsedFields.value[fieldKey] = false; 
};

const removeRepeaterItem = (fieldKey, index) => {
  if (confirm('Remover este item?')) props.frontmatter[fieldKey].splice(index, 1);
};

const addSimpleListItem = (fieldKey) => {
  if (!props.frontmatter[fieldKey]) props.frontmatter[fieldKey] = [];
  props.frontmatter[fieldKey].push({ text: '', _uuid: crypto.randomUUID() });
  collapsedFields.value[fieldKey] = false;
};

const removeSimpleListItem = (fieldKey, index) => {
  props.frontmatter[fieldKey].splice(index, 1);
};

const removeImageFromList = (list, index) => {
  if (list && list.splice) list.splice(index, 1);
};

const requestImage = (targetObj, key) => emit('open-image', { mode: 'set', obj: targetObj, key });
const requestImageList = (targetArray) => emit('open-image', { mode: 'push', list: targetArray });

</script>

<template>
  <div class="space-y-3 pb-20">
    <div v-if="fields.length === 0" class="bg-yellow-500/10 p-4 rounded-sm border border-yellow-500/20 text-yellow-500 text-xs">
      <i class="pi pi-exclamation-triangle mr-2"></i> Nenhum modelo detectado. Editando modo raw.
    </div>

    <div v-for="field in fields" :key="field.key" class="bg-[#141b18] rounded-[0.5vw] border border-white/5 overflow-hidden transition-all duration-300">
      
      <div @click="toggleField(field.key)" class="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 select-none" :class="{ 'border-b border-white/5': !collapsedFields[field.key] }">
        <div class="flex items-center gap-3">
          <i class="pi pi-chevron-down text-[10px] text-[#6f942e] transition-transform duration-300" :class="{ '-rotate-90': collapsedFields[field.key] }"></i>
          <div>
            <label class="text-[10px] font-black text-[#6f942e] uppercase tracking-[0.2em] cursor-pointer">{{ field.label }}</label>
            <div v-if="collapsedFields[field.key]" class="text-[9px] text-slate-500 font-mono mt-1">Result: <span class="text-slate-300">{{ getFieldSummary(field) }}</span></div>
          </div>
        </div>
        <i v-if="field.description && !collapsedFields[field.key]" class="pi pi-info-circle text-[10px] text-slate-600" v-tooltip.top="field.description"></i>
      </div>

      <div v-show="!collapsedFields[field.key]" class="p-5 pt-4 bg-[#0a0f0d]/30">
        
        <div v-if="field.key === 'schema'">
            <select 
                v-model="frontmatter[field.key]" 
                class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-[#6f942e] outline-none transition-colors appearance-none cursor-pointer"
            >
                <option v-for="opt in localSchemaOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>
            <div class="text-[9px] text-slate-500 mt-1 italic break-all px-1">
                Path: {{ frontmatter[field.key] }}
            </div>
        </div>

        <input v-else-if="field.type === 'text'" v-model="frontmatter[field.key]" :placeholder="field.placeholder" class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-[#6f942e] outline-none transition-colors" />
        
        <textarea v-else-if="field.type === 'textarea'" v-model="frontmatter[field.key]" rows="3" class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-[#6f942e] outline-none transition-colors resize-none"></textarea>
        
        <div v-else-if="field.type === 'image'" class="flex gap-2 items-stretch">
          <div class="relative flex-1">
              <input v-model="frontmatter[field.key]" class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 pl-8 text-sm text-white focus:border-[#6f942e] outline-none" />
              <i class="pi pi-image absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
          </div>
          <Button icon="pi pi-folder-open" severity="secondary" @click="requestImage(frontmatter, field.key)" class="p-button-sm" />
          <div v-if="frontmatter[field.key]" class="w-10 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative">
              <img :src="getImageUrl(frontmatter[field.key])" class="w-full h-full object-cover" />
          </div>
        </div>
        
        <div v-else-if="field.type === 'image_list'" class="bg-black/20 p-4 rounded-sm border border-white/5 mt-2">
            <div v-if="!frontmatter[field.key]">{{ frontmatter[field.key] = [] }}</div>
            <draggable v-if="frontmatter[field.key]?.length > 0" v-model="frontmatter[field.key]" :item-key="element => element" class="grid grid-cols-3 gap-3 mb-3" ghost-class="ghost-image">
              <template #item="{ element, index }">
                <div class="relative group aspect-square bg-black rounded-sm overflow-hidden border border-white/10 cursor-move hover:border-[#6f942e]/50 transition-all">
                    <img :src="getImageUrl(element.replace('/images', ''))" class="w-full h-full object-cover pointer-events-none" />
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button icon="pi pi-trash" rounded text severity="danger" size="small" @click="removeImageFromList(frontmatter[field.key], index)" />
                    </div>
                </div>
              </template>
            </draggable>
            <div v-else class="text-center py-4 text-[10px] text-slate-600 italic">Galeria vazia</div>
            <Button label="Adicionar Imagens" icon="pi pi-plus" size="small" outlined class="w-full text-[10px] border-dashed border-[#6f942e]/30 text-[#6f942e]" @click="requestImageList(frontmatter[field.key])" />
        </div>

        <div v-else-if="field.type === 'simple_list'" class="mt-2">
          <div v-if="!frontmatter[field.key]">{{ frontmatter[field.key] = [] }}</div>
          <draggable v-model="frontmatter[field.key]" item-key="_uuid" handle=".drag-handle" class="space-y-2">
            <template #item="{ element, index }">
              <div class="flex items-center gap-2 group">
                <i class="pi pi-bars drag-handle cursor-grab text-slate-600 hover:text-white"></i>
                <input v-model="element.text" class="w-full bg-[#0a0f0d] border-b border-white/10 px-2 py-1 text-sm text-white focus:border-[#6f942e] outline-none transition-colors" placeholder="Item..." />
                <button @click="removeSimpleListItem(field.key, index)" class="text-slate-700 hover:text-red-500 transition-colors p-1"><i class="pi pi-trash text-xs"></i></button>
              </div>
            </template>
          </draggable>
          <button @click="addSimpleListItem(field.key)" class="w-full py-2 mt-3 border border-dashed border-[#6f942e]/30 rounded-sm text-[10px] font-bold text-[#6f942e] hover:bg-[#6f942e]/10 uppercase tracking-widest transition-all">+ Adicionar Item</button>
        </div>
        
        <div v-else-if="field.type === 'repeater'" class="mt-2">
          <draggable v-model="frontmatter[field.key]" item-key="_uuid" handle=".drag-handle" class="space-y-3">
            <template #item="{ element, index }">
              <div class="bg-black/20 p-4 rounded-sm border border-white/5 relative group">
                <div class="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-bars drag-handle cursor-grab text-slate-600 hover:text-white"></i>
                    <span class="text-[9px] font-bold text-slate-500 uppercase">{{ field.itemLabel || 'Item' }} {{ index + 1 }}</span>
                  </div>
                  <button @click="removeRepeaterItem(field.key, index)" class="text-slate-700 hover:text-red-500 transition-colors"><i class="pi pi-trash text-xs"></i></button>
                </div>
                <div class="space-y-3">
                  <div v-for="subField in field.schema" :key="subField.key">
                    <label class="text-[8px] text-slate-500 uppercase font-bold block mb-1">{{ subField.label }}</label>
                    <input v-if="subField.type === 'text'" v-model="element[subField.key]" class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e]" />
                    <textarea v-else-if="subField.type === 'textarea'" v-model="element[subField.key]" rows="2" class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e] resize-none"></textarea>
                    <div v-else-if="subField.type === 'image'" class="flex gap-2 items-stretch">
                        <div class="relative flex-1"><input v-model="element[subField.key]" class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e]" /></div>
                        <Button icon="pi pi-search" size="small" text rounded severity="secondary" @click="requestImage(element, subField.key)" />
                        <div v-if="element[subField.key]" class="w-8 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative">
                          <img :src="getImageUrl(element[subField.key])" class="w-full h-full object-cover" />
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
          <button @click="addRepeaterItem(field.key, field.schema)" class="w-full py-3 mt-4 border-2 border-dashed border-[#6f942e]/20 rounded-sm text-[10px] font-bold text-[#6f942e] hover:bg-[#6f942e]/10 uppercase tracking-widest transition-all">+ Adicionar {{ field.itemLabel || 'Item' }}</button>
        </div>

      </div>
    </div>
  </div>
</template>