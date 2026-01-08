<template>
  <div>
    <Toast />
    <ConfirmDialog />
    
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import 'primeicons/primeicons.css'
// Teste rápido para ver se o PrimeVue está vivo
const toast = useToast()

onMounted(() => {
  console.log('SiriusStudio iniciado com sucesso!')
})
</script>