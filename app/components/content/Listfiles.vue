<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  section: { type: String, required: true },
  icon: { type: String, default: 'pi pi-images' },
  view: { type: String, default: 'grid' } 
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
  return file.data?.images?.[0] || null;
};
</script>

<template>
  <div class="list-container">
    <h3 v-if="title" class="list-title">
      <i :class="icon"></i> {{ title }}
    </h3>

    <div v-if="view === 'grid'" class="custom-grid">
      <NuxtLink 
        v-for="file in filteredFiles" 
        :key="file.name"
        :to="getLink(file.name)"
        class="custom-card"
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
  </div>
</template>

<style scoped>
/* CSS Puro para garantir o funcionamento caso o Tailwind falhe */
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

.custom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  margin-top: 20px;
}

.custom-card {
  text-decoration: none;
  color: inherit;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: rgb(207, 176, 176);
  transition: transform 0.2s;
}

.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-image-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #f1f5f9;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 15px;
}

.card-content h4 {
  margin: 0;
  font-weight: bold;
}
</style>