#!/usr/bin/env bash

# ==========================================================
# setup-site-links.sh
# Versão profissional com:
# - Cores
# - Dry-run
# - Auto-detecção de raiz do projeto
# - Execução segura
# ==========================================================

set -euo pipefail

# ==========================================================
# 🎨 CORES
# ==========================================================

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; exit 1; }

# ==========================================================
# 🧪 ARGUMENTOS
# ==========================================================

if [[ $# -lt 1 ]]; then
  error "Uso: ./setup-site-links.sh <site-name> [--dry-run]"
fi

SITE_NAME="$1"
DRY_RUN=false

if [[ "${2:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  warn "Executando em modo DRY-RUN (nenhuma alteração será feita)"
fi

[[ -z "$SITE_NAME" ]] && error "Nome do site não pode ser vazio."

# ==========================================================
# 🧠 DETECÇÃO DA RAIZ DO PROJETO
# ==========================================================

CURRENT_DIR="$(pwd)"

find_project_root() {
  local dir="$CURRENT_DIR"

  while [[ "$dir" != "/" ]]; do
    if [[ -d "$dir/apps/sites" && -d "$dir/apps/storage" ]]; then
      echo "$dir"
      return
    fi
    dir="$(dirname "$dir")"
  done

  error "Não foi possível localizar a raiz do projeto."
}

PROJECT_ROOT="$(find_project_root)"

info "Raiz do projeto detectada: $PROJECT_ROOT"

# ==========================================================
# 📁 DEFINIÇÃO DE PATHS
# ==========================================================

BASE_SITES_PATH="$PROJECT_ROOT/apps/sites"
BASE_STORAGE_PATH="$PROJECT_ROOT/apps/storage"
BASE_SHARED_SERVER_PATH="$PROJECT_ROOT/apps/siriusstudio"

SITE_PATH="$BASE_SITES_PATH/$SITE_NAME"
STORAGE_PATH="$BASE_STORAGE_PATH/$SITE_NAME"

# ==========================================================
# 🏗 GARANTIR DIRETÓRIOS BASE
# ==========================================================

run() {
  if $DRY_RUN; then
    echo -e "${YELLOW}[DRY-RUN]${NC} $1"
  else
    eval "$1"
  fi
}

info "Garantindo diretórios base..."

# run "mkdir -p \"$SITE_PATH\""
# run "mkdir -p \"$STORAGE_PATH\""

# ==========================================================
# 🧹 REMOÇÃO SEGURA
# ==========================================================

safe_remove() {
  local target="$1"

  if [[ -e "$target" || -L "$target" ]]; then
    case "$target" in
      "$SITE_PATH"/*)
        run "rm -rf \"$target\""
        ;;
      *)
        error "Tentativa de remoção fora do escopo: $target"
        ;;
    esac
  fi
}

info "Limpando diretórios antigos..."

safe_remove "$SITE_PATH/content"
safe_remove "$SITE_PATH/data"
safe_remove "$SITE_PATH/db"
safe_remove "$SITE_PATH/server"
safe_remove "$SITE_PATH/app/components/content"

# ==========================================================
# 🔗 CRIAÇÃO DOS LINKS
# ==========================================================

info "Criando links simbólicos..."

run "ln -sfn \"$STORAGE_PATH/content\" \"$SITE_PATH/content\""
run "ln -sfn \"$STORAGE_PATH/data\" \"$SITE_PATH/data\""
run "ln -sfn \"$STORAGE_PATH/db\" \"$SITE_PATH/db\""
run "ln -sfn \"$BASE_SHARED_SERVER_PATH/server\" \"$SITE_PATH/server\""
run "ln -sfn \"$BASE_SHARED_SERVER_PATH/app/components/content\" \"$SITE_PATH/app/components/content\""

success "Setup concluído para o site: $SITE_NAME"
