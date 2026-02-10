// server/api/content/[...slug].get.ts
// Não precisamos importar fs, path ou parse aqui, pois vamos apenas chamar outra API.

export default defineEventHandler(async (event) => {
  // 1. Extrai o slug da URL
  const slug = event.context.params?.slug;
  
  // 2. Extrai os parâmetros da Query (ex: ?preview=true)
  const query = getQuery(event);
  const isPreview = query.preview === 'true';

  // 3. Define qual API interna chamar
  // Correção: path.resolve é para arquivos no disco. Para APIs, usamos strings normais.
  // Ajuste os nomes 'preview' e 'page' conforme as rotas que você criou em server/api/
  const apiFolder = isPreview ? 'preview' : 'page'; 
  const targetUrl = `/api/${apiFolder}/${slug}`;

  try {
    // 4. Executa a API interna
    // Correção: Usamos a variável 'query' que pegamos no passo 2, pois 'route' não existe no server.
    // O $fetch já retorna o objeto JSON parseado automaticamente.
    const data = await $fetch(targetUrl, {
        query: query 
    });

    return data;

  } catch (e) {
    // Lógica de Fallback (Opcional): Se falhar no preview, tenta a produção
    if (isPreview) {
        try {
            return await $fetch(`/api/page/${slug}`);
        } catch (err) {
            // Se falhar nos dois, erro 404 real
        }
    }

    throw createError({ 
      statusCode: e.statusCode || 500, 
      message: `Erro ao buscar em ${targetUrl}: ${e.message}` 
    });
  }
});