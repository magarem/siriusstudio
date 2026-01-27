// composables/useFolderContent.js
export const useFolderContent = (props) => {
  const config = useRuntimeConfig();
  const route = useRoute();
  const { isEnabled } = usePreview();

  // --- 1. COMPUTEDS (Para manter a reatividade viva) ---
  const isDiskMode = computed(
    () => isEnabled.value === true || config.public.liveContent === true
  );

  // Calcula a seção alvo dinamicamente.
  // Como é computed, se a prop mudar ou a rota mudar, isso atualiza.
  const targetSection = computed(() => {
    if (props.section) return props.section;
    const currentPath = route.path === "/" ? "" : route.path;
    return `content${currentPath}`;
  });

  // --- 2. CONTROLE DE CACHE (Timestamp) ---
  const timestamp = ref(Date.now());

  // Parâmetros da Query.
  // O Nuxt assiste esse objeto. Se qualquer valor aqui mudar, ele refaz o fetch.
  const queryParams = computed(() => ({
    site: config.public.siteName,
    section: targetSection.value, // <--- O segredo está aqui
    mode: isDiskMode.value ? "preview" : "production",
    t: timestamp.value,           // <--- E aqui (para force refresh)
    nocache: 1,
  }));

  // --- 3. FETCH BLINDADO ---
  const {
    data: items,
    status,
    refresh,
    error
  } = useFetch("/api/admin/superList", {
    // A chave única garante que '/atrativos' e '/eventos' sejam tratados como dados diferentes
    key: computed(() => `list-${targetSection.value}-${timestamp.value}`),
    
    // Passamos o objeto reativo. O Nuxt 3 monitora mudanças nas Refs dentro do 'query'
    query: queryParams,
    
    // Garantia extra: assiste explicitamente a mudança de seção
    watch: [targetSection, isDiskMode],
    
    // Configurações padrão
    lazy: true,
    server: false,
    transform: (res) => (Array.isArray(res) ? res : []),
    default: () => [],
  });

  const loading = computed(() => status.value === "pending");

  const forceRefresh = () => {
    timestamp.value = Date.now(); // Muda o timestamp -> Muda a Query -> Dispara useFetch
    refresh();
  };

  // --- 4. LÓGICA DE AGRUPAMENTO (Pura matemática, sem risco de cache) ---
  const displayedItems = computed(() => {
    const rawItems = items.value || [];

    if (!props.subfolders) {
      return rawItems.slice(0, props.limit);
    }

    const foldersMap = {};

    rawItems.forEach((item) => {
      let relativePath = item.path.replace(targetSection.value, "");
      if (relativePath.startsWith("/")) relativePath = relativePath.substring(1);
      const parts = relativePath.split("/");

      if (parts.length > 0) {
        const folderName = parts[0];
        if (!folderName || folderName.includes(".")) return;

        if (!foldersMap[folderName]) {
          foldersMap[folderName] = {
            title: folderName.charAt(0).toUpperCase() + folderName.slice(1).replace(/-/g, " "),
            path: `${targetSection.value}/${folderName}`.replace("//", "/"),
            image: item.image,
            isFolder: true,
            count: 1,
          };
        } else {
          foldersMap[folderName].count++;
        }
      }
    });

    return Object.values(foldersMap).slice(0, props.limit);
  });

  return {
    targetSection,
    displayedItems,
    loading,
    forceRefresh,
    error
  };
};