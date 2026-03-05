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

// Estado do formulário
const form = ref({ name: "", type: "default" });
const availableSchemas = ref([]);

// 1. BUSCA OS SCHEMAS (Mesma lógica que definimos antes)
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

// Reseta o form e busca schemas ao abrir
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
        // 2. GERAR O SLUG DA PASTA (Nome limpo para URL)
        let folderName = form.value.name.trim().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
            .replace(/[^\w\s-]/g, "") // remove caracteres especiais
            .replace(/\s+/g, "-");

        const targetFolderPath = `${props.currentFolder}/${folderName}`;

        // 3. PASSO A: Criar a Pasta
        await $fetch("/api/admin/mkdir", {
            method: "POST",
            body: {
                site: props.siteContext,
                folder: props.currentFolder,
                name: folderName,
            },
        });

        // 4. PASSO B: Criar o arquivo oculto .isDirFlag
        // (Isso força a Sidebar a entender que é uma pasta navegável, mesmo sem outros arquivos)
        await $fetch("/api/admin/storage", {
            method: "POST",
            body: {
                site: props.siteContext,
                folder: targetFolderPath,
                file: ".isDirFlag",
                content: "", 
            },
        });

        // 5. PASSO C: Criar o _index.md com o Schema selecionado
        const frontmatter = { 
            schema: form.value.type, 
            title: form.value.name, // Nome bonito (com acentos e espaços)
            date: new Date().toISOString().split("T")[0] 
        };

        const content = `---\n${yaml.dump(frontmatter)}---\n\n# ${form.value.name}`;

        await $fetch("/api/admin/storage", {
            method: "POST",
            body: {
                site: props.siteContext,
                folder: targetFolderPath,
                file: "_index.md",
                content,
            },
        });

        toast.add({ severity: "success", summary: "Seção Criada", detail: "Pasta configurada com sucesso.", life: 2000 });
        
        emit('update:visible', false);
        
        // Retorna o caminho do index para que o Editor abra imediatamente
        const finalFilePath = `${targetFolderPath}/_index.md`;
        emit('success', finalFilePath);

    } catch (e) {
        console.error(e);
        toast.add({ severity: "error", summary: "Erro", detail: "Falha ao criar nova seção." });
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
      header="NOVA SEÇÃO (PASTA)"
      :style="{ width: '400px' }"
      class="bg-[#141b18]"
      :appendTo="'body'"
    >
      <div class="flex flex-col gap-6 pt-4">
        
        <div class="flex flex-col gap-2">
            <label class="text-[10px] uppercase font-black text-[#6f942e]">Título da Seção</label>
            <InputText
            v-model="form.name"
            class="bg-[#0a0f0d] border border-white/10 text-white w-full focus:border-[#6f942e] transition-colors"
            placeholder="Ex: Galeria de Fotos"
            autofocus
            @keyup.enter="handleCreate"
            />
            <p class="text-[9px] text-zinc-500 italic">Uma pasta será criada contendo o arquivo principal.</p>
        </div>

        <div class="flex flex-col gap-2">
            <label class="text-[10px] uppercase font-black text-[#6f942e]">Modelo de Página</label>
            
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
          label="CRIAR SEÇÃO"
          class="bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12"
          :loading="loading"
          @click="handleCreate"
        />
      </div>
    </Dialog>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>