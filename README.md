# .github

Repositório que hospeda arquivos padrão e configurações compartilhadas da organização.

## Configurações do Renovate

- **[`renovate-config-android.json5`](./renovate-config-android.json5)**: Configuração do Renovate para projetos nativos Android (Gradle, AGP, Jetpack Compose, Kotlin, GitHub Actions).
- **[`renovate-config-docker-base.json5`](./renovate-config-docker-base.json5)**: Configuração base do Renovate para projetos Docker (gerenciador `dockerfile`).
- **[`renovate-config-docker-android.json5`](./renovate-config-docker-android.json5)**: Configuração do Renovate para imagens Docker Android (estende `renovate-config-docker-base.json5`, habilita `custom.regex`, datasource customizado `android-cmdline-tools` e agrupamento de dependências Ruby & Fastlane).

## Workflows Compartilhados

- **[Docker Android](.github/workflows/README.md)**: Workflow completo para build, scan e publicação de imagens Docker Android.

## Actions Compartilhadas

- **[Docker Login](.github/actions/docker-login)**: Realiza login no Docker Hub e GHCR (GitHub Container Registry).
- **[Docker Image Exists](.github/actions/docker-image-exists)**: Verifica se uma imagem Docker existe no registro para evitar builds duplicados.
- **[Docker Image Name](.github/actions/docker-image-name)**: Gera o nome da imagem sem o prefixo `docker-` do nome do repositório.
- **[Docker Cosign Sign](.github/actions/docker-cosign-sign)**: Realiza a assinatura digital de imagens Docker via Cosign (Keyless).
- **[Docker Publish](.github/actions/docker-publish)**: Promove imagens entre registros usando `imagetools` (Registry-side copy).
