<script setup>
import { computed, ref, shallowRef, onMounted } from 'vue';
import { useToast } from "primevue/usetoast";
import { Codemirror } from 'vue-codemirror';

// --- CodeMirror Imports ---
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';

// --- Composable de Configuração ---
import { useEditorSettings } from '~/composables/useEditorSettings';

const props = defineProps({
  content: { type: String, default: '' },
  currentFolder: { type: String, default: '' },
  currentFile: { type: String, default: '' },
  isRawMode: { type: Boolean, default: false },
  siteContext: { type: String, default: 'default' }
});

const emit = defineEmits(['update:content', 'open-image', 'toggle-raw']);

const toast = useToast();
const { settings, editorStyles, loadSettings } = useEditorSettings();

// Referência rasa para a instância da View do CodeMirror
const editorView = shallowRef(null);
const isDragging = ref(false);
const isUploading = ref(false);

onMounted(() => {
  loadSettings();
});

// --- V-MODEL PROXY ---
const localContent = computed({
  get() { return props.content; },
  set(newValue) { emit('update:content', newValue); }
});

// --- ESTATÍSTICAS ---
const stats = computed(() => {
    const text = localContent.value || '';
    return {
        chars: text.length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text.split('\n').length
    };
});

// --- CONFIGURAÇÃO DO CODEMIRROR ---
const extensions = computed(() => {
  const plugins = [
    markdown(), 
    EditorView.lineWrapping,
    EditorView.domEventHandlers({
        paste: handlePaste,
        drop: handleDrop,
        dragover: (e) => { isDragging.value = true; },
        dragleave: (e) => { isDragging.value = false; }
    })
  ];

  if (settings.value.theme === 'one-dark') plugins.push(oneDark);
  if (settings.value.tabSize) plugins.push(EditorState.tabSize.of(settings.value.tabSize));

  return plugins;
});

const handleReady = (payload) => {
  editorView.value = payload.view;
};

// =============================================================================
// MANIPULAÇÃO DE TEXTO (TOOLBAR)
// =============================================================================

const insertFormat = (prefix, suffix = '', placeholder = 'texto') => {
  const view = editorView.value;
  if (!view) return;
  const { from, to } = view.state.selection.main;
  const selectedText = view.state.sliceDoc(from, to);
  const textToInsert = selectedText || placeholder;
  const insertion = `${prefix}${textToInsert}${suffix}`;
  view.dispatch({
    changes: { from, to, insert: insertion },
    selection: { anchor: from + prefix.length, head: from + prefix.length + textToInsert.length },
    scrollIntoView: true
  });
  view.focus();
};

const toggleLinePrefix = (prefix) => {
  const view = editorView.value;
  if (!view) return;
  const { from, to } = view.state.selection.main;
  const lineStart = view.state.doc.lineAt(from);
  const lineEnd = view.state.doc.lineAt(to);
  const changes = [];
  for (let i = lineStart.number; i <= lineEnd.number; i++) {
    const line = view.state.doc.line(i);
    const lineText = line.text;
    if (lineText.startsWith(prefix)) {
        changes.push({ from: line.from, to: line.from + prefix.length, insert: '' });
    } else {
        changes.push({ from: line.from, to: line.from, insert: prefix });
    }
  }
  view.dispatch({ changes, scrollIntoView: true });
  view.focus();
};

const insertBlock = (template) => {
    const view = editorView.value;
    if (!view) return;
    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);
    const prefix = (from > line.from) ? '\n\n' : '';
    const insertion = prefix + template;
    view.dispatch({
        changes: { from, insert: insertion },
        selection: { anchor: from + insertion.length },
        scrollIntoView: true
    });
    view.focus();
};

const insertAtCursor = (text) => {
    const view = editorView.value;
    if (!view) return;
    const transaction = view.state.replaceSelection(text);
    view.dispatch(transaction);
    view.focus();
};

defineExpose({ insertAtCursor });

// =============================================================================
// UPLOAD DE IMAGEM
// =============================================================================

const uploadImage = async (file) => {
    if (!file.type.startsWith('image/')) {
        toast.add({ severity: 'warn', summary: 'Apenas imagens', life: 2000 });
        return;
    }
    isUploading.value = true;
    isDragging.value = false;
    try {
        const formData = new FormData();
        formData.append('file', file);
        let targetFolder = props.currentFolder;
        if (!targetFolder || targetFolder === '.') targetFolder = 'content';
        const response = await $fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
            params: {
                site: props.siteContext,
                folder: props.currentFile.replace(/\/[^\/]*$/, '') 
            }
        });
        if (response && response.path) {
            insertAtCursor(`![${file.name}](${response.path})`);
            toast.add({ severity: 'success', summary: 'Imagem enviada', life: 2000 });
        }
    } catch (e) {
        console.error(e);
        toast.add({ severity: 'error', summary: 'Erro no upload' });
    } finally {
        isUploading.value = false;
    }
};

function handleDrop(event) {
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        event.preventDefault();
        uploadImage(files[0]);
    }
    isDragging.value = false;
}

function handlePaste(event) {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            event.preventDefault();
            uploadImage(item.getAsFile());
            return;
        }
    }
}

