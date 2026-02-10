import { exec } from 'node:child_process'
import util from 'node:util'

const execPromise = util.promisify(exec)
let isBuildRunning = false // Trava simples em memória

export default defineEventHandler(async (event) => {
  if (isBuildRunning) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Um build já está em andamento. Aguarde alguns minutos.'
    })
  }

  isBuildRunning = true

  try {
    console.log('--- Iniciando Build de Publicação ---')

    // Executa o build. 
    // Se você usa PM2 para manter o site vivo, talvez precise de:
    // 'npm run build && pm2 restart all'
    const { stdout, stderr } = await execPromise('npm run build && pm2 restart india-sagrada')
    
    console.log('Build finalizado com sucesso:', stdout)

    if (stderr) console.warn('Avisos do build:', stderr)

    return { 
      success: true, 
      message: 'Site rebuildado com sucesso!' 
    }
  } catch (error: any) {
    console.error('Erro no build:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Erro durante o npm run build: ' + error.message
    })
  } finally {
    isBuildRunning = false
  }
})