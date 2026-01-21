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

// O v-model do textarea usa essa computada para ler e escrever
const localContent = computed({
  get() {
    return props.content;
  },
  set(newValue) {
    emit('update:content', newValue);
  }
});

// --- LÓGICA DE INSERÇÃO DE MARKDOWN ---

/**
 * Envolve o texto selecionado ou insere a sintaxe no cursor
 * @param {String} prefix - O que vem antes (ex: "**")
 * @param {String} suffix - O que vem depois (ex: "**")
 * @param {String} placeholder - Texto padrão se nada estiver selecionado
 */
const insertFormat = (prefix, suffix = '', placeholder = 'texto') => {
  const el = textareaRef.value;
  if (!el) return;

  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = el.value;

  // Pega o texto selecionado ou usa o placeholder
  const selection = text.substring(start, end) || placeholder;
  
  // Monta o novo texto
  const insertion = prefix + selection + suffix;
  const newText = text.substring(0, start) + insertion + text.substring(end);

  // Atualiza o valor
  emit('update:content', newText);

  // Recoloca o foco e a seleção (após o Vue atualizar o DOM)
  nextTick(() => {
    el.focus();
    // Se tinha seleção, seleciona o texto de dentro. Se não, seleciona o placeholder.
    const newCursorStart = start + prefix.length;
    const newCursorEnd = newCursorStart + selection.length;
    el.setSelectionRange(newCursorStart, newCursorEnd);
  });
};

/**
 * Insere bloco no início da linha (ex: Listas, Títulos)
 */
const insertBlock = (prefix) => {
    const el = textareaRef.value;
    if (!el) return;
    
    // Simplificado: Apenas insere na posição do cursor
    // Uma implementação mais robusta buscaria o início da linha atual
    insertFormat(prefix, '', 'Item');
}

// Ações dos botões
const actions = [
  { icon: 'pi pi-bold', title: 'Negrito (Ctrl+B)', action: () => insertFormat('**', '**', 'negrito') },
  { icon: 'pi pi-italic', title: 'Itálico (Ctrl+I)', action: () => insertFormat('*', '*', 'itálico') },
  { icon: 'pi pi-at', title: 'Riscado', action: () => insertFormat('~~', '~~', 'riscado') },
  { separator: true },
  { label: 'H1', title: 'Título 1', action: () => insertFormat('# ', '', 'Título') },
  { label: 'H2', title: 'Título 2', action: () => insertFormat('## ', '', 'Título') },
  { label: 'H3', title: 'Título 3', action: () => insertFormat('### ', '', 'Título') },
  { separator: true },
  { icon: 'pi pi-list', title: 'Lista com pontos', action: () => insertFormat('- ', '', 'Item') },
  { icon: 'pi pi-list-check', title: 'Lista Check', action: () => insertFormat('- [ ] ', '', 'Tarefa') },
  { separator: true },
  { icon: 'pi pi-link', title: 'Link', action: () => insertFormat('[', '](url)', 'texto link') },
  { icon: 'pi pi-code', title: 'Bloco de Código', action: () => insertFormat('```\n', '\n```', 'código') },
  { icon: 'pi pi-align-left', title: 'Citação', action: () => insertFormat('> ', '', 'citação') },
  { separator: true },
  // A imagem chama o evento externo do seu sistema
  { icon: 'pi pi-image', title: 'Inserir Imagem', action: () => emit('open-image') },
];

</script>

<template>
  <main class="bg-[#141b18] rounded-[0.5vw] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative h-full group">
    
    <div class="flex items-center gap-1 p-2 bg-[#1a2320] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0 select-none">
        
        <template v-for="(btn, idx) in actions" :key="idx">
            
            <div v-if="btn.separator" class="w-[1px] h-5 bg-white/10 mx-1"></div>

            <button 
                v-else
                @click="btn.action"
                :title="btn.title"
                class="flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
                <i v-if="btn.icon" :class="[btn.icon, 'text-[14px]']"></i>
                
                <span v-if="btn.label" class="text-[12px] font-bold font-mono">{{ btn.label }}</span>
            </button>

        </template>
    </div>

    <div class="flex-1 relative overflow-hidden bg-[#0f1211]">
        <textarea 
            ref="textareaRef"
            v-model="localContent" 
            class="w-full h-full p-7 bg-transparent text-indigo-50 font-mono text-[14px] leading-[1.8] outline-none resize-none custom-scrollbar selection:bg-[#6f942e]/30" 
            spellcheck="false" 
            placeholder="Comece a escrever seu conteúdo..."
        ></textarea>
    </div>

  </main>
</template>

<style scoped>
/* Scrollbar fina para o toolbar e textarea */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
</style>