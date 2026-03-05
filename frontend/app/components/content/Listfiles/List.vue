<script setup>
defineProps({
  items: { type: Array, required: true },
  viewConfig: { type: Object, required: true },
  fallbackImage: { type: String, default: '' },
  fileIcon: { type: String, default: 'pi pi-file' }
});

const onImageError = (event, fallback) => {
  if (fallback && !event.target.src.includes(fallback)) {
    event.target.src = fallback;
  } else {
    event.target.style.display = 'none';
    const placeholder = event.target.parentElement?.querySelector('.placeholder');
    if (placeholder) placeholder.style.display = 'flex';
  }
};
</script>

<template>
  <div class="custom-list">
  
    <NuxtLink v-for="item in items" :key="item.path" :to="item.path" class="custom-card list-card group">
      <div class="list-image-wrapper">
          <div v-if="item.isFolder && item.image" class="folder-overlay">
            <i class="pi pi-folder text-white text-2xl drop-shadow-md"></i>
          </div>
        <img v-if="item.image" :src="item.image" loading="lazy" :alt="item.title" @error="(e) => onImageError(e, fallbackImage)" />
        <img v-else-if="fallbackImage" :src="fallbackImage" loading="lazy" class="fallback-img" />
        <div v-else class="placeholder bg-dark-blue">
          <i :class="item.isFolder ? 'pi pi-folder' : fileIcon" class="text-4xl text-white opacity-90"></i>
        </div>
          <div v-if="item.image || fallbackImage" class="placeholder hidden bg-dark-blue">
            <i :class="item.isFolder ? 'pi pi-folder' : fileIcon" class="text-4xl text-white opacity-90"></i>
          </div>
      </div>
      <div class="list-content">
        <h4 class="flex items-center gap-2">
          {{ item.title }}
          <span v-if="item.count" class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{{ item.count }} itens</span>
        </h4>
        <p v-if="item.description" class="excerpt">{{ item.description }}</p>
        <span class="read-more">{{ item.isFolder ? 'Abrir Pasta' : 'Ver Detalhes' }} →</span>
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped>
/* === LIST VIEW CONTAINER === */
.custom-list {
  display: grid; /* Mudado de flex para grid */
  grid-template-columns: repeat(2, 1fr); /* 2 Colunas Iguais */
  gap: 15px;
  width: 100%;
  margin-top: 0;
}

/* === CARD === */
.custom-card {
  /* Força 100% para preencher a coluna do grid */
  width: 100% !important; 
  text-decoration: none;
  color: inherit;
  border: 1px solid #e2e8f0;
  border-radius: v-bind("viewConfig.card_border_radius");
  overflow: hidden;
  background: #fdfdfd;
  display: flex;
}

.list-card {
  flex-direction: row;
  height: v-bind("viewConfig.list_card_height");
  transition: transform 0.2s, box-shadow 0.2s;
}
.list-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1; /* Corzinha na borda ao passar o mouse */
}

/* === IMAGEM === */
.list-image-wrapper {
  height: 100%;
  aspect-ratio: v-bind("viewConfig.list_img_aspectratio");
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: #1e293b;
}

img, .fallback-img {
  width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;
  display: block; margin: 0; padding: 0;
}
.custom-card:hover img { transform: scale(1.05); }

/* === CONTEÚDO === */
.list-content {
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.list-content h4 { margin: 0 0 8px 0; font-size: 1.25rem; font-weight: bold; color: #333; }
.list-content .excerpt { margin: 0; color: #666; font-size: 0.95rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.read-more { margin-top: auto; color: #d1b253; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; padding-top: 10px; }

/* === HELPERS === */
.folder-overlay { position: absolute; top: 0; right: 0; z-index: 10; background: rgba(0, 0, 0, 0.4); padding: 8px; border-bottom-left-radius: 12px; backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; }
.placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.bg-dark-blue { background-color: #1e293b; transition: background-color 0.3s ease; }
.group:hover .bg-dark-blue { background-color: #334155; }
.hidden { display: none !important; }

/* === RESPONSIVIDADE === */
@media (max-width: 1024px) {
  /* Em tablets pequenos, talvez manter 2 colunas ou ir pra 1 depende do gosto, mas 1 costuma ser seguro */
  .custom-list {
    grid-template-columns: 1fr; 
  }
}

@media (max-width: 768px) {
  .custom-list {
    grid-template-columns: 1fr; /* Volta para 1 coluna no mobile */
  }

  .list-card {
    flex-direction: column; /* Empilha imagem e texto no mobile */
    height: auto;
  }

  .list-image-wrapper {
    width: 100%;
    aspect-ratio: 16/9;
  }

  .list-content {
    padding: 15px;
  }
}
</style>