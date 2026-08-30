# Cleanup Repository

Esta Action realiza uma limpeza profunda no repositório GitHub, removendo artefatos, histórico de execuções, packages, releases, tags e branches obsoletas. É ideal para "resetar" repositórios ou limpar ambientes de desenvolvimento.

> [!CAUTION]
> **ESTA AÇÃO É IRREVERSÍVEL.** Uma vez executada, os dados não podem ser recuperados.

## Entradas

| Nome                   | Descrição                                                                                   | Obrigatório | Padrão                           |
|:-----------------------|:--------------------------------------------------------------------------------------------|:------------|:---------------------------------|
| `token`                | Token de acesso pessoal do GitHub (PAT) com escopos `repo`, `delete:packages` e `workflow`. | Sim         | -                                |
| `clean_history`        | Se deve reescrever o histórico da branch padrão em um único commit.                         | Não         | `'false'`                        |
| `commit_message`       | Mensagem do commit inicial caso o histórico seja limpo.                                     | Não         | `'chore: add project structure'` |
| `delete_caches`        | Se deve remover os caches.                                                                  | Não         | `'true'`                         |
| `delete_actions`       | Se deve remover as execuções de actions.                                                    | Não         | `'true'`                         |
| `delete_packages`      | Se deve remover os packages.                                                                | Não         | `'true'`                         |
| `delete_releases`      | Se deve remover as releases.                                                                | Não         | `'true'`                         |
| `delete_tags`          | Se deve remover as tags.                                                                    | Não         | `'true'`                         |
| `delete_branches`      | Se deve remover as branches obsoletas.                                                      | Não         | `'true'`                         |

## Exemplo de Uso

```yaml
- name: Executar limpeza do repositório
  uses: ./.github/actions/cleanup-repository
  with:
    token: ${{ secrets.CLEANUP_TOKEN }}
    clean_history: 'true'
```
