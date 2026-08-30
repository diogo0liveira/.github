# Docker Publish

Esta action realiza a promoção de uma imagem Docker do GitHub Container Registry (GHCR) para outro registro (geralmente Docker Hub) utilizando o comando `docker buildx imagetools create`. 

Esta técnica realiza uma **cópia direta no lado do registro (Registry-side Copy)**, o que significa que as camadas da imagem não precisam ser baixadas e enviadas novamente, tornando o processo extremamente rápido e eficiente.

## Entradas

| Nome         | Descrição                             | Obrigatório | Padrão |
|:-------------|:--------------------------------------|:------------|:-------|
| `repository` | Repositório GitHub (ex: `owner/repo`) | Sim         | -      |
| `image`      | Nome da imagem de destino             | Sim         | -      |
| `tag`        | Tag de release (ex: `v1.0.0`)         | Sim         | -      |
| `sha`        | SHA do commit da imagem de origem     | Sim         | -      |

## Saídas

| Nome     | Descrição                                   |
|:---------|:--------------------------------------------|
| `digest` | Digest imutável da imagem publicada         |
| `tag`    | Tag completa da imagem publicada no destino |

## Exemplo de Uso

```yaml
      - name: Publish Docker
        id: publish
        uses: ./.github/actions/docker-publish
        with:
          tag: ${{ needs.release-please.outputs.tag_name }}
          image: ${{ steps.image.outputs.name }}
          repository: ${{ github.repository }}
          sha: ${{ github.sha }}
```
