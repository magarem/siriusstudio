<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  viewparams: {
    type: Object,
    default: () => ({
      columns: 4,
      card_layout: 'vertical', // 'horizontal' ou 'vertical'
      card_showtextbox: false,
      card_showtitle: true,
      card_img_aspectratio: '3/4',
      gap: '24px',
      card_border_radius: '12px',
      card_showdescription: true,
      card_showaction: false,
      card_showbadges: true,
      card_minwidth: '200px' // Reduzido para melhor ajuste
    })
  },
  config: { 
    type: Object, 
    default: () => ({
      showCountBadge: true,
      showFolderBadge: true,
      imageHoverZoom: true
    })
  },
  fallbackImage: { type: String, default: '' },
  fileIcon: { type: String, default: 'pi pi-file' }
})

const emit = defineEmits(['itemClick', 'imageError'])

// Computed para grid columns
const gridColumns = computed(() => {
  const cols = props.viewparams.columns || 4
  return Math.min(Math.max(cols, 1), 6)
})

// Computed para determinar layout
const isVerticalLayout = computed(() => {
  return props.viewparams.card_layout === 'vertical'
})

// Computed para aspect ratio da imagem baseado no layout
const imageAspectRatio = computed(() => {
  if (isVerticalLayout.value && props.viewparams.card_img_aspectratio === '4/3') {
    return '16/9'
  }
  return props.viewparams.card_img_aspectratio || '4/3'
})

// Função para calcular grid template baseado em columns
const getGridTemplate = () => {
  const cols = gridColumns.value
  
  if (cols === 1) return '1fr'
  
  // Para qualquer layout, usa número fixo de colunas
  return `repeat(${cols}, minmax(0, 1fr))`
}

const onImageError = (event, item, fallback) => {
  if (fallback && !event.target.src.includes(fallback)) {
    event.target.src = fallback
  } else {
    event.target.style.display = 'none'
    const placeholder = event.target.parentElement?.querySelector('.image-placeholder')
    if (placeholder) placeholder.style.display = 'flex'
  }
  
  emit('imageError', { event, item })
}

const onItemClick = (item, event) => {
  emit('itemClick', { item, event })
}
</script>

<template>
  <div 
    class="grid-container"
    :class="{
      'layout-vertical': isVerticalLayout,
      'layout-horizontal': !isVerticalLayout
    }"
    :style="{
      '--grid-columns': gridColumns,
      '--grid-template': getGridTemplate(),
      '--grid-gap': viewparams.gap || '24px',
      '--card-border-radius': viewparams.card_border_radius || '12px',
      '--image-aspect-ratio': imageAspectRatio,
      '--card-min-width': viewparams.card_minwidth || (isVerticalLayout ? '280px' : '350px')
    }"
  >
   
    <article
      v-for="item in items"
      :key="item.id || item.path"
      class="card-item"
      :class="{ 
        'is-folder': item.isFolder,
        'no-title': !viewparams.card_showtitle,
        'vertical': isVerticalLayout,
        'horizontal': !isVerticalLayout
      }"
      @click="onItemClick(item, $event)"
    >
   
      <NuxtLink
        v-if="item.path"
        :to="item.path"
        class="card-link"
        :title="`Acessar: ${item.title}`"
      >
        <!-- Container da imagem -->
        <div class="card-image-container">
          <div class="image-wrapper">
            <!-- Badge indicador de pasta -->
            <!-- <div 
              v-if="config.showFolderBadge && item.isFolder" 
              class="type-badge"
            >
              <i class="pi pi-folder"></i>
            </div> -->

            <!-- Imagem principal -->
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              loading="lazy"
              class="card-image"
              @error="(e) => onImageError(e, item, fallbackImage)"
            />

            <!-- Fallback image -->
            <img
              v-else-if="fallbackImage"
              :src="fallbackImage"
              :alt="`Imagem de ${item.title}`"
              loading="lazy"
              class="card-image fallback"
            />

            <!-- Placeholder -->
            <div 
              v-else 
              class="image-placeholder"
              :class="{ 'is-folder': item.isFolder }"
            >
              <i :class="item.isFolder ? 'pi pi-folder' : fileIcon"></i>
            </div>

            <!-- Placeholder escondido para fallback -->
            <div 
              v-if="item.image || fallbackImage" 
              class="image-placeholder hidden"
              :class="{ 'is-folder': item.isFolder }"
            >
              <i :class="item.isFolder ? 'pi pi-folder' : fileIcon"></i>
            </div>
          </div>
        </div>

        <!-- Conteúdo textual -->
        <div 
          v-if="viewparams.card_showtextbox"
          class="card-content bg-transparent"
          :class="{ 
            'no-padding-top': !viewparams.card_showtitle,
            'vertical-content': isVerticalLayout,
            'horizontal-content': !isVerticalLayout
          }"
        >
          <!-- Título (condicional) -->
          <header 
            v-if="viewparams.card_showtitle" 
            class="content-header"
          >
            <h3 class="card-title">
              {{ item.title }}
              <!-- <span 
                v-if="config.showCountBadge && item.count" 
                class="count-badge"
                :title="`${item.count} itens`"
              >
                {{ item.count }}
              </span> -->
            </h3>
          </header>

          <!-- Descrição -->
          <p 
            v-if="item.description && viewparams.card_showdescription !== false" 
            class="card-description"
            :title="item.description"
            :class="{
              'vertical-description': isVerticalLayout,
              'horizontal-description': !isVerticalLayout
            }"
          >
            {{ item.description }}
          </p>

          <!-- Action link -->
          <div 
            v-if="viewparams.card_showaction" 
            class="card-action"
            :class="{ 'vertical-action': isVerticalLayout }"
          >
            <span class="action-text">
              {{ item.isFolder ? 'Abrir pasta' : 'Ver detalhes' }}
              <i class="pi pi-arrow-right"></i>
            </span>
          </div>
        </div>
      </NuxtLink>
    </article>
  </div>
