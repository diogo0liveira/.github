# Docker Login

Login to Docker Hub and GitHub Container Registry.

## Inputs

| Nome           | Descrição        | Obrigatório | Padrão                 |
| :------------- | :--------------- | :---------- | :--------------------- |
| `github_actor` | GHCR Actor       | Não         | `${{ github.actor }}`  |
| `github_token` | GHCR Token       | Não         | -                      |
| `docker_user`  | Docker Hub User  | Não         | -                      |
| `docker_token` | Docker Hub Token | Não         | -                      |

## Uso

### Login no Docker Hub e GHCR

```yaml
steps:
  - name: Login to Registries
    uses: ./.github/actions/docker-login
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      docker_user: ${{ secrets.DOCKER_USERNAME }}
      docker_token: ${{ secrets.DOCKER_PASSWORD }}
```

### Login apenas no GHCR

```yaml
steps:
  - name: Login to GHCR
    uses: ./.github/actions/docker-login
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Login apenas no Docker Hub

```yaml
steps:
  - name: Login apenas no Docker
    uses: ./.github/actions/docker-login
    with:
      docker_user: ${{ secrets.DOCKER_USERNAME }}
      docker_token: ${{ secrets.DOCKER_PASSWORD }}
```
