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

| Nome                | Descrição                                                              | Obrigatório | Padrão          |
| :------------------ | :--------------------------------------------------------------------- | :---------- | :-------------- |
| `image_description` | Descrição da imagem para o label `org.opencontainers.image.description` | **Sim**     | -               |
| `platforms`         | Lista de plataformas para o build                                      | Não         | `linux/amd64`   |

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
