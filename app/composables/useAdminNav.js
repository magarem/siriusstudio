export const useAdminNav = (siteContext) => {
  const route = useRoute();
  const router = useRouter();
  
  // Estados
  const currentFile = ref(route.query.file || "");
  const currentFolder = ref(currentFile.value ? getFolderFromFile(currentFile.value) : route.query.folder || "content");
  
  // Computeds auxiliares
  const editorCtxFolder = computed(() => currentFile.value ? getFolderFromFile(currentFile.value) : currentFolder.value);
  const currentFileNameOnly = computed(() => currentFile.value ? currentFile.value.split("/").pop() : "");
  const fileExtension = computed(() => currentFile.value ? currentFile.value.split(".").pop().toLowerCase() : "md");

  // Helpers internos
  function getFolderFromFile(path) {
    if (!path) return "content";
    const lastSlash = path.lastIndexOf("/");
    return lastSlash !== -1 ? path.substring(0, lastSlash) : "content";
  }

  // Ações
  const navigate = {
    selectFile: (path) => {
        // Lógica de montar path e pushState
        const full = path.includes("/") ? path : `${currentFolder.value}/${path}`;
        currentFile.value = full;
        window.history.pushState({}, "", `?file=${full}`);
    },
    enterFolder: (f) => currentFolder.value = `${currentFolder.value}/${f}`,
    goBack: () => { /* lógica do pop */ },
    toDashboard: () => {
       currentFile.value = "";
       // router.push... ou limpar state
    }
  };

  return {
    currentFile,
    currentFolder,
    editorCtxFolder,
    currentFileNameOnly,
    fileExtension,
    navigate
  };
};