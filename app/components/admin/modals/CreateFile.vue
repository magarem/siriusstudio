<script setup>
import yaml from "js-yaml";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  visible: { type: Boolean, default: false },
  siteContext: { type: String, required: true },
  currentFolder: { type: String, default: "content" },
  availableTypes: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:visible', 'success']);

const toast = useToast();
const loading = ref(false);
const form = ref({ name: "", type: "default" });

// Limpa o form ao abrir
watch(() => props.visible, (val) => {
    if(val) form.value = { name: "", type: "default" };
});

const handleCreate = async () => {
  if (!form.value.name) return;
  
  loading.value = true;
  try {
    let name = form.value.name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name.endsWith(".md")) name += ".md";

    // Gera conteúdo inicial
    const content = `---\n${yaml.dump({ 
        schema: form.value.type, 
        title: form.value.name, 
        date: new Date().toISOString().split("T")[0] 
    })}---\n\n# ${form.value.name}`;

    await $fetch("/api/admin/storage", {
      method: "POST",
      body: {
        site: props.siteContext,
        folder: props.currentFolder,
        file: name,
        content,
      },
    });

    toast.add({ severity: "success", summary: "Criado", detail: `${name} criado com sucesso.`, life: 2000 });
    
    // Fecha modal e avisa o pai para atualizar a lista e navegar
    emit('update:visible', false);
    emit('success', name);

  } catch (e) {
    console.error(e);
    toast.add({ severity: "error", summary: "Erro", detail: e.message || "Erro ao criar arquivo." });
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
    class="bg-[#141b18]"
    :appendTo="'body'"
  >
    <div class="flex flex-col gap-6 pt-4">
      <div class="flex flex-col gap-2">
        <label class="text-[10px] uppercase font-black text-[#6f942e]">Nome</label>
        <InputText
          v-model="form.name"
          class="bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e]"
          placeholder="ex: meu-post"
          autofocus
          @keyup.enter="handleCreate"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-[10px] uppercase font-black text-[#6f942e]">Tipo (Schema)</label>
        <div class="max-h-40 overflow-y-auto custom-scrollbar border border-white/5 rounded p-1">
          <div
            v-for="t in availableTypes"
            :key="t.key"
            @click="form.type = t.key"
            :class="[
              'p-2 mb-1 rounded border cursor-pointer text-xs transition-colors',
              form.type === t.key
                ? 'border-[#6f942e] bg-[#6f942e]/10 text-white'
                : 'border-transparent hover:bg-white/5 text-zinc-400',
            ]"
          >
            {{ t.label }}
          </div>
        </div>
      </div>
      <Button
        label="CRIAR"
        class="bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25]"
        :loading="loading"
        @click="handleCreate"
      />
    </div>
  </Dialog>
</template>