<script setup>
// Content v3 usa queryCollection em vez de queryContent
const { data: templos } = await useAsyncData('templos', () => 
  queryCollection('templos')
    .order('title', 'ASC') // ordenar alfabeticamente
    .all()
)
</script>

<template>
  <div>
    <h1>Templos</h1>
    
    <div v-if="templos && templos.length">
      <article v-for="templo in templos" :key="templo._id">
        <NuxtLink :to="templo._path">
          <img v-if="templo.image" :src="templo.image" :alt="templo.title" />
          <h2>{{ templo.title }}</h2>
          <p v-if="templo.description">{{ templo.description }}</p>
          <span v-if="templo.localizacao">📍 {{ templo.localizacao }}</span>
        </NuxtLink>
      </article>
    </div>
    
    <p v-else>Nenhum templo encontrado.</p>
  </div>
</template>