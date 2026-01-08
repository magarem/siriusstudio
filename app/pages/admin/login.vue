<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="title">India Sagrada</h1>
      <p class="subtitle">Administração</p>

      <div v-if="error" class="error">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>Usuário</label>
          <input
            v-model="username"
            type="text"
            required
            placeholder="Digite seu usuário"
          />
        </div>

        <div class="field">
          <label>Senha</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Digite sua senha"
          />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const { error: fetchError } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    if (fetchError.value) {
      throw fetchError.value
    }

    await navigateTo('/admin')
  } catch (e: any) {
    error.value =
      e?.data?.message ||
      'Usuário ou senha inválidos'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  font-family: system-ui, -apple-system, BlinkMacSystemFont;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #020617;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  color: #e5e7eb;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.subtitle {
  font-size: 14px;
  text-align: center;
  color: #94a3b8;
  margin-bottom: 24px;
}

.error {
  background: #7f1d1d;
  color: #fecaca;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

label {
  font-size: 13px;
  margin-bottom: 6px;
  color: #cbd5f5;
}

input {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #1e293b;
  background: #020617;
  color: #e5e7eb;
}

input:focus {
  outline: none;
  border-color: #6366f1;
}

button {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: #6366f1;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
