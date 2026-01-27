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
  <div class="custom-grid px-1">
    <NuxtLink 
          v-for="item in items" 
          :key="item.path"
          :to="item.path"
          class="custom-card grid-card group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="card-image-wrapper relative w-full overflow-hidden bg-gray-100">
            
            <div v-if="item.isFolder" class="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-colors group-hover:bg-blue-600/80">
              <i class="pi pi-folder text-white text-lg drop-shadow-sm"></i>
            </div>
            
            <img 
              v-if="item.image" 
              :src="item.image" 
              loading="lazy" 
              :alt="item.title"
              class="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              @error="onImageError"
            />
            
            <img 
              v-else-if="fallbackImage" 
              :src="fallbackImage" 
              loading="lazy" 
              class="fallback-img h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              alt="Capa Padrão"
            />

            <div v-else class="placeholder flex h-full w-full items-center justify-center bg-slate-800">
               <i :class="item.isFolder ? 'pi pi-folder' : fileIcon" class="text-6xl text-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:text-white/40"></i>
            </div>
            
            <div v-if="item.image || fallbackImage" class="placeholder hidden bg-slate-800">
               <i :class="item.isFolder ? 'pi pi-folder' : fileIcon" class="text-6xl text-white/20"></i>
            </div>
          </div>

          <div v-if="viewConfig.card_showtitle" class="card-content flex flex-grow flex-col justify-center p-4">
            <h2 class="flex w-full items-center justify-between gap-2 text-base font-semibold leading-tight text-slate-700 transition-colors group-hover:text-blue-700">
              <span class="truncate">{{ item.title }}</span>
              
              <span v-if="item.count" class="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 group-hover:bg-blue-100">
                {{ item.count }}
              </span>
            </h2>
          </div>
        </NuxtLink>
  </div>
</template>

<style scoped>
/* ANIMAÇÃO */
.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* HEADER */
.list-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #4a3728;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.list-container {
  width: 100%;
  margin-bottom: 30px;
}

/* CARD GERAL */
.custom-card {
  text-decoration: none;
  color: inherit;
  border: 1px solid #e2e8f0;
  border-radius: v-bind("viewConfig.card_border_radius");
  overflow: hidden;
  background: #fdfdfd;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
  display: flex;
  padding: 0;
  width: v-bind("viewConfig.card_width");
}

.custom-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

/* IMAGENS E PLACEHOLDERS */
.folder-overlay {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.4);
  padding: 8px;
  border-bottom-left-radius: 12px;
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

img,
.fallback-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  display: block;
  margin: 0;
  padding: 0;
}

.custom-card:hover img {
  transform: scale(1.05);
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

/* --- FUNDO AZUL ESCURO PARA PLACEHOLDERS --- */
.bg-dark-blue {
  background-color: #1e293b;
  transition: background-color 0.3s ease;
}

.group:hover .bg-dark-blue {
  background-color: #334155;
}

.hidden {
  display: none !important;
}

/* === GRID VIEW === */
.custom-grid {
  display: grid;
  grid-template-columns: repeat(v-bind("viewConfig.columns"), 1fr);
  gap: v-bind("viewConfig.gap");
  width: 100%;
  margin-top: 0;
}

.grid-card {
  flex-direction: column;
}

.grid-card .card-image-wrapper {
  width: 100%;
  aspect-ratio: v-bind("viewConfig.card_img_aspectratio");
  overflow: hidden;
  position: relative;
  background: #1e293b;
  margin: 0;
  padding: 0;
  display: block;
}

.grid-card .card-image-wrapper img {
  object-fit: v-bind("viewConfig.card_img_object_fit");
}

.grid-card .card-content {
  padding: v-bind("viewConfig.card_padding");
}

.grid-card .card-content h2 {
  color: v-bind("viewConfig.title_color");
  font-size: v-bind("viewConfig.title_size");
  font-weight: v-bind("viewConfig.title_weight");
  margin: 0;
  line-height: 1.3;
}

/* === LIST VIEW === */
.custom-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  margin-top: 0;
}

.list-card {
  flex-direction: row;
  height: v-bind("viewConfig.list_card_height");
}

.list-image-wrapper {
  height: 100%;
  aspect-ratio: v-bind("viewConfig.list_img_aspectratio");
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: #1e293b;
  margin: 0;
  padding: 0;
}

.list-content {
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.list-content h4 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.list-content .excerpt {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more {
  margin-top: auto;
  color: #d1b253;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-top: 10px;
}

/* RESPONSIVIDADE */
@media (max-width: 1024px) {
  .custom-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .custom-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px;
  }

  .list-card {
    flex-direction: column;
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

@media (max-width: 480px) {
  .custom-grid {
    grid-template-columns: 1fr !important;
  }
}

</style>