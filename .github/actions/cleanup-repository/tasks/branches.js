module.exports = async ({ github, owner, repo, core }) => {
  core.startGroup('🌿 Gerenciamento de Branches');

  try {
    // 1. Obter a branch padrão do repositório
    const { data: repository } = await github.rest.repos.get({
      owner,
      repo,
    });
    const defaultBranch = repository.default_branch;
    core.info(`Branch padrão identificada: ${defaultBranch}`);

    // 2. Listar todas as branches
    const branches = await github.paginate(github.rest.repos.listBranches, {
      owner,
      repo,
      per_page: 100,
    });

    core.info(`Encontradas ${branches.length} branches`);

    // 3. Deletar branches que não são a padrão
    for (const branch of branches) {
      if (branch.name === defaultBranch) {
        core.info(`  ℹ️ Mantendo branch padrão: ${branch.name}`);
        continue;
      }

      core.info(`  🗑️ Excluindo branch: ${branch.name}`);
      try {
        await github.rest.git.deleteRef({
          owner,
          repo,
          ref: `heads/${branch.name}`,
        });
        core.info(`    ✅ Sucesso`);
      } catch (err) {
        core.error(`    ❌ Erro ao excluir branch ${branch.name}: ${err.message}`);
      }
    }
  } catch (err) {
    core.warning(`⚠️ Falha ao processar branches: ${err.message}`);
  }

  core.endGroup();
};
