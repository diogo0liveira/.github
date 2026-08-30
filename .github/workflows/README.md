# Workflows Compartilhados

Centralização de workflows reutilizáveis para padronização de CI/CD entre os repositórios da organização.

## Workflows Disponíveis

### [Docker Android](./docker-android.yml)

Workflow robusto para gerenciar o ciclo de vida de imagens Docker Android.

#### Funcionalidades
- **Lint**: Validação de commits (`commitlint`).
- **Build Multi-plataforma**: suporte a `linux/amd64`, `linux/arm64` e `darwin/arm64`.
- **Cache Inteligente**: Uso de `type=gha` para builds rápidos.
- **Segurança**: Scan de vulnerabilidades críticas via Docker Scout.
- **Release Automatizado**: Integração com `release-please`.
- **Assinatura Digital**: Assinatura de imagens via `cosign` (Keyless).

#### Inputs

| Nome                | Descrição                                                               | Obrigatório | Padrão          |
| :------------------ |:------------------------------------------------------------------------| :---------- | :-------------- |
| `image_description` | Descrição da imagem para o label `org.opencontainers.image.description` | **Sim**     | -               |
| `platforms`         | Lista de plataformas para o build                                       | Não         | `linux/amd64`   |

#### Secrets

| Nome                   | Descrição                                                      |
| :--------------------- | :------------------------------------------------------------- |
| `DOCKERHUB_USER`       | Usuário do Docker Hub                                          |
| `DOCKERHUB_TOKEN`      | Token de acesso do Docker Hub                                  |
| `RELEASE_PLEASE_TOKEN` | PAT com permissões de `contents:write` e `pull-requests:write` |

#### Exemplo de Implementação

```yaml
name: CD

on:
  push:
    branches: [main]

jobs:
  docker:
    uses: diogo0liveira/.github/.github/workflows/docker-android.yml@main
    with:
      image_description: "Imagem de build para projetos Android"
      platforms: "linux/amd64,linux/arm64"
    secrets: inherit
```
### [Cleanup Repository](./cleanup-repository.yml)

Workflow para limpeza profunda de repositórios, removendo artefatos de CI e opcionalmente resetando o histórico.

> [!CAUTION]
> As operações deste workflow são **irreversíveis**. A execução é estritamente manual via `workflow_dispatch`.

#### Funcionalidades
- **Caches**: Remove todos os caches do GitHub Actions.
- **Packages**: Remove packages associados ao repositório (Container, NPM, Maven, etc).
- **Releases & Tags**: Exclui todas as releases e tags de versão.
- **Branches**: Remove todas as branches remotas, mantendo apenas a branch padrão.
- **Actions**: Exclui todo o histórico de execuções de actions (logs e artefatos).
- **Reset de Histórico**: Opcionalmente substitui todo o histórico da branch principal por um único commit inicial ("factory reset").

#### Inputs

| Nome                   | Descrição                                          | Obrigatório | Padrão                         |
|:-----------------------|:---------------------------------------------------|:------------|:-------------------------------|
| `clean_history`        | Reescrever o histórico da branch principal (Reset) | Não         | `false`                        |
| `commit_message`       | Mensagem do commit inicial (opcional)              | Não         | `chore: add project structure` |
| `delete_caches`        | Remover caches do GitHub Actions                   | Não         | `true`                         |
| `delete_actions`       | Remover histórico de execuções                     | Não         | `true`                         |
| `delete_packages`      | Remover packages do GitHub Packages                | Não         | `true`                         |
| `delete_releases`      | Remover todas as releases                          | Não         | `true`                         |
| `delete_tags`          | Remover todas as tags do repositório               | Não         | `true`                         |
| `delete_branches`      | Remover branches remotas obsoletas                 | Não         | `true`                         |

#### Secrets

| Nome            | Descrição                                                                        |
| :-------------- |:---------------------------------------------------------------------------------|
| `CLEANUP_TOKEN` | PAT (Personal Access Token) com escopos `repo`, `delete:packages` e `workflow`.  |

#### Exemplo de Implementação

```yaml
name: Maintenance

on:
  workflow_dispatch:
    inputs:
      clean_history:
        description: 'Resetar histórico?'
        type: boolean
        default: false
      commit_message:
        description: 'Mensagem do commit?'
        type: string
        default: 'chore: add project structure'
      delete_caches:
        description: 'Remover caches?'
        type: boolean
        default: true
      delete_actions:
        description: 'Remover execuções?'
        type: boolean
        default: true
      delete_packages:
        description: 'Remover packages?'
        type: boolean
        default: true
      delete_releases:
        description: 'Remover releases?'
        type: boolean
        default: true
      delete_tags:
        description: 'Remover tags?'
        type: boolean
        default: true
      delete_branches:
        description: 'Remover branches?'
        type: boolean
        default: true

jobs:
  cleanup:
    uses: diogo0liveira/.github/.github/workflows/cleanup-repository.yml@main
    with:
      clean_history: ${{ inputs.clean_history }}
      commit_message: ${{ inputs.commit_message }}
      delete_caches: ${{ inputs.delete_caches }}
      delete_actions: ${{ inputs.delete_actions }}
      delete_packages: ${{ inputs.delete_packages }}
      delete_releases: ${{ inputs.delete_releases }}
      delete_tags: ${{ inputs.delete_tags }}
      delete_branches: ${{ inputs.delete_branches }}
    secrets:
      CLEANUP_TOKEN: ${{ secrets.CLEANUP_TOKEN }}
```