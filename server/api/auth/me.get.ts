import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) return { authenticated: false }

  try {
    const config = useRuntimeConfig()
    const secret = new TextEncoder().encode(config.jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    
    return { authenticated: true, user: payload }
  } catch (e) {
    return { authenticated: false }
  }
})