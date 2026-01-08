// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const authUser = useState('auth_user')

  // Se já temos o usuário, não faz nada
  if (authUser.value) return

  // O PULO DO GATO: Se estivermos no servidor, precisamos garantir o URL completo
  // ou usar o event context. Mas o $fetch do Nuxt costuma resolver.
  try {
    const data = await $fetch('/api/auth/me', {
      headers: useRequestHeaders(['cookie']) // GARANTE que o cookie seja repassado no SSR
    })

    if (data?.authenticated) {
      authUser.value = data.user
      return
    }
  } catch (err) {
    console.error('Erro no fetch do middleware:', err)
  }

  // Se chegou aqui, não autenticou. 
  // Mas atenção: Só redireciona se não estivermos já na página de login
  if (to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
})