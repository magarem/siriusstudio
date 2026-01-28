<script setup>
import { useToast } from "primevue/usetoast";

const props = defineProps({
  visible: { type: Boolean, default: false },
  siteContext: { type: String, required: true },
  currentFolder: { type: String, default: "content" }
});

const emit = defineEmits(['update:visible', 'success']);
const toast = useToast();
const loading = ref(false);
const folderName = ref("");

watch(() => props.visible, (val) => {
    if(val) folderName.value = "";
});

const handleCreate = async () => {
    if (!folderName.value) return;
    loading.value = true;

    try {
        await $fetch("/api/admin/mkdir", {
            method: "POST",
            body: {
                site: props.siteContext,
                folder: props.currentFolder,
                name: folderName.value,
            },
        });
        toast.add({ severity: "success", summary: "Pasta criada", life: 2000 });
        emit('update:visible', false);
        emit('success');
    } catch (e) {
        toast.add({ severity: "error", summary: "Erro", detail: "Falha ao criar pasta." });
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
      header="NOVA PASTA"
      :style="{ width: '350px' }"
      class="bg-[#141b18]"
      :appendTo="'body'"
    >
      <div class="flex flex-col gap-6 pt-4">
        <InputText
          v-model="folderName"
          placeholder="Nome da pasta"
          class="bg-[#0a0f0d] border border-white/10 text-white w-full focus:border-[#6f942e]"
          autofocus
          @keyup.enter="handleCreate"
        />
        <Button
          label="CRIAR"
          class="bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25]"
          :loading="loading"
          @click="handleCreate"
        />
      </div>
    </Dialog>
</template>