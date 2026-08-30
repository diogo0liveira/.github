#!/usr/bin/env bash

set -euo pipefail

# Este script reescreve o histórico da branch principal, criando um commit órfão
# e realizando um force-push para o repositório remoto.

echo "🚀 Iniciando reescrita do histórico para a branch: ${MAIN_BRANCH}"
echo "⚠️  AVISO: Isso fará um force-push para origin/${MAIN_BRANCH} e é irreversível."

# Garantir que os arquivos atuais foram baixados e ver o status
git status --porcelain || true

# Criar uma branch órfã com os conteúdos da árvore atual
echo "🔹 Criando branch órfã temporária..."
git checkout --orphan tmp-clean

# Adicionar todos os arquivos da árvore de trabalho atual
git add -A

# Realizar o commit como um único commit inicial
echo "🔹 Criando novo commit de estrutura do projeto..."
git commit -m "${COMMIT_MESSAGE:-chore: add project structure} [skip ci]" || true

# Force-push da branch órfã para a branch principal de destino
# A URL utiliza o token para autenticação
echo "📤 Fazendo force-push da branch limpa para origin/${MAIN_BRANCH}..."
git push --force "https://${CLEANUP_TOKEN}@github.com/${REPOSITORY}.git" tmp-clean:"${MAIN_BRANCH}"

# Limpeza: retornar para a branch principal local e remover a temporária
git checkout "${MAIN_BRANCH}"
git branch -D tmp-clean || true

echo "✅ Force-push concluído com sucesso."
echo "ℹ️  '${MAIN_BRANCH}' agora aponta para um novo commit único."
