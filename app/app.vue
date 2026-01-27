<template>
  <div>
    <ConfirmDialog />
    <Toast />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import "primeicons/primeicons.css";
// Teste rápido para ver se o PrimeVue está vivo
// const toast = useToast()
// Adicione isso no seu script setup
useHead({
  htmlAttrs: {
    // Isso aplica a classe 'dark' na tag <html>
    class: "dark",
  },
});
onMounted(() => {
  console.log("SiriusStudio iniciado com sucesso!");
});
</script>
<style>
/* --- BLOCO CSS DEFINITIVO: DARK MODE WINDOWS --- */

/* 1. Variáveis do PrimeVue (Força texto Branco Puro) */
:root.dark {
    --p-text-color: #ffffff !important; 
    --p-text-muted-color: #e4e4e7 !important;
    --p-form-field-placeholder-color: #a1a1aa !important;
    --p-content-background: #18181b !important; /* Garante fundo base escuro */
}

/* 2. Configurações do Corpo (Melhora nitidez da fonte) */
body {
    background-color: #111827; /* Fundo de segurança */
    color: #ffffff !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* 3. Correção dos Inputs/Selects (Fundo Sólido + Texto Branco + Borda) */
.dark .p-select,
.dark .p-dropdown,
.dark .p-inputtext,
.dark .p-textarea,
.dark .p-multiselect {
    background-color: #18181b !important; /* Fundo Zinco Escuro (Não Transparente) */
    border-color: #3f3f46;
    color: #ffffff !important; /* Texto Branco Puro */
    font-weight: 500; /* Texto levemente mais grosso para leitura */
}

/* 4. Correção dos Painéis Flutuantes (O menu que abre) */
.dark .p-select-overlay,
.dark .p-dropdown-panel,
.dark .p-multiselect-panel {
    background-color: #18181b !important;
    border: 1px solid #3f3f46;
}

/* 5. Correção dos Itens da Lista */
.dark .p-select-option,
.dark .p-dropdown-item {
    color: #ffffff !important;
}

/* 6. Correção do Hover (Passar o mouse na lista) */
.dark .p-select-option.p-focus,
.dark .p-dropdown-item.p-focus {
    background-color: #27272a !important;
    color: #ffffff !important;
}

/* 7. Correção para o ITEM SELECIONADO na lista */
.dark .p-select-option.p-select-option-selected, /* PrimeVue v4 (Select) */
.dark .p-dropdown-item.p-highlight,              /* PrimeVue v3 (Dropdown) */
.dark .p-multiselect-item.p-highlight {
    /* Cor de fundo do item ativo (Geralmente um cinza mais claro ou a cor primária) */
    background-color: #3f3f46 !important; /* Zinc-700 */
    
    /* Cor do texto */
    color: #ffffff !important;
    
    /* Opcional: deixar negrito para destacar */
    font-weight: 700;
}

/* Opcional: Se quiser tirar o foco azul padrão que às vezes fica em volta */
.dark .p-select-option:focus-visible,
.dark .p-dropdown-item:focus-visible {
    box-shadow: inset 0 0 0 2px #52525b; /* Borda interna discreta */
    outline: none;
}

/* 8. Correção do TEXTO SELECIONADO (Dentro da caixa fechada) */
.dark .p-select-label,      /* PrimeVue v4 */
.dark .p-dropdown-label,    /* PrimeVue v3/Híbrido */
.dark .p-inputtext {        /* Garantia geral */
    color: #ffffff !important;
    opacity: 1 !important; /* Remove qualquer transparência que deixe "apagado" */
    -webkit-text-fill-color: #ffffff !important; /* Força bruta para navegadores baseados em Chrome */
}

/* Opcional: Se o ícone da setinha (chevron) também estiver apagado */
.dark .p-select-dropdown,
.dark .p-dropdown-trigger {
    color: rgba(255, 255, 255, 0.7) !important; /* Branco levemente suave para o ícone */
}
</style>
