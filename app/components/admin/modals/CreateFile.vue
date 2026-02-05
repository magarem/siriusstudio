<script setup>
import yaml from "js-yaml";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  visible: { type: Boolean, default: false },
  siteContext: { type: String, required: true },
  currentFolder: { type: String, default: "content" }
});

const emit = defineEmits(['update:visible', 'success']);

const toast = useToast();
const loading = ref(false);
const schemasLoading = ref(false);
const form = ref({ name: "", type: "default" });
const availableSchemas = ref([]);

// 1. BUSCA OS SCHEMAS DISPONÍVEIS
const fetchSchemas = async () => {
  schemasLoading.value = true;
  try {
    const data = await $fetch("/api/admin/storage", {
      params: { site: props.siteContext, folder: "content/_schemas" }
    });
    
    availableSchemas.value = data
      .filter(f => !f.isDirectory && f.name.endsWith('.json'))
      .map(f => ({
        label: f.name.replace('.json', '').toUpperCase(),
        key: f.name.replace('.json', '')
      }));

    if (availableSchemas.value.length === 0) {
      availableSchemas.value = [{ label: 'DEFAULT', key: 'default' }];
    }
  } catch (e) {
    availableSchemas.value = [{ label: 'DEFAULT', key: 'default' }];
  } finally {
    schemasLoading.value = false;
  }
};

watch(() => props.visible, (val) => {
    if(val) {
      form.value = { name: "", type: "default" };
      fetchSchemas();
    }
});

const handleCreate = async () => {
  if (!form.value.name) return;
  
  loading.value = true;
  try {
    // 2. FORMATAÇÃO DO NOME (SLUG DA PASTA)
    // Remove extensões se o usuário digitar e limpa espaços
    let folderName = form.value.name.trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/\.md$/, "") 
        .replace(/\s+/g, "-");

    const targetFolderPath = `${props.currentFolder}/${folderName}`;

    // 3. CRIAÇÃO DA PASTA
    await $fetch("/api/admin/mkdir", {
      method: "POST",
      body: {
        site: props.siteContext,
        folder: props.currentFolder,
        name: folderName,
      },
    });

    // 4. PREPARAÇÃO DO _INDEX.MD
    const frontmatter = { 
        schema: form.value.type, 
        title: form.value.name, 
        date: new Date().toISOString().split("T")[0] 
    };

    const content = `---\n${yaml.dump(frontmatter)}---\n\n# ${form.value.name}`;

    // 5. CRIAÇÃO DO ARQUIVO DENTRO DA NOVA PASTA
    await $fetch("/api/admin/storage", {
      method: "POST",
      body: {
        site: props.siteContext,
        folder: targetFolderPath,
        file: "_index.md",
        content,
      },
    });

    toast.add({ severity: "success", summary: "Página Criada", detail: `Pasta e _index.md gerados com sucesso.`, life: 2000 });
    
    emit('update:visible', false);
    
    // Notifica o sucesso passando o caminho do arquivo final para o editor abrir
    const finalFilePath = `${targetFolderPath}/_index.md`;
    emit('success', finalFilePath);

  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Erro", detail: "Falha ao criar estrutura de pasta/arquivo." });
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
    header="NOVA PÁGINA (ESTRUTURA DE PASTA)"
    :style="{ width: '400px' }"
    class="bg-[#141b18]"
    :appendTo="'body'"
  >
    <div class="flex flex-col gap-6 pt-4">
      <div class="flex flex-col gap-2">
        <label class="text-[10px] uppercase font-black text-[#6f942e]">Título da Página</label>
        <InputText
          v-model="form.name"
          class="bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e] transition-colors"
          placeholder="ex: Sobre Nós"
          autofocus
          @keyup.enter="handleCreate"
        />
        <p class="text-[9px] text-zinc-500 italic">Será criada uma pasta com este nome contendo um _index.md</p>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[10px] uppercase font-black text-[#6f942e]">Modelo (Schema)</label>
        
        <div v-if="schemasLoading" class="flex items-center gap-2 text-zinc-500 text-xs p-2">
           <i class="pi pi-spin pi-spinner text-[#6f942e]"></i> Carregando modelos...
        </div>

        <div v-else class="max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded p-1 bg-black/20">
         
          <div
            v-for="s in availableSchemas"
            :key="s.key"
            @click="form.type = s.key"
            :class="[
              'p-3 mb-1 rounded border cursor-pointer text-[11px] font-bold tracking-wider transition-all flex items-center justify-between',
              form.type === s.key
                ? 'border-[#6f942e] bg-[#6f942e]/10 text-white shadow-[0_0_10px_rgba(111,148,46,0.1)]'
                : 'border-transparent hover:bg-white/5 text-zinc-500 hover:text-zinc-300',
            ]"
          >
            {{ s.label }}
            <i v-if="form.type === s.key" class="pi pi-check-circle text-[#6f942e]"></i>
          </div>
        </div>
      </div>

      <Button
        label="CRIAR ESTRUTURA"
        class="bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12 transition-all active:scale-[0.98]"
        :loading="loading"
        @click="handleCreate"
      />
    </div>
  </Dialog>
</template>