#!/bin/bash

echo "🚀 Iniciando build com Bun..."
# 1. Gera a versão estática
bun run build

# 2. Limpa zip antigo local e cria o novo
echo "📦 Compactando arquivos..."
rm -f site.zip
zip -r site.zip .output/

# 3. Transfere para o servidor
echo "📤 Enviando para o servidor..."
scp site.zip maga@93.127.212.29:/home/maga/dev

# 4. Comandos Remotos: Extrair e atualizar a pasta do site
# Substitua '/var/www/indiasagrada' pelo caminho real onde o Nginx lê seu site
echo "🔧 Extraindo arquivos no servidor..."
ssh maga@93.127.212.29 "cd /home/maga/dev && unzip -o site.zip && mv indiasagrada 'indiasagrada_bkp$(date +%Y%m%d%H%M%S)' && mv .output indiasagrada"

echo "✅ Deploy realizado com sucesso!"