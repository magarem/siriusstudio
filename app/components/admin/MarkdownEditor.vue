<script setup>
import { computed, ref, nextTick } from 'vue';

const props = defineProps({
  content: { type: String, default: '' },
  currentFolder: { type: String, default: '' },
  currentFile: { type: String, default: '' },
  isRawMode: { type: Boolean, default: false }
});

const emit = defineEmits(['update:content', 'open-image', 'toggle-raw']);

const textareaRef = ref(null);

// Computada para v-model (bidirecional)
const localContent = computed({
  get() { return props.content; },
  set(newValue) { emit('update:content', newValue); }
});

// --- HELPER: Inserir Texto ---
const insertFormat = (prefix, suffix = '', placeholder = 'texto') => {
  const el = textareaRef.value;
  if (!el) return;

  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = el.value;

  const selection = text.substring(start, end) || placeholder;
  const insertion = prefix + selection + suffix;
  const newText = text.substring(0, start) + insertion + text.substring(end);

  emit('update:content', newText);

  nextTick(() => {
    el.focus();
    const newCursorStart = start + prefix.length;
    const newCursorEnd = newCursorStart + selection.length;
    el.setSelectionRange(newCursorStart, newCursorEnd);
  });
};

// --- HELPER: Tecla TAB (Essencial) ---
const handleTab = (e) => {
  const textarea = e.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // Insere 2 espaços
  const newValue = localContent.value.substring(0, start) + "  " + localContent.value.substring(end);
  emit('update:content', newValue);

  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 2;
  });
};

// --- AÇÕES DO TOOLBAR ---
const actions = [
  { icon: 'pi pi-bold', title: 'Negrito', action: () => insertFormat('**', '**', 'negrito') },
  { icon: 'pi pi-italic', title: 'Itálico', action: () => insertFormat('*', '*', 'itálico') },
  { separator: true },
  { label: 'H1', title: 'Título 1', action: () => insertFormat('# ', '', 'Título') },
  { label: 'H2', title: 'Título 2', action: () => insertFormat('## ', '', 'Título') },
  { label: 'H3', title: 'Título 3', action: () => insertFormat('### ', '', 'Título') },
  { separator: true },
  { icon: 'pi pi-list', title: 'Lista', action: () => insertFormat('- ', '', 'Item') },
  { icon: 'pi pi-check-square', title: 'Tarefa', action: () => insertFormat('- [ ] ', '', 'Tarefa') },
  { separator: true },
  { icon: 'pi pi-link', title: 'Link', action: () => insertFormat('[', '](url)', 'texto link') },
  { icon: 'pi pi-code', title: 'Código', action: () => insertFormat('```\n', '\n```', 'código') },
  { separator: true },
  { icon: 'pi pi-image', title: 'Inserir Imagem', action: () => emit('open-image') },
];
</script>

<template>
  <div class="flex flex-col h-full w-full bg-[#0a0f0d] relative group">
    
    <div class="flex items-center gap-1 p-2 bg-[#141b18] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0 select-none z-10">
        <template v-for="(btn, idx) in actions" :key="idx">
            <div v-if="btn.separator" class="w-[1px] h-5 bg-white/10 mx-1"></div>
            <button 
                v-else
                @click="btn.action"
                :title="btn.title"
                type="button"
                class="flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors focus:outline-none"
            >
                <i v-if="btn.icon" :class="[btn.icon, 'text-[14px]']"></i>
                <span v-if="btn.label" class="text-[12px] font-bold font-mono">{{ btn.label }}</span>
            </button>
        </template>
    </div>

    <div class="flex-1 relative overflow-hidden bg-[#0a0f0d] min-h-0">
        <textarea 
            ref="textareaRef"
            v-model="localContent"
            @keydown.tab.prevent="handleTab"
            class="w-full h-full p-6 bg-transparent text-slate-200 font-mono text-[14px] leading-[1.8] outline-none resize-none custom-scrollbar selection:bg-[#6f942e]/30 placeholder-white/10"
            spellcheck="false" 
            placeholder="Comece a escrever seu conteúdo markdown..."
        ></textarea>
    </div>

  </div>
</template>

<style scoped>
/* Scrollbar fina */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
</style>