# --- Etapa 1: Build (Compilação) ---
# Usamos a imagem completa para ter Python/GCC (necessário para compilar o better-sqlite3)
FROM node:22 AS builder

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências (npm ci é mais seguro para builds)
RUN npm ci

# Copia o código do projeto
COPY . .

# Faz o build do Nuxt (Gera a pasta .output)
RUN npm run build

# --- Etapa 2: Produção (Execução) ---
# Usamos a versão SLIM para a imagem ficar leve no servidor
FROM node:22-slim

WORKDIR /app

# Variáveis de ambiente
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
# AQUI: Mudamos para a porta que seu Nginx espera
ENV NUXT_PORT=4003 

# --- A ÚNICA MUDANÇA NECESSÁRIA ---
# 1. Garante que a pasta interna de dados existe e é sua (1001)
RUN mkdir -p /app/server/data && chown -R 1001:1001 /app/server/data

# 2. Copia o código transferindo a posse para você (1001)
COPY --from=builder --chown=1001:1001 /app/.output ./.output

# 3. Troca para o seu usuário
USER 1001
# ----------------------------------

# Expõe a porta para o Docker saber que ela existe
EXPOSE 4003

# Comando para iniciar
CMD ["node", ".output/server/index.mjs"]