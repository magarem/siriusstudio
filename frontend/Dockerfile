# --- Build ---
# Usamos a imagem oficial do Bun, que é extremamente leve
FROM oven/bun:1-slim AS builder

WORKDIR /app

# Copia os arquivos de dependência
# Dica: Se você ainda usa pnpm, o ideal agora é gerar um bun.lockb rodando 'bun install' na sua máquina
COPY package.json bun.lockb* ./

# Instala as dependências usando o gerenciador nativo do Bun (muito mais rápido)
RUN bun install --frozen-lockfile

# Copia o restante do código
COPY . .

# Faz o build do Nuxt
RUN bun run build

# --- Produção ---
FROM oven/bun:1-slim

# Variáveis de ambiente para o Nuxt em produção
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

WORKDIR /app
COPY package.json bun.lockb* ./
# Ajusta as permissões de segurança
RUN chown -R 1001:1001 /app

# Copia apenas a pasta .output gerada pelo Nitro no estágio de build
COPY --from=builder --chown=1001:1001 /app/.output /app/.output

# Passa a rodar com o usuário não-root
USER 1001

EXPOSE 3000

# O pulo do gato: usamos o Bun para rodar o servidor compilado!
CMD ["bun", "run", ".output/server/index.mjs"]