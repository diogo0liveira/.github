# Docker Image Exists

Esta action verifica se uma imagem Docker específica já existe no registro.

## Requisitos

> [!IMPORTANT]
> - **Docker CLI:** Esta action utiliza `docker manifest inspect`. O runner deve ter o Docker instalado e o daemon em execução (padrão em runners GitHub-hosted).
> - **Autenticação:** Para registros privados (ex: GHCR, Docker Hub privado), você **deve** realizar o login antes de chamar esta action (ex: usando a action `docker-login`).

## Entradas

| Nome        | Descrição                                                            | Obrigatório |
| :---------- | :------------------------------------------------------------------- | :---------- |
| `image_ref` | Referência completa da imagem Docker (ex: `my-repo/my-image:latest`) | Sim         |

## Saídas

| Nome     | Descrição                                                                                        |
| :------- | :----------------------------------------------------------------------------------------------- |
| `exists` | Retorna `true` se a imagem for encontrada no registro, caso contrário, retorna uma string vazia. |

## Exemplo de Uso

```yaml
      - name: Login Docker
        uses: ./.github/actions/docker-login
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Verificar se a imagem já existe
        uses: ./.github/actions/docker-image-exists
        id: cache-check
        with:
          image_ref: ghcr.io/${{ github.repository }}:latest

      - name: Build
        if: steps.cache-check.outputs.exists != 'true'
        run: docker build .
```
