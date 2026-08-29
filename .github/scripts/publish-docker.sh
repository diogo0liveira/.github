#!/usr/bin/env bash
set -euo pipefail

# Argumentos:
# $1: Tag de release (ex: needs.release.outputs.tag_name)
# $2: Repositório GitHub (ex: github.repository)
# $3: SHA do commit (ex: github.sha)
# $4: Nome da imagem destino (ex: steps.image.outputs.name)

TAG_NAME="${1:-}"
GITHUB_REPO="${2:-}"
GITHUB_SHA="${3:-}"
DEST_IMAGE_NAME="${4:-}"

if [[ -z "$TAG_NAME" || -z "$GITHUB_REPO" || -z "$GITHUB_SHA" || -z "$DEST_IMAGE_NAME" ]]; then
  echo "Erro: Argumentos obrigatórios ausentes (TAG_NAME ou GITHUB_REPO ou GITHUB_SHA ou DEST_IMAGE_NAME)" >&2
  exit 1
fi

# Pega a versão limpa (sem o 'v')
VERSION=${TAG_NAME#v}

SRC="ghcr.io/${GITHUB_REPO}:sha-${GITHUB_SHA}"
DEST="${DEST_IMAGE_NAME}:${VERSION}"

echo "🚀 Promovendo imagem (Registry-side Copy):"
echo "   Origem:  $SRC"
echo "   Destino: $DEST"

# Cria a nova tag no destino sem baixar as camadas (apenas manifesto)
docker buildx imagetools create -t "$DEST" "$SRC"

# Captura o digest imutável da imagem recém-criada/referenciada no destino
DIGEST=$(docker buildx imagetools inspect "$DEST" --format "{{json .}}" | jq -r '.container_config.Config.Image // .config.digest // .manifest.digest' | cut -d'@' -f2)

# Se o jq falhar em pegar o digest pelo formato acima (depende da versão do buildX/registro),
# usamos uma abordagem fallback mais simples para extrair o SHA:
if [[ -z "$DIGEST" || "$DIGEST" == "null" ]]; then
    DIGEST=$(docker buildx imagetools inspect "$DEST" | grep -m1 "Digest:" | awk '{print $2}')
fi

echo "digest=${DIGEST}" >> "$GITHUB_OUTPUT"
echo "tag=${DEST}" >> "$GITHUB_OUTPUT"

echo "✅ Promoção concluída!"
echo "   Digest: ${DIGEST}"
