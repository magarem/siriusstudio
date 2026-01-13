#!/bin/bash

# --- CONFIGURAÇÕES ---
ORIGEM="/Users/marceloamagalhaes/desenv/apps/storage/"
# Nota: A barra no final da ORIGEM é importante para copiar o CONTEÚDO, não a pasta em si.

DESTINO_USER="maga"
DESTINO_IP="93.127.212.29"
DESTINO_PATH="/home/maga/dev/apps/storage"

# --- CORES PARA O TERMINAL ---
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}==> Iniciando sincronização do STORAGE...${NC}"
echo "De: $ORIGEM"
echo "Para: $DESTINO_USER@$DESTINO_IP:$DESTINO_PATH"
echo "------------------------------------------------"

# --- COMANDO RSYNC ---
# -a: Archive mode (mantém permissões, datas, etc)
# -v: Verbose (mostra o que está acontecendo)
# -z: Compress (comprime dados durante a transferência)
# --progress: Mostra barra de progresso
# --exclude: Ignora arquivos de sistema do Mac

rsync -avz --progress \
  --exclude '.DS_Store' \
  --exclude '._*' \
  "$ORIGEM" "$DESTINO_USER@$DESTINO_IP:$DESTINO_PATH"

echo "------------------------------------------------"
echo -e "${GREEN}==> Sincronização concluída com sucesso!${NC}"