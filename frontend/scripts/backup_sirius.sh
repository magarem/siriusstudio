#!/bin/bash

# --- CONFIGURAÇÕES ---
USER="maga"
SERVER_IP="siriusstudio.site"
REMOTE_PATH="/home/maga/dev/apps/storage/"
LOCAL_PATH="$HOME/Backups/SiriusStudio/storage/"

# Cria a pasta local se não existir
mkdir -p "$LOCAL_PATH"

echo "--- Iniciando Backup do Sirius Studio (Bun Edition) ---"
date

# --- O COMANDO MÁGICO ---
# -a: archive (preserva permissões e datas)
# -v: verbose (mostra o que está fazendo)
# -z: compress (comprime os dados na rede para ser mais rápido)
# -u: update (pula arquivos que já são mais novos no destino)
# --delete: opcional (apaga no Mac o que você apagou no servidor)
# -e ssh: usa o túnel seguro do SSH

rsync -avzu --exclude '*/data/' -e ssh $USER@$SERVER_IP:$REMOTE_PATH $LOCAL_PATH

echo "--- Backup concluído com sucesso! ---"
date