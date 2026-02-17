<script setup>
import { ref, watch } from "vue";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  visible: { type: Boolean, default: false },
  siteContext: { type: String, required: true },
  currentFolder: { type: String, default: "content" },
});

const emit = defineEmits(["update:visible", "success"]);
const toast = useToast();
const loading = ref(false);
const collectionName = ref("");

// Reseta o form ao abrir
watch(
  () => props.visible,
  (val) => {
    if (val) collectionName.value = "";
  },
);

const handleCreate = async () => {
  if (loading.value || !collectionName.value) return;

  loading.value = true;

  try {
    // Chama nosso novo endpoint inteligente
    const res = await $fetch("/api/admin/create-collection", {
      method: "POST",
      body: {
        folder: props.currentFolder,
        name: collectionName.value,
      },
    });

    toast.add({
      severity: "success",
      summary: "Coleção Criada",
      detail: "Estrutura e schemas gerados.",
      life: 2000,
    });

    emit("update:visible", false);

    // Retorna o path da nova coleção para o editor navegar até lá
    emit("success", res.path);
  } catch (e) {
    console.error(e);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: e.statusMessage || "Falha ao criar coleção.",
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
    header="NOVA COLEÇÃO"
    :style="{ width: '400px' }"
    class="bg-[#141b18]"
    :appendTo="'body'"
  >
    <div class="flex flex-col gap-6 pt-4">
      <div
        class="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-xs text-blue-200"
      >
        <i class="pi pi-info-circle mr-1"></i>
        Uma coleção gera uma pasta dedicada com schemas próprios, ideal para
        Blogs, Portfólios ou Produtos.
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[10px] uppercase font-black text-[#6f942e]"
          >Nome da Coleção</label
        >
        <InputText
          v-model="collectionName"
          class="bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e] transition-colors"
          placeholder="ex: Blog, Notícias, Produtos"
          autofocus
          @keydown.enter.prevent="handleCreate"
        />
      </div>

      <Button
        label="CRIAR ESTRUTURA"
        icon="pi pi-database"
        class="bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12 transition-all active:scale-[0.98]"
        :loading="loading"
        @click="handleCreate"
      />
    </div>
  </Dialog>
</template>
