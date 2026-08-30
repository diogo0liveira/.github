# Docker Image Name

Esta action gera o nome da imagem Docker formatado, removendo o prefixo `docker-` do nome do repositório e concatenando com o usuário do Docker Hub.

## Entradas

| Nome             | Descrição                                                                           | Obrigatório |
| :--------------- | :---------------------------------------------------------------------------------- | :---------- |
| `dockerhub_user` | Usuário do Docker Hub                                                               | Sim         |
| `repo_name`      | Nome do repositório. Se omitido, utiliza o nome do repositório atual (via env var). | Não         |

## Saídas

| Nome   | Descrição                |
| :----- | :----------------------- |
| `name` | Nome formatado da imagem |

## Exemplo de Uso

```yaml
      - name: Image Name
        id: image
        uses: ./.github/actions/docker-image-name
        with:
          dockerhub_user: ${{ secrets.DOCKERHUB_USER }}
```
