# Docker Cosign Sign

Esta action instala o Cosign e realiza a assinatura digital de uma imagem Docker utilizando o fluxo Keyless (baseado em OIDC).

## Requisitos

> [!IMPORTANT]
> - **Permissões:** O job deve ter as permissões `id-token: write` e `contents: read` para que o fluxo Keyless funcione.
> - **Autenticação:** O runner deve estar autenticado no registro de imagens para realizar a assinatura (ex: via `docker-login`).

## Entradas

| Nome        | Descrição                                                                    | Obrigatório |
| :---------- | :--------------------------------------------------------------------------- | :---------- |
| `image_ref` | Referência da imagem com o digest (ex: `ghcr.io/user/repo@sha256:abcdef...`) | Sim         |

## Saídas

| Nome     | Descrição                                         |
| :------- | :------------------------------------------------ |
| `signed` | `true` se a assinatura foi realizada com sucesso. |

## Exemplo de Uso

```yaml
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Login Docker
        uses: ./.github/actions/docker-login
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Cosign Sign
        uses: ./.github/actions/docker-cosign-sign
        with:
          image_ref: ${{ steps.image.outputs.name }}@${{ steps.publish.outputs.digest }}
```
