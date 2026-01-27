<script setup>
import yaml from "js-yaml"; // Certifique-se de ter instalado: npm install js-yaml
import { useToast } from "primevue/usetoast";

// --- PROPS ---
const props = defineProps({
  // Controle de Visibilidade (v-model)
  visible: { type: Boolean, default: false },
  
  // Contexto necessário para a API
  siteContext: { type: String, required: true },
  currentFolder: { type: String, default: "content" },
  
  // Lista de tipos de schema (Padrão, Blog, Portfolio, etc)
  availableTypes: { 
    type: Array, 
    default: () => [{ key: 'default', label: 'Padrão', icon: 'pi-file' }] 
  }
});

// --- EMITS ---
const emit = defineEmits(['update:visible', 'success']);

const toast = useToast();
const loading = ref(false);
const form = ref({ 
  name: "", 
  type: "default" 
});

// Reseta o formulário toda vez que a modal abre
watch(() => props.visible, (isOpen) => {
  if (isOpen) {
    form.value.name = "";
    form.value.type = "default";
  }
});

// --- AÇÃO DE CRIAR ---
const handleCreate = async () => {
  if (!form.value.name.trim()) {
    toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Digite um nome para o arquivo.', life: 2000 });
    return;
  }

  loading.value = true;

  try {
    // 1. Sanitiza o nome do arquivo
    let name = form.value.name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name.endsWith(".md")) name += ".md";

    // 2. Gera o conteúdo inicial (Frontmatter + Título)
    const frontmatterObj = {
      schema: form.value.type,
      title: form.value.name,
      date: new Date().toISOString().split("T")[0]
    };
    
    const yamlString = yaml.dump(frontmatterObj);
    const content = `---\n${yamlString}---\n\n# ${form.value.name}`;

    // 3. Chamada API
    await $fetch("/api/admin/storage", {
      method: "POST",
      body: {
        site: props.siteContext,
        folder: props.currentFolder,
        file: name,
        content,
      },
    });

    toast.add({ severity: "success", summary: "Sucesso", detail: `Arquivo ${name} criado.`, life: 2000 });

    // 4. Emite sucesso com o nome do arquivo para o pai navegar até ele
    emit('success', name);
    
    // 5. Fecha a modal
    emit('update:visible', false);

  } catch (e) {
    console.error(e);
    toast.add({ 
      severity: "error", 
      summary: "Erro", 
      detail: e.data?.message || "Falha ao criar arquivo.", 
      life: 3000 
    });
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
    header="NOVO ARQUIVO"
    :style="{ width: '400px' }"
    :contentStyle="{ backgroundColor: '#141b18', color: 'white' }"
    :headerStyle="{ backgroundColor: '#141b18', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)' }"
    class="custom-modal-dark"
    :dismissableMask="true"
  >
    <div class="flex flex-col gap-6 pt-4">
      
      <div class="flex flex-col gap-2">
        <label class="text-[10px] uppercase font-black text-[#6f942e]">
          Nome do Arquivo
        </label>
        <InputText
          v-model="form.name"
          placeholder="ex: meu-artigo"
          class="bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e] w-full"
          @keyup.enter="handleCreate"
          autofocus
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[10px] uppercase font-black text-[#6f942e]">
          Tipo de Conteúdo
        </label>
        <div class="max-h-40 overflow-y-auto custom-scrollbar border border-white/5 rounded bg-[#0a0f0d]/50">
          <div
            v-for="t in availableTypes"
            :key="t.key"
            @click="form.type = t.key"
            class="p-2 flex items-center gap-2 cursor-pointer text-xs transition-colors hover:bg-white/5"
            :class="form.type === t.key ? 'border-l-2 border-[#6f942e] bg-[#6f942e]/10 text-white' : 'border-l-2 border-transparent text-gray-400'"
          >
            <i :class="['pi', t.icon || 'pi-file']"></i>
            <div class="flex flex-col">
               <span class="font-bold">{{ t.label }}</span>
               <span v-if="t.description" class="text-[9px] opacity-60">{{ t.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        label="CRIAR ARQUIVO"
        icon="pi pi-plus"
        :loading="loading"
        class="bg-[#6f942e] hover:bg-[#5a7a25] border-none text-black font-black w-full mt-2"
        @click="handleCreate"
      />
    </div>
  </Dialog>
</template>

<style scoped>
/* Pequeno ajuste para garantir que o scrollbar combine com o tema */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(111, 148, 46, 0.3);
  border-radius: 4px;
}
</style>