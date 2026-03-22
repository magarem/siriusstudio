#!/bin/bash

# --- CONFIGURAÇÕES ---
# Coloque aqui o IP real do seu servidor
SERVER_IP="93.127.212.29"
# Coloque o usuário do servidor
SERVER_USER="maga"
# Caminho onde está o script no servidor
SERVER_PATH="/home/maga/dev/apps"

echo "---------------------------------------------"
echo "🚀 Iniciando Deploy do Sirius CMS"
echo "---------------------------------------------"

# 1. Build e Push (No Mac)
echo "📦 1. Compilando e enviando imagem para Docker Hub..."
docker buildx build --platform linux/amd64 -t magaweb/sirius-cms:latest --push .

# Verifica se o build deu certo antes de continuar
if [ $? -ne 0 ]; then
    echo "❌ Erro no Build. Abortando deploy."
    exit 1
fi

echo "✅ Imagem enviada com sucesso!"

# 2. Trigger Remoto (No Linux via SSH)
echo "📡 2. Conectando ao servidor para atualizar..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && ./atualizar_sirius.sh"

echo "---------------------------------------------"
echo "🎉 DEPLOY CONCLUÍDO! O Sirius está atualizado."
echo "---------------------------------------------"