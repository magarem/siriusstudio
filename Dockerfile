# --- Build (Permanece igual) ---
FROM node:22 AS builder
WORKDIR /app/siriusstudio
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Produção ---
FROM node:22-slim

ENV APPS_ROOT=/app
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 1. Define /app como diretório de trabalho principal
WORKDIR /app

# 2. Cria a estrutura e a "Rede de Segurança" (Symlinks)
# - Cria as pastas reais em /app
# - Cria um link da raiz /storage para /app/storage (Isso corrige o seu erro!)
# - Cria um link da raiz /sites para /app/sites (Prevenção)
RUN mkdir -p /app/storage /app/sites /app/siriusstudio \
    && ln -s /app/storage /storage \
    && ln -s /app/sites /sites \
    && chown -R 1001:1001 /app /storage /sites

# 3. Copia o código
COPY --from=builder --chown=1001:1001 /app/siriusstudio/.output /app/siriusstudio/.output

# 4. Define o usuário
USER 1001

EXPOSE 3000

# 5. Inicia o servidor
CMD ["node", "siriusstudio/.output/server/index.mjs"]