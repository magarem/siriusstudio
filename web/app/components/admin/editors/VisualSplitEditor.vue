<script setup>
import { ref } from 'vue';
import AdminMetaEditor from "~/components/admin/MetaEditor.vue";
import AdminMarkdownEditor from "~/components/admin/MarkdownEditor.vue";

const props = defineProps({
  // Dados
  frontmatter: { type: Object, required: true },
  content: { type: String, default: '' },
  fields: { type: Array, default: () => [] },
  
  // Contexto
  siteContext: { type: String, required: true },
  currentFolder: { type: String, required: true },
  currentFile: { type: String, required: true },
  
  // UI
  showMeta: { type: Boolean, default: true }
});

const emit = defineEmits(['update:content', 'update:frontmatter', 'open-image']);

// --- LÓGICA DE RESIZE ---
const sidebarWidth = ref(350);
const isResizing = ref(false);

const startResize = (e) => {
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";

  const doDrag = (evt) => {
    const delta = evt.clientX - startX;
    const newWidth = startWidth + delta;
    if (newWidth > 200 && newWidth < 800) {
      sidebarWidth.value = newWidth;
    }
  };

  const stopDrag = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", doDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag);
};
</script>

<template>
  <div class="flex flex-row h-full w-full overflow-hidden relative">
    
    <aside 
      v-show="showMeta" 
      class="shrink-0 flex flex-col bg-[#141b18] border-r border-white/5 h-full" 
      :style="{ width: sidebarWidth + 'px' }"
    >
     <div class="flex-1 h-full min-w-0 overflow-hidden bg-[#0a0f0d] relative flex flex-col">
          <AdminMetaEditor
          :fields="fields"
          :currentFolder="currentFolder"
          :frontmatter="frontmatter"
          :site-context="siteContext"
          @open-image="$emit('open-image', $event)"
          class="h-full" 
        />
      </div>
    </aside>

    <div 
      v-show="showMeta" 
      class="w-[4px] h-full cursor-col-resize hover:bg-[#6f942e] active:bg-[#6f942e] transition-colors duration-150 flex flex-col justify-center items-center group select-none z-20 bg-black/20 -ml-[2px]" 
      :class="isResizing ? 'bg-[#6f942e]' : ''" 
      @mousedown.prevent="startResize"
      title="Arraste para redimensionar"
    >
      <div class="w-[1px] h-8 bg-white/20 group-hover:bg-white/80 rounded-full"></div>
    </div>

    <div class="flex-1 h-full min-w-0 overflow-hidden bg-[#0a0f0d] flex flex-col">
      <AdminMarkdownEditor
        class="h-full w-full !max-h-full"
        :content="content"
        @update:content="$emit('update:content', $event)"
        :current-folder="currentFolder"
        :current-file="currentFile"
        @open-image="$emit('open-image', $event)"
      />
    </div>

    <div 
        v-if="isResizing" 
        class="fixed inset-0 z-50 cursor-col-resize bg-transparent"
    ></div>

  </div>
</template>

<style scoped>
/* Scrollbar fina */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(111, 148, 46, 0.5); }
</style>