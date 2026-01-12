<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  section: { type: String, required: true },
  icon: { type: String, default: 'pi pi-images' },
  view: { type: String, default: 'grid' }, // Aceita 'grid' ou 'list'
  limit: { type: Number, default: 1000 } 
});

const config = useRuntimeConfig();
const siteName = config.public.siteName;

const { data: files, pending } = await useFetch('/api/admin/storage', {
  query: { site: siteName, folder: props.section },
  key: `list-${props.section}`
});

const filteredFiles = computed(() => {
  if (!files.value || !Array.isArray(files.value)) return [];
  return files.value.filter(f => !f.isDirectory && f.name !== 'index.md');
});

const getLink = (fileName) => {
  const cleanPath = props.section.replace(/^content\/?/, '');
  const cleanFile = fileName.replace(/\.[^/.]+$/, "");
  return `/${cleanPath}/${cleanFile}`.replace(/\/+/g, '/');
};

const getFirstImage = (file) => {
  return file.data?.images?.[0] || file.data?.topimages?.[0] || null;
};

// --- NOVO: Função para pegar o resumo (primeiro parágrafo) ---
const getExcerpt = (file) => {
  if (!file.body) return '';
  // Remove caracteres especiais de markdown (#, *, etc) para ficar texto limpo
  let text = file.body.replace(/[#*`_]/g, ''); 
  // Pega tudo até a primeira quebra de linha dupla (parágrafo) ou limita a 200 chars
  const paragraphs = text.split(/\n\s*\n/);
  const firstParagraph = paragraphs[0] || text;
  
  return firstParagraph.length > 250 
    ? firstParagraph.substring(0, 250) + '...' 
    : firstParagraph;
};
</script>

<template>
  <div class="list-container">
    <h3 v-if="title" class="list-title">
      <i :class="icon"></i> {{ title }}
    </h3>

    <div v-if="view === 'grid'" class="custom-grid ">
      <NuxtLink 
        v-for="file in filteredFiles.slice(0, limit)" 
        :key="file.name"
        :to="getLink(file.name)"
        class="custom-card grid-card"
      >
        <div class="card-image-wrapper">
          <img v-if="getFirstImage(file)" :src="getFirstImage(file)" />
          <div v-else class="placeholder">Sem Imagem</div>
        </div>
        <div class="card-content">
          <h4>{{ file.data?.title || file.name }}</h4>
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
          <img v-if="getFirstImage(file)" :src="getFirstImage(file)" />
          <div v-else class="placeholder">Sem Imagem</div>
        </div>
        
        <div class="list-content">
          <h4>{{ file.data?.title || file.name }}</h4>
           {{ file.data?.description }}
          <!-- <p class="excerpt">{{ getExcerpt(file) }}</p> -->
          <span class="read-more">Ler mais →</span>
        </div>
      </NuxtLink>
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

/* === ESTILOS GERAIS DO CARD === */
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

/* === MODO GRID === */
.custom-grid {
  display: grid; /* Corrigido de 'list' para 'grid' */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  margin-top: 20px;
  /* background-color: bisque; */
}

.grid-card {
  flex-direction: column; /* No grid a imagem fica em cima */
 
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
}

/* === MODO LIST (NOVO) === */
.custom-list {
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  margin-top: 20px;
}

.list-card {
  flex-direction: row; /* Horizontal: Imagem lado a lado com texto */
  height: 250px; /* Altura fixa para uniformidade */
  
}

.list-image-wrapper {
  width: 300px; /* Largura fixa da imagem lateral */
  flex-shrink: 0; /* Impede a imagem de encolher */
  background: #f1f5f9;
  overflow: hidden;
}

.list-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.list-content h4 {
  margin: 0 0 10px 0;
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
  -webkit-line-clamp: 3; /* Limita a 3 linhas */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more {
  margin-top: auto; /* Empurra para baixo */
  color: #d1b253;
  font-weight: 600;
  font-size: 0.9rem;
  padding-top: 10px;
}

/* Imagens comuns */
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* Responsividade para Lista no Celular */
@media (max-width: 768px) {
  .list-card {
    flex-direction: column; /* Vira vertical no celular */
    height: auto;
  }
  .list-image-wrapper {
    width: 100%;
    height: 200px;
  }
}
</style>