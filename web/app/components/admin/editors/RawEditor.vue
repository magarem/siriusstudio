<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);

// Computed para facilitar o two-way data binding
const content = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<template>
  <div class="flex-1 animate-fade-in min-h-0 bg-[#141b18] border-x border-b border-white/5 rounded-b-lg flex flex-col relative">
    <div class="absolute top-2 right-4 z-10 opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
      <span class="text-[10px] text-orange-400 bg-orange-900/20 border border-orange-500/20 px-2 py-1 rounded">
        ⚠️ Cuidado com a indentação YAML
      </span>
    </div>
    <textarea
      v-model="content"
      class="flex-1 p-6 bg-transparent text-[#a3d95b] font-mono text-[13px] leading-[1.6] outline-none resize-none custom-scrollbar"
      spellcheck="false"
      placeholder="Cole seu Markdown aqui..."
    ></textarea>
  </div>
</template>