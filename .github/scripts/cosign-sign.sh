#!/usr/bin/env bash
set -euo pipefail

# Argumentos:
# $1: Referência da imagem com digest (ex: image@digest)

IMAGE_REF="${1:-}"

if [[ -z "$IMAGE_REF" ]]; then
  echo "Erro: Argumento obrigatório ausente (IMAGE_REF)" >&2
  exit 1
fi

echo "Assinando imagem: ${IMAGE_REF}"
cosign sign --yes "${IMAGE_REF}"