const actions = [
  { icon: 'pi pi-bold', title: 'Negrito (Ctrl+B)', action: () => insertFormat('**', '**') },
  { icon: 'pi pi-italic', title: 'Itálico (Ctrl+I)', action: () => insertFormat('*', '*') },
  { separator: true },
  { label: 'H1', title: 'Título 1', action: () => toggleLinePrefix('# ') },
  { label: 'H2', title: 'Título 2', action: () => toggleLinePrefix('## ') },
  { label: 'H3', title: 'Título 3', action: () => toggleLinePrefix('### ') },
  { separator: true },
  { icon: 'pi pi-list', title: 'Lista com Marcadores', action: () => toggleLinePrefix('- ') },
  { icon: 'pi pi-check-square', title: 'Lista de Tarefas', action: () => toggleLinePrefix('- [ ] ') },
  { icon: 'pi pi-align-right', title: 'Citação', action: () => toggleLinePrefix('> ') },
  { separator: true },
  { icon: 'pi pi-link', title: 'Link', action: () => insertFormat('[', '](url)') },
  { icon: 'pi pi-code', title: 'Bloco de Código', action: () => insertFormat('```\n', '\n```', 'code') },
  { icon: 'pi pi-table', title: 'Inserir Tabela', action: () => insertBlock('| Col 1 | Col 2 |\n|---|---|\n| A | B |') },
  { icon: 'pi pi-minus', title: 'Linha Horizontal', action: () => insertBlock('---\n') },
  { separator: true },
  { icon: 'pi pi-image', title: 'Inserir Imagem', action: () => emit('open-image') },
  
  // --- BOTÕES DE SISTEMA ---
  { separator: true },
  { 
      icon: 'pi pi-file-edit', 
      title: 'Ver Fonte Completo (Raw)', 
      action: () => emit('toggle-raw'),
      isActive: () => props.isRawMode 
  }
];

</script>

<template>
  <div class="flex flex-col h-full w-full bg-[#0a0f0d] relative group">
    
    <div class="flex items-center gap-1 p-2 bg-[#141b18] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0 select-none z-10">
        <template v-for="(btn, idx) in actions" :key="idx">
            <div v-if="btn.separator" class="w-[1px] h-5 bg-white/10 mx-1 shrink-0"></div>
            
            <button 
                v-else 
                @click="btn.action" 
                :title="btn.title" 
                type="button" 
                class="flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded transition-colors focus:outline-none shrink-0"
                :class="[
                    (btn.isActive && btn.isActive()) 
                        ? 'bg-[#6f942e]/20 text-[#6f942e]' 
                        : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                ]"
            >
                <i v-if="btn.icon" :class="[btn.icon, 'text-[14px]']"></i>
                <span v-if="btn.label" class="text-[12px] font-bold font-mono">{{ btn.label }}</span>
            </button>
        </template>
    </div>

    <div class="flex-1 relative overflow-hidden bg-[#0a0f0d] min-h-0 group/editor">
        
        <div v-if="isDragging" class="absolute inset-0 bg-[#6f942e]/10 border-2 border-dashed border-[#6f942e] z-30 flex items-center justify-center pointer-events-none backdrop-blur-sm">
            <div class="bg-[#141b18] px-6 py-3 rounded-full border border-[#6f942e] text-[#6f942e] font-bold shadow-xl flex items-center gap-3">
                <i class="pi pi-cloud-upload text-xl"></i> SOLTE A IMAGEM AQUI
            </div>
        </div>

        <div v-if="isUploading" class="absolute inset-0 bg-black/50 z-40 flex items-center justify-center backdrop-blur-sm">
             <div class="flex flex-col items-center gap-3">
                <i class="pi pi-spin pi-spinner text-4xl text-[#6f942e]"></i>
                <span class="text-white font-mono text-sm">ENVIANDO IMAGEM...</span>
             </div>
        </div>

        <div class="h-full w-full" :style="editorStyles">
            <Codemirror
                v-model="localContent"
                :extensions="extensions"
                :autofocus="true"
                :indent-with-tab="true"
                placeholder="Comece a escrever..."
                :style="{ height: '100%', width: '100%' }"
                @ready="handleReady"
            />
        </div>
    </div>

    <footer class="h-6 bg-[#141b18] border-t border-white/5 flex items-center justify-end px-4 gap-4 text-[10px] text-zinc-500 font-mono select-none shrink-0">
        <div class="flex items-center gap-1"><span>{{ stats.lines }}</span> <span class="text-zinc-600">LINHAS</span></div>
        <div class="flex items-center gap-1"><span>{{ stats.words }}</span> <span class="text-zinc-600">PALAVRAS</span></div>
        <div class="flex items-center gap-1"><span>{{ stats.chars }}</span> <span class="text-zinc-600">CARACTERES</span></div>
    </footer>
  </div>
</template>

<style>
.cm-scroller::-webkit-scrollbar { width: 6px; height: 6px; }
.cm-scroller::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
.cm-scroller::-webkit-scrollbar-track { background: transparent; }
.cm-content { padding: 24px !important; font-family: var(--font-family, monospace); }
.cm-header { color: #e5c07b; font-weight: bold; }
.cm-link { color: #61afef; text-decoration: underline; }
.cm-url { color: #56b6c2; }
.cm-strong { color: #d19a66; font-weight: bold; }
.cm-emphasis { font-style: italic; color: #c678dd; }
.cm-quote { color: #5c6370; font-style: italic; }
.cm-list { color: #e06c75; }
</style>