</template>

<style scoped>
/* ===== VARIÁVEIS CSS DINÂMICAS ===== */
.grid-container {
  --grid-columns: 4;
  --grid-template: repeat(4, minmax(0, 1fr));
  --grid-gap: 24px;
  --card-border-radius: 12px;
  --image-aspect-ratio: 4/3;
  --card-min-width: 280px;
}

/* ===== CONTAINER PRINCIPAL ===== */
.grid-container {
  display: grid;
  grid-template-columns: var(--grid-template);
  gap: var(--grid-gap);
  width: 100%;
}

/* ===== CARD INDIVIDUAL ===== */
.card-item {
  background: transparent; /* Card todo transparente */
  border-radius: var(--card-border-radius);
  border: none; /* Removida borda do card */
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 0; /* Importante para evitar overflow */
}

/* Card HORIZONTAL (imagem à esquerda, conteúdo à direita) */
.card-item.horizontal {
  display: flex;
  height: auto;
  min-height: 180px;
  background: transparent;
}

.card-item.horizontal:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Card VERTICAL (imagem em cima, conteúdo embaixo) */
.card-item.vertical {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
}

.card-item.vertical:hover {
  transform: translateY(-6px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.card-item.is-folder {
  border-left: 0px solid;
}

.card-item.no-title .card-content {
  padding-top: 0;
}

/* Link do card */
.card-link {
  display: flex;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
  background: transparent;
}

/* Layout horizontal: link em linha */
.card-item.horizontal .card-link {
  flex-direction: row;
  background: transparent;
}

/* Layout vertical: link em coluna */
.card-item.vertical .card-link {
  flex-direction: column;
  background: transparent;
}

/* ===== ÁREA DA IMAGEM ===== */
.card-image-container {
  position: relative;
  overflow: hidden;
  background: transparent; /* Fundo transparente */
  line-height: 0;
  font-size: 0;
  display: block;
}

/* Imagem no layout HORIZONTAL */
.card-item.horizontal .card-image-container {
  flex: 0 0 180px;
  aspect-ratio: var(--image-aspect-ratio, 4/3);
  height: 100%;
  background: transparent;
}

/* Imagem no layout VERTICAL */
.card-item.vertical .card-image-container {
  width: 100%;
  aspect-ratio: var(--image-aspect-ratio, 16/9);
  background: transparent;
}

.image-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
  background: transparent; /* Removido gradiente de fundo */
  vertical-align: top;
}

.card-item:hover .card-image {
  transform: scale(v-bind("config.imageHoverZoom ? '1.05' : '1'"));
}

/* Placeholder da imagem */
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b, #334155);
  margin: 0;
  padding: 0;
  line-height: 0;
}

