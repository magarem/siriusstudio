<script setup>
import { computed, ref, nextTick } from 'vue';
import { useToast } from "primevue/usetoast"; // Importar Toast para feedback

const props = defineProps({
  content: { type: String, default: '' },
  currentFolder: { type: String, default: '' }, // Vamos usar isso para saber onde salvar a imagem
  currentFile: { type: String, default: '' },
  isRawMode: { type: Boolean, default: false },
  siteContext: { type: String, default: 'default' } // Necessário para a API
});

const emit = defineEmits(['update:content', 'open-image', 'toggle-raw']);

const toast = useToast();
const textareaRef = ref(null);
const isDragging = ref(false);
const isUploading = ref(false);

// Computada para v-model
const localContent = computed({
  get() { return props.content; },
  set(newValue) { emit('update:content', newValue); }
});

const stats = computed(() => {
    const text = localContent.value || '';
    return {
        chars: text.length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text.split('\n').length
    };
});

// --- FUNÇÃO PÚBLICA PARA INSERIR NO CURSOR ---
const insertAtCursor = (insertion) => {
    const el = textareaRef.value;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const start = el.selectionStart || el.value.length; 
    const end = el.selectionEnd || el.value.length;
    const text = el.value;

    const newText = text.substring(0, start) + insertion + text.substring(end);
    
    emit('update:content', newText);

    nextTick(() => {
        el.focus();
        const newCursorPos = start + insertion.length;
        el.setSelectionRange(newCursorPos, newCursorPos);
        el.scrollTop = scrollTop;
    });
};

defineExpose({ insertAtCursor });

// =============================================================================
// DRAG & DROP + PASTE (Colar Imagem)
// =============================================================================

// Dentro de components/admin/MarkdownEditor.vue

const uploadImage = async (file) => {
    if (!file.type.startsWith('image/')) {
        toast.add({ severity: 'warn', summary: 'Arquivo inválido', detail: 'Apenas imagens são permitidas.', life: 2000 });
        return;
    }

    isUploading.value = true;
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Define a pasta de destino
        let targetFolder = props.currentFolder;
        if (!targetFolder || targetFolder === '.') targetFolder = 'content';

        // [CORREÇÃO] Envia site e folder na URL (Query String) para bater com a API
        const response = await $fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
            params: {
                site: props.siteContext,
                folder: props.currentFile.replace(/\/[^\/]*$/, '') // Pasta do arquivo atual
            }
        });

        if (response && response.path) {
            // Insere o markdown usando o caminho retornado pela API
            const imageMarkdown = `\n![${file.name}](${response.path})`;
            insertAtCursor(imageMarkdown);
            toast.add({ severity: 'success', summary: 'Imagem Inserida', life: 2000 });
        } else {
            throw new Error('Caminho não retornado pela API');
        }

    } catch (e) {
        console.error(e);
        toast.add({ severity: 'error', summary: 'Erro no Upload', detail: 'Não foi possível enviar a imagem.' });
    } finally {
        isUploading.value = false;
        isDragging.value = false;
    }
};

const handleDrop = (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadImage(files[0]);
    }
    isDragging.value = false;
};

const handlePaste = (e) => {
    // Verifica se há arquivos na área de transferência (ex: Print Screen)
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            uploadImage(file);
            // Previne que o navegador cole o "objeto" imagem (comportamento padrão bugado em textarea)
            e.preventDefault(); 
            return; 
        }
    }
    // Se for texto normal, deixa colar nativamente
};


// --- HELPERS DE FORMATAÇÃO ---
const insertFormat = (prefix, suffix = '', placeholder = 'texto') => {
  const el = textareaRef.value;
  if (!el) return;
  const scrollTop = el.scrollTop;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = el.value;
  const selection = text.substring(start, end) || placeholder;
  const insertion = prefix + selection + suffix;
  const newText = text.substring(0, start) + insertion + text.substring(end);
  emit('update:content', newText);
  nextTick(() => {
    el.focus();
    if (start === end) {
        const newCursorStart = start + prefix.length;
        const newCursorEnd = newCursorStart + placeholder.length;
        el.setSelectionRange(newCursorStart, newCursorEnd);
    } else {
        el.setSelectionRange(start, start + insertion.length);
    }
    el.scrollTop = scrollTop;
  });
};

const toggleLinePrefix = (prefix) => {
    const el = textareaRef.value;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    let startLineIndex = text.lastIndexOf('\n', start - 1) + 1;
    let endLineIndex = text.indexOf('\n', end);
    if (endLineIndex === -1) endLineIndex = text.length;
    const selectedText = text.substring(startLineIndex, endLineIndex);
    const lines = selectedText.split('\n');
    const allHavePrefix = lines.every(line => line.startsWith(prefix));
    const newLines = lines.map(line => allHavePrefix ? line.substring(prefix.length) : prefix + line);
    const newBlock = newLines.join('\n');
    const newText = text.substring(0, startLineIndex) + newBlock + text.substring(endLineIndex);
    emit('update:content', newText);
    nextTick(() => {
        el.focus();
        el.setSelectionRange(startLineIndex, startLineIndex + newBlock.length);
        el.scrollTop = scrollTop;
    });
};

