import { getCookie } from 'h3'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Não autenticado'
    })
  }

  return { ok: token }
})
