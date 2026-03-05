#!/bin/bash

# ==============================================================================
# CONFIGURAÇÕES DO SERVIDOR (Ajuste com seu IP ou domínio real)
# ==============================================================================
SERVER_USER="maga"
SERVER_HOST="siriusstudio.site" # ou coloque o IP da VPS
REMOTE_APPS_DIR="/home/maga/dev/apps"

# ==============================================================================
# CONFIGURAÇÕES LOCAIS
# ==============================================================================
LOCAL_SITES_DIR="./sites"
LOCAL_STORAGE_DIR="./storage"

echo "======================================================"
echo " 🌟 SIRIUS STUDIO - INICIAR WORKSPACE LOCAL"
echo "======================================================"

echo -n "Qual o nome do site recém-criado no servidor? "
read SITE_NAME

if [ -z "$SITE_NAME" ]; then
    echo "❌ Nome inválido. Saindo..."
    exit 1
fi

# 1. Cria as pastas locais base
mkdir -p "$LOCAL_SITES_DIR"
mkdir -p "$LOCAL_STORAGE_DIR"

# 2. Clone do Repositório
echo -e "\n📦 [1/6] Clonando o repositório do servidor..."
if [ -d "${LOCAL_SITES_DIR}/${SITE_NAME}" ]; then
    echo "⚠️ A pasta local do site já existe. Pulando clone..."
else
    git clone "${SERVER_USER}@${SERVER_HOST}:${REMOTE_APPS_DIR}/repos/${SITE_NAME}.git" "${LOCAL_SITES_DIR}/${SITE_NAME}"
fi

# 3. Sincronização do Storage com Rsync
echo -e "\n🗄️  [2/6] Baixando a pasta Storage (Rsync)..."
mkdir -p "${LOCAL_STORAGE_DIR}/${SITE_NAME}"
rsync -avzh --progress "${SERVER_USER}@${SERVER_HOST}:${REMOTE_APPS_DIR}/storage/${SITE_NAME}/" "${LOCAL_STORAGE_DIR}/${SITE_NAME}/"

# 4. Executar o script de Links Simbólicos
echo -e "\n🔗 [3/6] Executando linka.sh..."
if [ -f "./linka.sh" ]; then
    ./linka.sh "$SITE_NAME"
else
    echo "⚠️ O arquivo ./linka.sh não foi encontrado no diretório atual!"
fi

# 5. Criar arquivo .env local
echo -e "\n📝 [4/6] Gerando arquivo .env local..."
ENV_FILE="${LOCAL_SITES_DIR}/${SITE_NAME}/.env"

cat <<EOF > "$ENV_FILE"
NUXT_JWT_SECRET="uma_chave_muito_longa_e_aleatoria_123456"
NUXT_STORAGE_PATH="/Users/marceloamagalhaes/desenv/apps"
NUXT_SITE_URL="http://site.localhost:3001"
NUXT_SITE_ID="$SITE_NAME"
NUXT_SIRIUS_URL="http://siriusstudio.localhost:3000"
NUXT_UPLOAD_PATH="public/images"
EOF
echo "✅ Arquivo .env criado com sucesso!"

# 6. Atualizar a URL no _config.json local
echo -e "\n🔧 [5/6] Ajustando a URL no _config.json local..."
CONFIG_FILE="${LOCAL_STORAGE_DIR}/${SITE_NAME}/_config.json"

if [ -f "$CONFIG_FILE" ]; then
    # Usamos o próprio Node para ler o JSON, alterar a URL e salvar de volta de forma segura
    node -e "
        const fs = require('fs');
        const file = '$CONFIG_FILE';
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        data.url = 'http://site.localhost:3001';
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    "
    echo "✅ URL atualizada para http://site.localhost:3001 no _config.json!"
else
    echo "⚠️ Aviso: Arquivo $CONFIG_FILE não encontrado. O painel pode não carregar o preview corretamente."
fi

# 7. Instalar dependências locais
echo -e "\n⚙️  [6/6] Instalando dependências (pnpm install)..."
cd "${LOCAL_SITES_DIR}/${SITE_NAME}" || exit
pnpm install

# 8. Finalização e Lembrete
echo -e "\n======================================================"
echo "🎉 Tudo pronto! O ambiente local para '$SITE_NAME' está 100% montado."
echo -e "======================================================\n"

echo "🔔 LEMBRETE IMPORTANTE:"
echo "Certifique-se de configurar seu host local para que o domínio de desenvolvimento funcione:"
echo "👉 Adicione no arquivo /etc/hosts (ou equivalente no seu sistema):"
echo -e "\033[1m127.0.0.1    site.localhost\033[0m"
echo "👉 E lembre-se de apontar também o siriusstudio.localhost, se ainda não o fez."

echo -e "\n🚀 Para testar o site localmente, rode:"
echo "cd ${LOCAL_SITES_DIR}/${SITE_NAME} && pnpm run dev"