.image-placeholder i {
  font-size: 2.5rem;
  color: #cbd5e1;
  opacity: 0.9;
}

.image-placeholder.is-folder {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
}

/* Badge de tipo */
.type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 8px;
  border-radius: 6px;
  z-index: 20;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 1;
}

.type-badge i {
  color: #3b82f6;
  font-size: 1rem;
}

.card-item.vertical .type-badge {
  top: 10px;
  right: 10px;
  padding: 5px 7px;
}

/* ===== CONTEÚDO DO CARD ===== */
.card-content {
  display: flex;
  flex-direction: column;
  min-width: 0; /* CRÍTICO: previne overflow */
  background: transparent !important; /* Fundo transparente */
}

/* Conteúdo no layout HORIZONTAL */
.card-item.horizontal .card-content {
  flex: 1;
  padding: 20px;
  background: transparent;
}

/* Conteúdo no layout VERTICAL */
.card-item.vertical .card-content {
  flex: 1;
  padding: 16px;
  background: transparent;
}

.card-content.no-padding-top {
  padding-top: 0;
}

/* Header do conteúdo */
.content-header {
  margin-bottom: 0px;
  background: transparent;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 1.325rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  word-break: break-word; /* Quebra palavras longas */
  background: transparent;
}

.card-item.vertical .card-title {
  font-size: 1rem;
  margin-bottom: 6px;
  background: transparent;
}

.count-badge {
  font-size: 0.75rem;
  background: #f3f4f6;
  color: #4b5563;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0; /* Evita que o badge quebre */
}

/* Descrição */
.card-description {
  color: #4b5563;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  background: transparent;
}

/* Descrição no layout HORIZONTAL */
.card-description.horizontal-description {
  font-size: 0.9375rem;
  -webkit-line-clamp: 2;
  flex: 1;
  background: transparent;
}

/* Descrição no layout VERTICAL */
.card-description.vertical-description {
  font-size: 0.875rem;
  -webkit-line-clamp: 3;
  background: transparent;
}

/* Action */
.card-action {
  margin-top: auto;
  background: transparent;
}

.card-item.vertical .card-action {
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
  background: transparent;
}

.action-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: gap 0.2s ease;
  background: transparent;
}

.card-item:hover .action-text {
  gap: 10px;
}

.action-text i {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  background: transparent;
}

.card-item:hover .action-text i {
  transform: translateX(3px);
}

/* ===== RESPONSIVIDADE DINÂMICA ===== */
/* Ajusta número de colunas baseado no tamanho da tela */
@media (max-width: 1400px) {
  .grid-container {
    grid-template-columns: repeat(min(var(--grid-columns, 4), 4), minmax(0, 1fr));
  }
}

@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(min(var(--grid-columns, 4), 3), minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(min(var(--grid-columns, 4), 2), minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(min(var(--grid-columns, 4), 2), minmax(0, 1fr));
    gap: 16px;
  }
  
  /* Em mobile, horizontal vira vertical */
  .card-item.horizontal {
    flex-direction: column;
  }
  
  .card-item.horizontal .card-image-container {
    flex: 0 0 auto;
    aspect-ratio: 16/9;
    width: 100%;
  }
  
  .card-item.horizontal .card-content {
    padding: 16px;
  }
}

@media (max-width: 640px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .type-badge {
    top: 8px;
    right: 8px;
    padding: 4px 6px;
  }
}

/* Estados e utilidades */
.hidden {
  display: none !important;
}

/* Animações */
.card-item {
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
  background: transparent;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation */
.card-item:nth-child(1) { animation-delay: 0.1s; }
.card-item:nth-child(2) { animation-delay: 0.2s; }
.card-item:nth-child(3) { animation-delay: 0.3s; }
.card-item:nth-child(4) { animation-delay: 0.4s; }
.card-item:nth-child(5) { animation-delay: 0.5s; }
.card-item:nth-child(6) { animation-delay: 0.6s; }
</style>