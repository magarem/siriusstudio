<script setup>
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

// --- LÓGICA DE RESIZE (ISOLADA AQUI) ---
const sidebarWidth = ref(350);
const isResizing = ref(false);

const startResize = (e) => {
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  const doDrag = (evt) => {
    const newWidth = startWidth + (evt.clientX - startX);
    if (newWidth > 200 && newWidth < 800) {
      sidebarWidth.value = newWidth;
    }
  };

  const stopDrag = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", doDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag);
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";
};
</script>

<template>
  <div class="flex flex-row h-full overflow-hidden animate-fade-in pt-3">
    
    <aside v-show="showMeta" class="shrink-0 flex flex-col pr-1" :style="{ width: sidebarWidth + 'px' }">
      <div class="h-full overflow-y-auto custom-scrollbar pr-2">
        <AdminMetaEditor
          :fields="fields"
          :frontmatter="frontmatter"
          :site-context="siteContext"
          @open-image="$emit('open-image', $event)"
        />
      </div>
    </aside>

    <div 
      v-show="showMeta" 
      class="w-[4px] h-full cursor-col-resize hover:bg-[#6f942e] active:bg-[#6f942e] transition-colors duration-150 flex flex-col justify-center items-center group select-none z-10 mr-2" 
      :class="isResizing ? 'bg-[#6f942e]' : 'bg-transparent'" 
      @mousedown.prevent="startResize"
    >
      <div class="w-[1px] h-full bg-white/10 group-hover:bg-[#6f942e]/50 transition-colors"></div>
    </div>

    <div class="flex-1 h-full min-w-0 overflow-hidden">
      <AdminMarkdownEditor
        :content="content"
        @update:content="$emit('update:content', $event)"
        :current-folder="currentFolder"
        :current-file="currentFile"
        @open-image="$emit('open-image', $event)"
      />
    </div>
  </div>
</template>