import { readdirSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(() => {
  const dir = join(process.cwd(), 'public/images/slide')

  return readdirSync(dir).filter(file =>
    /\.(png|jpg|jpeg|webp)$/i.test(file)
  )
})
