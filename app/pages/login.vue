<template>
  <div class="flex items-center justify-center min-h-screen bg-slate-900 font-sans">
    <div class="p-8 bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
      <h1 class="text-3xl font-bold text-white mb-6 text-center">Sirius Studio</h1>
      
      <div class="space-y-4">
        <div>
          <label class="block text-slate-400 text-sm mb-1">Domínio do Site</label>
          <input v-model="form.domain" type="text" placeholder="ex: novagokula" class="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-blue-500 outline-none" />
        </div>
        
        <div>
          <label class="block text-slate-400 text-sm mb-1">Usuário</label>
          <input v-model="form.username" type="text" class="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-blue-500 outline-none" />
        </div>

        <div>
          <label class="block text-slate-400 text-sm mb-1">Senha</label>
          <input v-model="form.password" type="password" class="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-blue-500 outline-none" />
        </div>

        <button @click="handleLogin" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors mt-4">
          Acessar Painel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: ''})
// Definimos o estado inicial
const form = ref({ domain: 'novagokula', username: 'admin', password: '123456' })

const handleLogin = async () => {
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value // Envia domain, username e password
    })
    
    // Se o login for bem sucedido, o servidor deve devolver um cookie 'active_site'
    if (res.success) {
      window.location.href = '/edit' // Vai para o seu File Explorer em pages/index.vue
    }
  } catch (err) {
    alert(err.data?.message || 'Erro ao fazer login')
  }
}
</script>