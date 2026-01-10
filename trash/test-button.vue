<!-- siriusstudio/app/pages/test-button.vue -->
<template>
  <div style="padding: 20px; border: 2px solid red;">
    <h1>Teste Button</h1>
    <p>Se você vê este texto, o componente carregou</p>
    
    <!-- Botão HTML nativo pra comparar -->
    <button @click="handleClick" style="padding: 10px; margin: 10px;">
      Botão HTML Normal
    </button>
    
    <!-- Botão PrimeVue -->
    <Button 
      icon="pi pi-check" 
      label="Teste PrimeVue" 
      @click="handleClick" 
    />

     <Button 
      icon="pi pi-pencil" 
      label="Editar" 
      class="p-button-text" 
      @click="goToEdit(slotProps.data.name)" 
    />
  </div>
</template>

<script setup>
const handleClick = () => {
  console.log('Clicou!');
  alert('Clicou!');
};

// Debug
console.log('Componente test-button carregou');
</script>