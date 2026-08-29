#!/usr/bin/env bash
set -euo pipefail

# Argumentos:
# $1: Nome do repositório (ex: github.event.repository.name)
# $2: Usuário do Docker Hub (ex: secrets.DOCKERHUB_USER)

REPO_NAME="${1:-}"
DOCKERHUB_USER="${2:-}"

if [[ -z "$REPO_NAME" || -z "$DOCKERHUB_USER" ]]; then
  echo "Erro: Argumentos obrigatórios ausentes (REPO_NAME ou DOCKERHUB_USER)" >&2
  exit 1
fi

# Remove o prefixo 'docker-' do nome do repositório
CLEAN_NAME="${REPO_NAME#docker-}"

IMAGE_NAME="${DOCKERHUB_USER}/${CLEAN_NAME}"
echo "name=$IMAGE_NAME" >> "$GITHUB_OUTPUT"
echo "📦 Name: $IMAGE_NAME"