const insertBlock = (template) => {
    const el = textareaRef.value;
    const scrollTop = el.scrollTop;
    const start = el.selectionStart;
    const text = el.value;
    const prefix = (start > 0 && text[start - 1] !== '\n') ? '\n\n' : '';
    const insertion = prefix + template;
    const newText = text.substring(0, start) + insertion + text.substring(el.selectionEnd);
    emit('update:content', newText);
    nextTick(() => {
        el.focus();
        const cursorPosition = start + insertion.length;
        el.setSelectionRange(cursorPosition, cursorPosition);
        el.scrollTop = scrollTop;
    });
};

const handleTab = (e) => {
  const textarea = e.target;
  const scrollTop = textarea.scrollTop;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const newValue = localContent.value.substring(0, start) + "  " + localContent.value.substring(end);
  emit('update:content', newValue);
  nextTick(() => { 
      textarea.selectionStart = textarea.selectionEnd = start + 2; 
      textarea.scrollTop = scrollTop; 
  });
};

const actions = [
  { icon: 'pi pi-bold', title: 'Negrito (Ctrl+B)', action: () => insertFormat('**', '**', 'texto') },
  { icon: 'pi pi-italic', title: 'Itálico (Ctrl+I)', action: () => insertFormat('*', '*', 'texto') },
  { separator: true },
  { label: 'H1', title: 'Título 1', action: () => toggleLinePrefix('# ') },
  { label: 'H2', title: 'Título 2', action: () => toggleLinePrefix('## ') },
  { label: 'H3', title: 'Título 3', action: () => toggleLinePrefix('### ') },
  { separator: true },
  { icon: 'pi pi-list', title: 'Lista com Marcadores', action: () => toggleLinePrefix('- ') },
  { icon: 'pi pi-check-square', title: 'Lista de Tarefas', action: () => toggleLinePrefix('- [ ] ') },
  { icon: 'pi pi-align-right', title: 'Citação', action: () => toggleLinePrefix('> ') },
  { separator: true },
  { icon: 'pi pi-link', title: 'Link', action: () => insertFormat('[', '](url)', 'texto') },
  { icon: 'pi pi-code', title: 'Bloco de Código', action: () => insertFormat('```\n', '\n```', 'código') },
  { icon: 'pi pi-table', title: 'Inserir Tabela', action: () => insertBlock('| Coluna 1 | Coluna 2 |\n|---|---|\n| Dado 1 | Dado 2 |') },
  { icon: 'pi pi-minus', title: 'Linha Horizontal', action: () => insertBlock('---\n') },
  { separator: true },
  { icon: 'pi pi-image', title: 'Inserir Imagem', action: () => emit('open-image') },
];
</script>

<template>
  <div class="flex flex-col h-full w-full bg-[#0a0f0d] relative group">
    
    <div class="flex items-center gap-1 p-2 bg-[#141b18] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0 select-none z-10">
        <template v-for="(btn, idx) in actions" :key="idx">
            <div v-if="btn.separator" class="w-[1px] h-5 bg-white/10 mx-1 shrink-0"></div>
            <button v-else @click="btn.action" :title="btn.title" type="button" class="flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors focus:outline-none shrink-0">
                <i v-if="btn.icon" :class="[btn.icon, 'text-[14px]']"></i>
                <span v-if="btn.label" class="text-[12px] font-bold font-mono">{{ btn.label }}</span>
            </button>
        </template>
    </div>

    <div class="flex-1 relative overflow-hidden bg-[#0a0f0d] min-h-0">
        
        <div 
            v-if="isDragging" 
            class="absolute inset-0 bg-[#6f942e]/10 border-2 border-dashed border-[#6f942e] z-20 flex items-center justify-center pointer-events-none backdrop-blur-sm"
        >
            <div class="bg-[#141b18] px-6 py-3 rounded-full border border-[#6f942e] text-[#6f942e] font-bold shadow-xl flex items-center gap-3">
                <i class="pi pi-cloud-upload text-xl"></i>
                SOLTE A IMAGEM AQUI
            </div>
        </div>

        <div v-if="isUploading" class="absolute inset-0 bg-black/50 z-30 flex items-center justify-center backdrop-blur-sm">
             <div class="flex flex-col items-center gap-3">
                <i class="pi pi-spin pi-spinner text-4xl text-[#6f942e]"></i>
                <span class="text-white font-mono text-sm">ENVIANDO IMAGEM...</span>
             </div>
        </div>

        <textarea 
            ref="textareaRef"
            v-model="localContent"
            @keydown.tab.prevent="handleTab"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @paste="handlePaste"
            class="w-full h-full p-6 bg-transparent text-slate-200 font-mono text-[14px] leading-[1.8] outline-none resize-none custom-scrollbar selection:bg-[#6f942e]/30 placeholder-white/10"
            spellcheck="false" 
            placeholder="Comece a escrever seu conteúdo markdown... (Arraste imagens ou cole prints aqui)"
        ></textarea>
    </div>

    <footer class="h-6 bg-[#141b18] border-t border-white/5 flex items-center justify-end px-4 gap-4 text-[10px] text-zinc-500 font-mono select-none shrink-0">
        <div class="flex items-center gap-1"><span>{{ stats.lines }}</span> <span class="text-zinc-600">LINHAS</span></div>
        <div class="flex items-center gap-1"><span>{{ stats.words }}</span> <span class="text-zinc-600">PALAVRAS</span></div>
        <div class="flex items-center gap-1"><span>{{ stats.chars }}</span> <span class="text-zinc-600">CARACTERES</span></div>
    </footer>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
</style>