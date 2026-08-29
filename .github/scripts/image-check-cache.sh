#!/usr/bin/env bash
set -euo pipefail

# Argumentos:
# $1: Referência da imagem (ex: ghcr.io/user/repo:sha-xxxx)

IMAGE_REF="${1:-}"

if [[ -z "$IMAGE_REF" ]]; then
  echo "Erro: Argumento obrigatório ausente (IMAGE_REF)" >&2
  exit 1
fi

echo "🔍 Verificando cache para: ${IMAGE_REF}"

if docker manifest inspect "$IMAGE_REF" > /dev/null 2>&1; then
  echo "exists=true" >> "$GITHUB_OUTPUT"
  echo "✅ Cache encontrado!"
else
  echo "exists=" >> "$GITHUB_OUTPUT"
  echo "❌ Cache não encontrado!"
fi
