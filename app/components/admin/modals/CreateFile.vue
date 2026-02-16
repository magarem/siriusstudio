<script setup>
import yaml from "js-yaml";
import { useToast } from "primevue/usetoast";
import { ref, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  siteContext: { type: String, required: true },
  currentFolder: { type: String, default: "content" }
});

const emit = defineEmits(['update:visible', 'success']);

const toast = useToast();
const loading = ref(false);
const schemasLoading = ref(false);
const form = ref({ name: "", type: "" }); // Type começa vazio, será preenchido pelo fetch
const availableSchemas = ref([]);

// 1. BUSCA OS SCHEMAS COM PATH COMPLETO
const fetchSchemas = async () => {
  schemasLoading.value = true;
  availableSchemas.value = [];
  
  let searchPath = props.currentFolder;
  let found = false;

  // Loop Bubbling Up (Sobe pastas até achar)
  while (searchPath) {
    try {
      const data = await $fetch("/api/admin/storage", {
        params: { site: props.siteContext, folder: searchPath + "/_schemas" }
      });
      
      const validFiles = (data.files || [])
        .filter(f => !f.isDirectory && f.name.endsWith('.json'));

      if (validFiles.length > 0) {
        // --- MUDANÇA AQUI ---
        // Agora a KEY guarda o caminho completo
        availableSchemas.value = validFiles.map(f => ({
          label: f.name.replace('.json', '').toUpperCase(),
          // Ex: /content/blog/_schemas/post.json
          key: `/${searchPath}/_schemas/${f.name}`.replace(/\/+/g, '/') 
        }));
        
        found = true;
        break; 
      }
      
    } catch (e) {
      // Ignora erro e tenta no pai
    }

    if (searchPath === 'content') break;
    if (!searchPath.includes('/')) break;
    searchPath = searchPath.substring(0, searchPath.lastIndexOf('/'));
  }

  // Fallback se não achar nada: Aponta para o padrão global
  if (!found || availableSchemas.value.length === 0) {
    availableSchemas.value = [{ 
        label: 'DEFAULT', 
        key: '/content/_schemas/default.json' // Caminho absoluto padrão
    }];
  }

  // Seleciona automaticamente o primeiro da lista
  if (availableSchemas.value.length > 0) {
      form.value.type = availableSchemas.value[0].key;
  }

  schemasLoading.value = false;
};

watch(() => props.visible, (val) => {
    if(val) {
      form.value.name = "";
      fetchSchemas();
    }
});

const handleCreate = async () => {
  if (loading.value || !form.value.name) return;
  
  loading.value = true;
  try {
    let folderName = form.value.name.trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/\.md$/, "") 
        .replace(/\s+/g, "-");

    const targetFolderPath = `${props.currentFolder}/${folderName}`;

    // Cria Pasta
    await $fetch("/api/admin/mkdir", {
      method: "POST",
      body: {
        site: props.siteContext,
        folder: props.currentFolder,
        name: folderName,
      },
    });

    // Prepara Frontmatter
    // AQUI: form.value.type agora já contém o caminho completo (ex: /content/_schemas/blog.json)
    const frontmatter = { 
        schema: form.value.type, 
        title: form.value.name, 
        date: new Date().toISOString().split("T")[0] 
    };

    const content = `---\n${yaml.dump(frontmatter)}---\n\n# ${form.value.name}`;

    // Cria Arquivo
    await $fetch("/api/admin/storage", {
      method: "POST",
      body: {
        site: props.siteContext,
        folder: targetFolderPath,
        file: "_index.md",
        content,
      },
    });

    toast.add({ severity: "success", summary: "Página Criada", life: 2000 });
    emit('update:visible', false);
    
    const finalFilePath = `${targetFolderPath}/_index.md`;
    emit('success', finalFilePath);

  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Erro", detail: "Falha ao criar." });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    header="NOVA PÁGINA"
    :style="{ width: '400px' }"
    class="bg-[#141b18]"
    :appendTo="'body'"
  >
    <div class="flex flex-col gap-6 pt-4">
      <div class="flex flex-col gap-2">
        <label class="text-[10px] uppercase font-black text-[#6f942e]">Título</label>
       <InputText
          v-model="form.name"
          class="bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e] transition-colors"
          placeholder="ex: Minha Página"
          autofocus
          @keydown.enter.prevent="handleCreate" 
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[10px] uppercase font-black text-[#6f942e]">Modelo (Schema)</label>
        
        <div v-if="schemasLoading" class="flex items-center gap-2 text-zinc-500 text-xs p-2">
           <i class="pi pi-spin pi-spinner text-[#6f942e]"></i>
        </div>

        <div v-else class="max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded p-1 bg-black/20">
         
          <div
            v-for="s in availableSchemas"
            :key="s.key"
            @click="form.type = s.key"
            :class="[
              'p-3 mb-1 rounded border cursor-pointer text-[11px] font-bold tracking-wider transition-all flex items-center justify-between',
              form.type === s.key
                ? 'border-[#6f942e] bg-[#6f942e]/10 text-white'
                : 'border-transparent hover:bg-white/5 text-zinc-500',
            ]"
          >
            <span>{{ s.label }}</span>
            
            <i v-if="form.type === s.key" class="pi pi-check-circle text-[#6f942e]"></i>
          </div>
          
          <div class="px-2 py-1 text-[9px] text-zinc-600 break-all">
             Path: {{ form.type }}
          </div>

        </div>
      </div>

      <Button
        label="CRIAR"
        class="bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12"
        :loading="loading"
        @click="handleCreate"
      />
    </div>
  </Dialog>
</template>