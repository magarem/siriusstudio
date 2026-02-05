<template>
  <div class="flex items-center justify-center min-h-screen bg-[#0f1110] font-sans relative overflow-hidden">
    
    <div class="absolute w-[500px] h-[500px] bg-[#6f942e] opacity-[0.03] blur-[100px] rounded-full -top-40 -right-20"></div>

    <div class="p-10 bg-[#1a1d1c] rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/5 relative z-10">
      
      <div class="text-center mb-10">
        <div class="inline-block px-4 py-1 bg-[#6f942e]/10 rounded-full mb-3">
          <span class="text-[10px] font-black text-[#6f942e] uppercase tracking-[0.4em]">Core Engine</span>
        </div>
        <h1 class="text-4xl font-black text-white tracking-tighter uppercase italic">
          Sirius <span class="text-[#6f942e]">Studio</span>
        </h1>
      </div>
      
      <div class="space-y-6">
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Domínio do Site</label>
          <div class="relative">
            <i class="pi pi-globe absolute left-4 top-1/2 -translate-y-1/2 text-[#6f942e] text-sm"></i>
            <input v-model="form.domain" type="text" placeholder="Nome do domínio" 
              class="custom-input" />
          </div>
        </div>
        
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário</label>
          <div class="relative">
            <i class="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-[#6f942e] text-sm"></i>
            <input v-model="form.username" type="text" 
              class="custom-input" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
          <div class="relative">
            <i class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#6f942e] text-sm"></i>
            <input v-model="form.password" type="password" 
              class="custom-input" />
          </div>
        </div>

        <button @click="handleLogin" 
          class="w-full bg-[#6f942e] hover:bg-[#82ad36] text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-lg shadow-[#6f942e]/10 uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-2">
          <span>Acessar Painel</span>
          <i class="pi pi-arrow-right text-xs"></i>
        </button>
      </div>

      <p class="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-10">
        &copy; 2026 Sirius Studio Core - Magaweb
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: ''})

const form = ref({ 
  domain: '', 
  username: '', 
  password: '' 
})

const handleLogin = async () => {
  try {
    if (!form.value.domain || !form.value.username || !form.value.password) {
      alert('Por favor, preencha todos os campos.')
      return
    } 
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value
    })
    
    if (res.success) {
      window.location.href = '/editor'
    }
  } catch (err) {
    alert('Erro de identificação. Verifique suas credenciais.')
  }
}
</script>

<style scoped>
.custom-input {
  width: 100%;
  padding: 1.2rem 1.2rem 1.2rem 3.2rem;
  border-radius: 1rem;
  background: #0a0c0b;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-weight: 700;
  outline: none;
  transition: all 0.3s ease;
}

.custom-input:focus {
  border-color: #6f942e;
  background: #0f1110;
  box-shadow: 0 0 20px rgba(111, 148, 46, 0.1);
}

.custom-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
  font-weight: 400;
}
</style>