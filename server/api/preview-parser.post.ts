// server/api/preview-parser.post.ts
import { parseMarkdown } from '@nuxtjs/mdc/runtime' // ou '#content/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // Recebe o texto cru do Sirius
  const rawContent = body.content || '';

  try {
    // Transforma em AST instantaneamente
    // Passamos um ID fake 'preview' pois não será salvo no banco
    const parsed = await parseMarkdown('preview', rawContent, {});
    
    return parsed; // Retorna { body: {...}, data: {...} }
  } catch (e) {
    throw createError({ statusCode: 500, message: 'Erro ao processar preview' });
  }
});