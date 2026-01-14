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

// 1. INTEGRAÇÃO COM O PREVIEW (Cookie)
// O composable usePreview detecta se o cookie está ativo.
const { isEnabled } = usePreview();

// Define se vamos ler do disco (Tempo Real) ou do Banco (Cache/Build)
const isDiskMode = computed(() => 
  isEnabled.value === true || config.public.liveContent === true
);

/**
 * NORMALIZADOR DE DADOS
 * Padroniza a saída para que o template não quebre, independente da fonte.
 */
const normalizeItem = (item, source) => {
  if (source === 'disk') {
    // --- MODO DISCO (API RAW) ---
    const cleanPath = props.section.replace(/^content\/?/, '');
    const cleanFile = item.name.replace(/\.[^/.]+$/, "");
    
    // Gera URL e remove "/index" do final se existir
    const finalPath = `/${cleanPath}/${cleanFile}`
      .replace(/\/+/g, '/')
      .replace(/\/index$/, ''); 

    return {
      title: item.data?.title || item.name.replace('.md', ''),
      description: item.data?.description,
      // Tenta pegar imagem de capa ou topimages
      image: item.data?.images?.[0] || item.data?.topimages?.[0] || null,
      path: finalPath,
      key: item.name
    };
  } else {
    // --- MODO COLLECTION (NUXT CONTENT V3) ---
    const img = item.images?.[0] || item.meta?.images?.[0] || item.topimages?.[0] || item.meta?.topimages?.[0] || null;
    
    return {
      title: item.title,
      description: item.description,
      image: img,
      path: item.path,
      key: item.id || item.path
    };
  }
};

/**
 * DATA FETCHING HÍBRIDO
 */
const { data: items, status } = await useAsyncData(
  `list-${props.section}-${isDiskMode.value ? 'live' : 'prod'}`, 
  async () => {
    
    // ---------------------------------------------------------
    // A. MODO DISCO (Live/Preview)
    // Lê arquivos direto da pasta física via API
    // ---------------------------------------------------------
    if (isDiskMode.value) {
      try {
        const rawFiles = await $fetch('/api/admin/storage', {
          query: { site: siteName, folder: props.section }
        });

        if (!Array.isArray(rawFiles)) return [];

        return rawFiles
          .filter(f => 
            !f.isDirectory && 
            f.name !== 'index.md' &&   // Ignora o index da própria pasta
            !f.name.startsWith('_') && // Ignora arquivos meta (_order.yml, _schema.json)
            !f.name.startsWith('.')    // Ignora arquivos de sistema (.DS_Store)
          )
          .map(f => normalizeItem(f, 'disk'))
          .slice(0, props.limit);

      } catch (e) {
        console.error('Listfiles Disk Error:', e);
        return [];
      }
    }

    // ---------------------------------------------------------
    // B. MODO PRODUÇÃO (Collection V3)
    // Lê do banco de dados otimizado (SQLite/JSON)
    // ---------------------------------------------------------
    else {
      // Normaliza o caminho de busca: "content/eventos" -> "/eventos"
      let targetPath = props.section.replace(/^content\/?/, '');
      if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
      if (targetPath.endsWith('/')) targetPath = targetPath.slice(0, -1);

      const contentFiles = await queryCollection('content')
        .where('path', 'LIKE', `${targetPath}/%`) // Pega tudo dentro da pasta
        .where('path', '<>', targetPath) // Exclui o próprio index da pasta
        .limit(props.limit)
        .all(); 

      // Filtro Manual Pós-Query:
      // Garante que arquivos começando com "_" (meta) não apareçam
      return contentFiles
        .filter(f => {
          const segments = f.path.split('/');
          const slug = segments[segments.length - 1];
          return !slug.startsWith('_') && slug !== 'index';
        })
        .map(f => normalizeItem(f, 'collection'));
    }
  },
  {
    watch: [() => props.section, isDiskMode]
  }
);

const pending = computed(() => status.value === 'pending');
</script>

<template>
  <div class="list-container">
    <h3 v-if="title" class="list-title">
      <i :class="icon"></i> {{ title }}
    </h3>

    <div v-if="pending" class="w-full h-20 flex items-center justify-center text-gray-400">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <div v-else-if="!items || items.length === 0" class="w-full py-8 text-center text-gray-500">
      Nenhum item encontrado.
    </div>

    <div v-else>
      
      <div v-if="view === 'grid'" class="custom-grid">
        <NuxtLink 
          v-for="item in items" 
          :key="item.key"
          :to="item.path"
          class="custom-card grid-card"
        >
          <div class="card-image-wrapper">
            <img v-if="item.image" :src="item.image" loading="lazy" :alt="item.title" />
            <div v-else class="placeholder"><i class="pi pi-image text-4xl opacity-20"></i></div>
          </div>
          <div class="card-content">
            <h4>{{ item.title }}</h4>
          </div>
        </NuxtLink>
      </div>

      <div v-else-if="view === 'list'" class="custom-list">
        <NuxtLink 
          v-for="item in items" 
          :key="item.key"
          :to="item.path"
          class="custom-card list-card"
        >
          <div class="list-image-wrapper">
            <img v-if="item.image" :src="item.image" loading="lazy" :alt="item.title" />
            <div v-else class="placeholder"><i class="pi pi-image text-4xl opacity-20"></i></div>
          </div>
          
          <div class="list-content">
            <h4>{{ item.title }}</h4>
            <p v-if="item.description" class="excerpt">
              {{ item.description }}
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
  gap: 30px;
  width: 100%;
  margin-top: 20px;
}

.list-card {
  flex-direction: row;
  height: 220px;
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
  transform: scale(1.05);
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