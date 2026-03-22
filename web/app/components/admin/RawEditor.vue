<script setup>
import { computed, onMounted } from 'vue'
import { Codemirror } from 'vue-codemirror'

// --- 1. IMPORTAÇÃO DO TEMA QUE FALTAVA ---
import { oneDark } from '@codemirror/theme-one-dark'

// Importações de linguagens
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { StreamLanguage } from '@codemirror/language'
import { toml } from '@codemirror/legacy-modes/mode/toml'

// Importações do CodeMirror Core
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'

// Nosso Composable de Configuração
import { useEditorSettings } from '~/composables/useEditorSettings'

const props = defineProps({
  modelValue: { type: String, default: '' },
  filename: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'save'])

const { settings, editorStyles, loadSettings } = useEditorSettings()

// Carrega as configurações ao abrir o editor
onMounted(() => {
  loadSettings()
})

// Proxy para v-model (Leitura/Escrita)
const code = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

// Extensões do CodeMirror (Reativas às configurações)
const extensions = computed(() => {
  const ext = props.filename.split('.').pop()?.toLowerCase()
  
  const plugins = []

  // --- 2. LÓGICA DO TEMA BASEADA NO JSON ---
  // Se no _config.json estiver "one-dark", carrega o tema.
  // Se estiver null ou "light", usa o padrão claro do CodeMirror.
  if (settings.value.theme === 'one-dark') {
    plugins.push(oneDark)
  }

  // Configurações dinâmicas
  if (settings.value.tabSize) {
    plugins.push(EditorState.tabSize.of(settings.value.tabSize))
  }

  if (settings.value.wordWrap) {
    plugins.push(EditorView.lineWrapping)
  }

  // Linguagens
  switch (ext) {
    case 'json':
      plugins.push(json())
      break
    case 'yaml': 
    case 'yml':
      plugins.push(yaml())
      break
    case 'toml':
      plugins.push(StreamLanguage.define(toml))
      break
  }
  
  return plugins
})

const handleReady = (payload) => {
  // payload.view.contentDOM.focus()
}
</script>

<template>
  <div 
    class="raw-editor-container w-full h-full"
    :style="editorStyles" 
  >
    <Codemirror
      v-model="code"
      :extensions="extensions"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="settings?.tabSize || 2"
      placeholder="Carregando..."
      :style="{ height: '100%', width: '100%' }" 
      @ready="handleReady"
    />
  </div>
</template>

<style>
.raw-editor-container .cm-editor {
  height: 100%;
  outline: none;
}
.raw-editor-container .cm-scroller {
  overflow: auto;
}
.raw-editor-container .cm-gutters {
  font-size: 0.9em; 
  background-color: #141b19; 
  border-right: 1px solid rgba(255,255,255,0.05);
}
</style>