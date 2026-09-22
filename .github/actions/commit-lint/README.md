# Commit Lint

Validação de mensagens de commit utilizando o `commitlint` (`wagoid/commitlint-github-action`).

Esta action utiliza por padrão um arquivo de configuração `commitlintrc.json` base embutido na própria action (seguindo o padrão `@commitlint/config-conventional`), mas permite especificar outro arquivo de configuração ou utilizar o `.github/commitlintrc.json` do repositório consumidor quando este existir.

## Inputs

| Nome          | Descrição                                                                                                                               | Obrigatório | Padrão                      |
|:--------------|:----------------------------------------------------------------------------------------------------------------------------------------|:------------|:----------------------------|
| `config-file` | Caminho do arquivo de configuração no repositório consumidor. Se não existir ou omitido, utiliza a configuração base da própria action. | Não         | `.github/commitlintrc.json` |

## Configuração Padrão (`commitlintrc.json`)

Caso o repositório não especifique um arquivo de configuração customizado, a action utiliza a seguinte configuração base:

```json
{
  "extends": [
    "@commitlint/config-conventional"
  ]
}
```

## Uso

### 1. Uso padrão (utiliza a configuração base da action ou `.github/commitlintrc.json` se existir)

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v7.0.1
    with:
      fetch-depth: 0

  - name: Validate Commits
    uses: diogo0liveira/.github/.github/actions/commit-lint@main
```

### 2. Especificando um arquivo de configuração customizado

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v7.0.1
    with:
      fetch-depth: 0

  - name: Validate Commits
    uses: diogo0liveira/.github/.github/actions/commit-lint@main
    with:
      config-file: 'custom-commitlint.json'
```
