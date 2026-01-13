<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  section: { type: String, required: true },
  icon: { type: String, default: 'pi pi-images' },
  view: { type: String, default: 'grid' }, // 'grid' ou 'list'
  limit: { type: Number, default: 1000 } 
});

const config = useRuntimeConfig();
const siteName = config.public.siteName;

// 1. O backend já devolve a lista ORDENADA pelo _order.yml
const { data: files, pending } = await useFetch('/api/admin/storage', {
  query: { site: siteName, folder: props.section },
  key: `list-${props.section}`
});

// 2. O .filter() mantem a ordem original do array
const filteredFiles = computed(() => {
  if (!files.value || !Array.isArray(files.value)) return [];
  
  // --- ALTERAÇÃO AQUI ---
  // Adicionamos: && f.name !== 'schema.json'
  return files.value.filter(f => 
    !f.isDirectory && 
    f.name !== 'index.md' && 
    f.name !== 'schema.json'
  );
});

const getLink = (fileName) => {
  const cleanPath = props.section.replace(/^content\/?/, '');
  const cleanFile = fileName.replace(/\.[^/.]+$/, "");
  return `/${cleanPath}/${cleanFile}`.replace(/\/+/g, '/');
};

const getFirstImage = (file) => {
  return file.data?.images?.[0] || file.data?.topimages?.[0] || null;
};
</script>

<template>
  <div class="list-container">
    <h3 v-if="title" class="list-title">
      <i :class="icon"></i> {{ title }}
    </h3>

    <div v-if="pending" class="w-full h-20 flex items-center justify-center text-gray-400">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <div v-else>
      <div v-if="view === 'grid'" class="custom-grid">
        <NuxtLink 
          v-for="file in filteredFiles.slice(0, limit)" 
          :key="file.name"
          :to="getLink(file.name)"
          class="custom-card grid-card"
        >
          <div class="card-image-wrapper">
            <img v-if="getFirstImage(file)" :src="getFirstImage(file)" loading="lazy" />
            <div v-else class="placeholder"><i class="pi pi-image text-4xl opacity-20"></i></div>
          </div>
          <div class="card-content">
            <h4>{{ file.data?.title || file.name.replace('.md', '') }}</h4>
          </div>
        </NuxtLink>
      </div>

      <div v-else-if="view === 'list'" class="custom-list">
        <NuxtLink 
          v-for="file in filteredFiles.slice(0, limit)" 
          :key="file.name"
          :to="getLink(file.name)"
          class="custom-card list-card"
        >
          <div class="list-image-wrapper">
            <img v-if="getFirstImage(file)" :src="getFirstImage(file)" loading="lazy" />
            <div v-else class="placeholder"><i class="pi pi-image text-4xl opacity-20"></i></div>
          </div>
          
          <div class="list-content">
            <h4>{{ file.data?.title || file.name.replace('.md', '') }}</h4>
            
            <p v-if="file.data?.description" class="excerpt">
              {{ file.data.description }}
            </p>
            
            <span class="read-more">Ler mais →</span>
          </div>
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<style scoped>
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

/* === CARD GERAL === */
.custom-card {
  text-decoration: none;
  color: inherit;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #f0dcc7;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
}

.custom-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* === GRID VIEW === */
.custom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  margin-top: 20px;
}

.grid-card {
  flex-direction: column;
}

.grid-card .card-image-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #396896;
}

.grid-card .card-content {
  padding: 15px;
  color: #4a3728;
  font-size: 17px;
  font-weight: 600;
}

/* === LIST VIEW === */
.custom-list {
  display: flex;
  flex-direction: column;
  gap: 30px; /* Reduzi um pouco o gap */
  width: 100%;
  margin-top: 20px;
}

.list-card {
  flex-direction: row;
  height: 220px; /* Altura fixa um pouco menor */
}

.list-image-wrapper {
  width: 300px;
  flex-shrink: 0;
  background: #f1f5f9;
  overflow: hidden;
  position: relative;
}

.list-content {
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.list-content h4 {
  margin: 0 0 10px 0;
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
}

.list-content .excerpt {
  margin: 0;
  color: #555;
  font-size: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more {
  margin-top: auto;
  color: #d1b253;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-top: 15px;
}

/* IMAGENS E PLACEHOLDERS */
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.custom-card:hover img {
  transform: scale(1.05); /* Efeito de zoom suave na imagem */
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  background: #f8fafc;
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
  .list-card {
    flex-direction: column;
    height: auto;
  }
  .list-image-wrapper {
    width: 100%;
    height: 200px;
  }
  .list-content {
    padding: 20px;
  }
}
</style>