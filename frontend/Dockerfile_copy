# --- Build ---
FROM node:22 AS builder

# Ativa o Corepack para ter o pnpm sem precisar de um 'npm install -g'
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app/siriusstudio

# Copia os arquivos de dependência (incluindo o lock do pnpm se existir)
COPY package.json pnpm-lock.yaml* ./

# Instala as dependências usando o pnpm
# A flag --frozen-lockfile é o equivalente ao 'npm ci' (garante integridade)
# Se você ainda não tiver o lockfile, remova a flag --frozen-lockfile na primeira vez
RUN pnpm install --frozen-lockfile

# Copia o resto do código
COPY . .

# Faz o build via pnpm
RUN pnpm run build

# --- Produção ---
FROM node:22-slim

ENV APPS_ROOT=/app
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

WORKDIR /app

# Cria a estrutura e os Symlinks (Sua rede de segurança)
RUN mkdir -p /app/storage /app/sites /app/siriusstudio \
    && ln -s /app/storage /storage \
    && ln -s /app/sites /sites \
    && chown -R 1001:1001 /app /storage /sites

# Copia apenas o resultado do build (.output)
COPY --from=builder --chown=1001:1001 /app/siriusstudio/.output /app/siriusstudio/.output

USER 1001

EXPOSE 3000

# O servidor Nitro continua sendo iniciado pelo Node diretamente
CMD ["node", "siriusstudio/.output/server/index.mjs"]